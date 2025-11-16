import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  loginAttempts: number;
  lockedUntil?: Date;
  image?: string;
}

// Base de datos en memoria 
let users: User[] = [];

// Almacenar intentos de login por email
const loginAttempts = new Map<string, { count: number; lockedUntil?: Date }>();

export const findUserByEmail = (email: string): User | undefined => {
  return users.find(user => user.email === email);
};

export const createUser = async (email: string, password: string, name: string): Promise<User> => {
  const existingUser = findUserByEmail(email);
  if (existingUser) {
    throw new Error('El usuario ya existe');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  
  const newUser: User = {
    id: Date.now().toString(),
    email,
    name,
    password: hashedPassword,
    loginAttempts: 0,
  };

  users.push(newUser);
  
  console.log('Usuario creado:', { email, name });
  console.log('Total usuarios en memoria:', users.length);
  
  return newUser;
};

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

export const checkLoginAttempts = (email: string): { isLocked: boolean; remainingTime?: number } => {
  const attempts = loginAttempts.get(email);
  
  if (!attempts) {
    return { isLocked: false };
  }

  if (attempts.lockedUntil) {
    const now = new Date();
    if (now < attempts.lockedUntil) {
      const remainingTime = Math.ceil((attempts.lockedUntil.getTime() - now.getTime()) / 1000);
      return { isLocked: true, remainingTime };
    } else {
      // El bloqueo ha expirado
      loginAttempts.delete(email);
      return { isLocked: false };
    }
  }

  return { isLocked: false };
};

export const recordFailedAttempt = (email: string): void => {
  const attempts = loginAttempts.get(email) || { count: 0 };
  attempts.count += 1;

  // Bloquear después de 3 intentos fallidos por 5 minutos
  if (attempts.count >= 3) {
    const lockDuration = 5 * 60 * 1000; 
    attempts.lockedUntil = new Date(Date.now() + lockDuration);
  }

  loginAttempts.set(email, attempts);
  console.log(`Intento fallido para ${email}. Total intentos: ${attempts.count}`);
};

export const resetLoginAttempts = (email: string): void => {
  loginAttempts.delete(email);
  console.log(`Intentos de login reseteados para ${email}`);
};