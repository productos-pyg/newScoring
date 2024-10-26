//src/app/api/retos/[id]/avanzarFase/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Reto from '@/models/Reto';
import Calificacion from '@/models/Calificacion';

export async function POST(request, { params }) {
  await dbConnect();
  
  try {
    const reto = await Reto.findById(params.id);
    if (!reto) {
      return NextResponse.json({ error: 'Reto no encontrado' }, { status: 404 });
    }

    const calificaciones = await Calificacion.find({ reto: reto._id })
      .populate('equipo', 'nombre')
      .sort({ puntuacionTotal: -1 });

    if (calificaciones.length < 8) {
      return NextResponse.json({ error: 'No hay suficientes equipos para avanzar a la siguiente fase' }, { status: 400 });
    }

    const equiposClasificados = calificaciones.slice(0, 8).map(c => c.equipo);
    
    const emparejamientos = [
      { fase: 'cuartos', equipo1: equiposClasificados[0], equipo2: equiposClasificados[7] },
      { fase: 'cuartos', equipo1: equiposClasificados[1], equipo2: equiposClasificados[6] },
      { fase: 'cuartos', equipo1: equiposClasificados[2], equipo2: equiposClasificados[5] },
      { fase: 'cuartos', equipo1: equiposClasificados[3], equipo2: equiposClasificados[4] },
    ];

    reto.fase = 'cuartos';
    reto.emparejamientos = emparejamientos;
    await reto.save();

    return NextResponse.json({ message: 'Reto avanzado a cuartos de final', reto });
  } catch (error) {
    console.error('Error al avanzar fase:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}