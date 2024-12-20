// src/app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateUser } from '@/lib/auth';

export async function POST(req) {
  try {
    const body = await req.json();
    const user = validateUser(body.username, body.password);

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    const session = {
      role: user.role,
      username: user.username
    };

    // Modificamos las opciones de la cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 horas
      path: '/' // Añadimos esta línea
    };

    // Crear la respuesta
    const response = NextResponse.json(session);
    
    // Establecer la cookie en la respuesta
    response.cookies.set('auth', JSON.stringify(session), cookieOptions);

    return response;
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    );
  }
}