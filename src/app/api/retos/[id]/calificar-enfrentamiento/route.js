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

    // Crear calificaciones para ambos equipos
    const calificacionEquipo1 = new Calificacion({
      equipo: emparejamiento.equipo1,
      reto: reto._id,
      juez:"66fd725c056f60d8d3c282ec",
      puntuacion: body.puntuaciones.equipo1,
      intentos: [{ puntuacion: body.puntuaciones.equipo1 }]
    });
    await calificacionEquipo1.save();

    const calificacionEquipo2 = new Calificacion({
      equipo: emparejamiento.equipo2,
      reto: reto._id,
      juez:"66fd725c056f60d8d3c282ec",
      puntuacion: body.puntuaciones.equipo2,
      intentos: [{ puntuacion: body.puntuaciones.equipo2 }]
    });
    await calificacionEquipo2.save();

    // Actualizar el emparejamiento con las nuevas calificaciones
    emparejamiento.calificacionEquipo1 = calificacionEquipo1._id;
    emparejamiento.calificacionEquipo2 = calificacionEquipo2._id;
    emparejamiento.ganador = body.puntuaciones.equipo1 > body.puntuaciones.equipo2 ? emparejamiento.equipo1 : emparejamiento.equipo2;

    await reto.save();

    return NextResponse.json({ message: 'Calificación guardada con éxito' });
  } catch (error) {
    console.error('Error al calificar enfrentamiento:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}