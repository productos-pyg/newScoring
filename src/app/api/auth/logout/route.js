// src/app/api/auth/logout/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  // Crear respuesta
  const response = NextResponse.json({ message: 'Sesión cerrada' });

  // Eliminar la cookie
  response.cookies.delete('auth');

  return response;
}