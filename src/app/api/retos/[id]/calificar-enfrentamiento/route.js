// src/app/api/retos/[id]/calificar-enfrentamiento/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Reto from '@/models/Reto';
import Calificacion from '@/models/Calificacion';

export async function POST(request, { params }) {
  await dbConnect();
  const body = await request.json();

  try {
    const reto = await Reto.findById(params.id);
    if (!reto) {
      return NextResponse.json({ error: 'Reto no encontrado' }, { status: 404 });
    }

    const emparejamiento = reto.emparejamientos.id(body.emparejamientoId);
    if (!emparejamiento) {
      return NextResponse.json({ error: 'Emparejamiento no encontrado' }, { status: 404 });
    }

    // Crear calificaciones para equipo 1
    const calificacionEquipo1 = new Calificacion({
      equipo: emparejamiento.equipo1,
      reto: reto._id,
      juez: "66fd725c056f60d8d3c282ec", // Pendiente: implementar sistema de autenticación
      intentos: body.intentosEquipo1
    });
    await calificacionEquipo1.save();

    // Crear calificaciones para equipo 2
    const calificacionEquipo2 = new Calificacion({
      equipo: emparejamiento.equipo2,
      reto: reto._id,
      juez: "66fd725c056f60d8d3c282ec", // Pendiente: implementar sistema de autenticación
      intentos: body.intentosEquipo2
    });
    await calificacionEquipo2.save();

    // Actualizar el emparejamiento
    emparejamiento.calificacionEquipo1 = calificacionEquipo1._id;
    emparejamiento.calificacionEquipo2 = calificacionEquipo2._id;
    emparejamiento.ganador = body.ganador;

    await reto.save();

    return NextResponse.json({ 
      message: 'Calificación guardada con éxito',
      ganador: body.ganador 
    });
  } catch (error) {
    console.error('Error al calificar enfrentamiento:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}