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

  // Verificar permisos para la ruta /jueces
  if (currentPath.startsWith('/jueces')) {
    const session = JSON.parse(authSession.value);
    if (session.role !== 'admin' && session.role !== 'juez') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}


export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};