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

  const session = JSON.parse(authSession.value);

  // Rutas específicas de jueces
  if (currentPath.startsWith('/jueces')) {
    if (session.role !== 'admin' && session.role !== 'juez') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // NUEVO: Permitir acceso a rutas de resultados para jueces
  if (currentPath.includes('/resultados') || currentPath.includes('/brackets')) {
    if (session.role === 'admin' || session.role === 'juez') {
      return NextResponse.next();
    }
  }

  // Resto de rutas administrativas (solo admin)
  if (currentPath.startsWith('/torneos') || 
      currentPath.startsWith('/retos') || 
      currentPath.startsWith('/equipos')) {
    if (session.role !== 'admin') {
      // Si es juez, redirigir a su panel
      if (session.role === 'juez') {
        return NextResponse.redirect(new URL('/jueces', request.url));
      }
      // Si no es ni admin ni juez, redirigir a login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};