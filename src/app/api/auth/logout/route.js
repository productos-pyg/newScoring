// src/app/api/auth/logout/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  cookies().delete('auth');
  return NextResponse.json({ message: 'Sesión cerrada' });
}