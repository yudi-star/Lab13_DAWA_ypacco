import { NextResponse } from 'next/server';
import { createUser } from '@/lib/users';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    // Validaciones
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Valida formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Crea usuario
    const user = await createUser(email, password, name);

    return NextResponse.json(
      { 
        message: 'Usuario registrado exitosamente',
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error en registro:', error);
    
    if (error.message === 'El usuario ya existe') {
      return NextResponse.json(
        { error: 'Este email ya está registrado' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Error al registrar usuario' },
      { status: 500 }
    );
  }
}