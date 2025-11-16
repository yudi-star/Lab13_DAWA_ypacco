import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { findUserByEmail, verifyPassword, checkLoginAttempts, recordFailedAttempt, resetLoginAttempts } from "@/lib/users";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "tu@email.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Por favor ingrese email y contraseña');
        }

        // Verificar si la cuenta está bloqueada
        const lockStatus = checkLoginAttempts(credentials.email);
        if (lockStatus.isLocked) {
          throw new Error(`Cuenta bloqueada. Intente nuevamente en ${lockStatus.remainingTime} segundos`);
        }

        // Buscar usuario
        const user = findUserByEmail(credentials.email);
        if (!user) {
          recordFailedAttempt(credentials.email);
          throw new Error('Credenciales inválidas');
        }

        // Verificar contraseña
        const isValidPassword = await verifyPassword(credentials.password, user.password);
        if (!isValidPassword) {
          recordFailedAttempt(credentials.email);
          const attempts = checkLoginAttempts(credentials.email);
          if (attempts.isLocked) {
            throw new Error(`Demasiados intentos fallidos. Cuenta bloqueada por ${attempts.remainingTime} segundos`);
          }
          throw new Error('Credenciales inválidas');
        }

        // Login exitoso y resetear intentos
        resetLoginAttempts(credentials.email);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image
        };
      }
    })
  ],

  pages: {
    signIn: '/signin',   
  },

  session: {
    strategy: "jwt" as const,
  },

  callbacks: {
    async jwt({ token, user, account }: any) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.image = token.picture;
      }
      return session;
    }
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };