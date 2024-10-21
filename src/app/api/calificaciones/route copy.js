import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Calificacion from '@/models/Calificacion';
import Usuario from '@/models/Usuario';

export async function GET(request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const retoId = searchParams.get('retoId');
    
    console.log('Buscando calificaciones para el reto:', retoId);
    console.log('Nombre de la colección:', Calificacion.collection.name);

    const query = retoId ? { reto: retoId } : {};
    const calificaciones = await Calificacion.find(query)
      .populate('equipo', 'nombre')
      .populate('reto', 'nombre')
      .populate('juez', 'nombre');

    console.log('Calificaciones encontradas:', calificaciones.length);

    return NextResponse.json(calificaciones);
  } catch (error) {
    console.error('Error al obtener calificaciones:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  await dbConnect();
  try {
    const body = await request.json();
    console.log('Datos recibidos en el servidor:', body);
    const calificacion = await Calificacion.create(body);
    return NextResponse.json(calificacion, { status: 201 });
  } catch (error) {
    console.error('Error en el servidor:', error);
    return NextResponse.json({ error: error.message, details: error }, { status: 400 });
  }
}
