//src/app/api/calificaciones/resultados/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Calificacion from '@/models/Calificacion';

export async function GET(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const retoId = searchParams.get('retoId');
  
  try {
    const calificaciones = await Calificacion.find({ reto: retoId })
      .populate('equipo', 'nombre')
      .populate('reto', 'nombre tipo')
      .lean();

    return NextResponse.json(calificaciones);
  } catch (error) {
    console.error('Error al obtener calificaciones:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}