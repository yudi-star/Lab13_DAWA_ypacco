import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import Link from "next/link";
import LogoutButton from "../components/LogoutButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Image from "next/image";
import Provider from "@/components/SessionProvider";

const geistSans = Geist({
  variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({
   variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: "Next Auth App",
  description: "My Next Auth App",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Provider>
          <nav className="w-full bg-black shadow-sm">
            <div className="mx-auto px-6 py-4 flex items-center justify-between text-white">
              <Link href="/" className="text-xl font-semibold">
                MyAuthApp
              </Link>

              <ul className="flex items-center justify-center gap-6 text-sm">
                {!session?.user && (
                  <>
                    <li>
                      <Link href="/signin" className="hover:text-pink-400">
                        Iniciar Sesión
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/register" 
                        className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded transition"
                      >
                        Registrarse
                      </Link>
                    </li>
                  </>
                )}

                {session?.user && (
                  <>
                    <li>
                      <Link href="/dashboard" className="hover:text-pink-400">
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link href="/profile" className="hover:text-pink-400">
                        Profile
                      </Link>
                    </li>
                    <li>
                      <LogoutButton />
                    </li>
                    {session.user.image && (
                      <li>
                        <Image
                          height={40}
                          width={40}
                          src={session.user.image}
                          alt="Profile"
                          className="w-10 h-10 rounded-full"
                        />
                      </li>
                    )}
                  </>
                )}
              </ul>
            </div>
          </nav>

          <main>{children}</main>
        </Provider>
      </body>
    </html>
  );
}