// src/middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const authSession = request.cookies.get('auth');
  const publicUrls = ['/login', '/public'];
  const currentPath = request.nextUrl.pathname;

  // Log para debug
  console.log('Path:', currentPath);
  console.log('Cookie:', authSession);

  // Permitir acceso a rutas públicas
  if (publicUrls.some(url => currentPath.startsWith(url))) {
    return NextResponse.next();
  }

  // Redirigir a login si no hay sesión
  if (!authSession) {
    console.log('No hay sesión, redirigiendo a login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const session = JSON.parse(authSession.value);
    console.log('Sesión:', session);

    // Rutas específicas de jueces
    if (currentPath.startsWith('/jueces')) {
      if (session.role !== 'admin' && session.role !== 'juez') {
        console.log('No autorizado para /jueces');
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }

    // Permitir acceso a rutas de resultados para jueces
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
        console.log('No es admin, redirigiendo');
        if (session.role === 'juez') {
          return NextResponse.redirect(new URL('/jueces', request.url));
        }
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Error en middleware:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};