// src/app/api/retos/[id]/calificar-equipo/route.js
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

    // Crear calificación para el equipo
    const calificacion = new Calificacion({
      equipo: body.equipoId,
      reto: reto._id,
      juez: body.juezId,
      intentos: body.intentos
    });
    await calificacion.save();

    // Actualizar el emparejamiento con la calificación
    if (emparejamiento.equipo1.toString() === body.equipoId) {
      emparejamiento.calificacionEquipo1 = calificacion._id;
    } else if (emparejamiento.equipo2.toString() === body.equipoId) {
      emparejamiento.calificacionEquipo2 = calificacion._id;
    }

    // Verificar si ambos equipos tienen calificación para determinar ganador
    if (emparejamiento.calificacionEquipo1 && emparejamiento.calificacionEquipo2) {
      // Obtener ambas calificaciones
      const calificacionEquipo1 = await Calificacion.findById(emparejamiento.calificacionEquipo1);
      const calificacionEquipo2 = await Calificacion.findById(emparejamiento.calificacionEquipo2);

      const puntajeEquipo1 = calificacionEquipo1.intentos[0]?.puntuacion || 0;
      const puntajeEquipo2 = calificacionEquipo2.intentos[0]?.puntuacion || 0;

      if (puntajeEquipo1 !== puntajeEquipo2) {
        // Si hay un ganador claro, actualizarlo
        emparejamiento.ganador = puntajeEquipo1 > puntajeEquipo2 ? 
          emparejamiento.equipo1 : emparejamiento.equipo2;
      }
      // Si hay empate, no se asigna ganador todavía
    }

    await reto.save();

    return NextResponse.json({ 
      message: 'Calificación guardada con éxito',
      emparejamiento
    });
  } catch (error) {
    console.error('Error al calificar equipo:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Endpoint para obtener el estado actual del emparejamiento
export async function GET(request, { params }) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const emparejamientoId = searchParams.get('emparejamientoId');

  try {
    const reto = await Reto.findById(params.id)
      .populate('emparejamientos.equipo1', 'nombre')
      .populate('emparejamientos.equipo2', 'nombre')
      .populate('emparejamientos.calificacionEquipo1')
      .populate('emparejamientos.calificacionEquipo2');

    if (!reto) {
      return NextResponse.json({ error: 'Reto no encontrado' }, { status: 404 });
    }

    const emparejamiento = reto.emparejamientos.id(emparejamientoId);
    if (!emparejamiento) {
      return NextResponse.json({ error: 'Emparejamiento no encontrado' }, { status: 404 });
    }

    return NextResponse.json(emparejamiento);
  } catch (error) {
    console.error('Error al obtener emparejamiento:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}