import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Equipo from '@/models/Equipo';

export async function GET(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const retoId = searchParams.get('retoId');
  
  const query = retoId ? { reto: retoId } : {};
  const equipos = await Equipo.find(query).populate('reto', 'nombre');
  return NextResponse.json(equipos);
}

export async function POST(request) {
  await dbConnect();
  try {
    const body = await request.json();
    const equipo = await Equipo.create(body);
    return NextResponse.json(equipo, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}