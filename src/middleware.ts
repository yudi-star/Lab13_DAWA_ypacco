import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });

  const { pathname } = request.nextUrl;

  // Si el usuario no está autenticado y está intentando acceder a rutas protegidas
  if (!token && (pathname.startsWith('/dashboard') || pathname.startsWith('/profile'))) {
    const signInUrl = new URL('/signin', request.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*']
};