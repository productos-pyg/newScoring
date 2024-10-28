// src/middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const authSession = request.cookies.get('auth');
  const publicUrls = ['/login', '/public'];
  const currentPath = request.nextUrl.pathname;

  // Permitir acceso a rutas públicas
  if (publicUrls.some(url => currentPath.startsWith(url))) {
    return NextResponse.next();
  }

  // Redirigir a login si no hay sesión
  if (!authSession) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const session = JSON.parse(authSession.value);

    // Si es admin, permitir acceso a todo
    if (session.role === 'admin') {
      return NextResponse.next();
    }

    // Si es juez
    if (session.role === 'juez') {
      // Permitir acceso a rutas de jueces
      if (currentPath.startsWith('/jueces')) {
        return NextResponse.next();
      }

      // Permitir acceso a resultados/brackets
      if (currentPath.includes('/resultados') || currentPath.includes('/brackets')) {
        return NextResponse.next();
      }

      // Para cualquier otra ruta, redirigir a /jueces
      return NextResponse.redirect(new URL('/jueces', request.url));
    }

    // Si no es ni admin ni juez, redirigir a login
    return NextResponse.redirect(new URL('/login', request.url));
    
  } catch (error) {
    console.error('Error en middleware:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};