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

    // Buscar o crear calificación
    let calificacionExistente = await Calificacion.findOne({
      equipo: body.equipoId,
      reto: reto._id,
      emparejamiento: body.emparejamientoId
    });

    if (!calificacionExistente) {
      calificacionExistente = new Calificacion({
        equipo: body.equipoId,
        reto: reto._id,
        juez: body.juezId,
        emparejamiento: body.emparejamientoId,
        intentos: []
      });
    }

    // Validar número de intentos
    if (calificacionExistente.intentos.length >= 2) {
      return NextResponse.json(
        { error: 'Ya se han realizado los dos intentos permitidos' },
        { status: 400 }
      );
    }

    // Añadir el nuevo intento
    calificacionExistente.intentos.push(...body.intentos);
    await calificacionExistente.save();

    // Actualizar el emparejamiento con la referencia
    if (emparejamiento.equipo1.toString() === body.equipoId) {
      emparejamiento.calificacionEquipo1 = calificacionExistente._id;
    } else {
      emparejamiento.calificacionEquipo2 = calificacionExistente._id;
    }

    // Verificar empates y ganador
    if (emparejamiento.calificacionEquipo1 && emparejamiento.calificacionEquipo2) {
      const cal1 = await Calificacion.findById(emparejamiento.calificacionEquipo1);
      const cal2 = await Calificacion.findById(emparejamiento.calificacionEquipo2);

      const ultimoPuntaje1 = cal1.intentos[cal1.intentos.length - 1].puntuacion;
      const ultimoPuntaje2 = cal2.intentos[cal2.intentos.length - 1].puntuacion;

      // Primer intento y empate
      if (cal1.intentos.length === 1 && cal2.intentos.length === 1 && ultimoPuntaje1 === ultimoPuntaje2) {
        emparejamiento.empate = true;
        emparejamiento.requiereSegundoIntento = true;
        emparejamiento.ganador = null;
      } 
      // Segundo intento y empate
      else if (cal1.intentos.length === 2 && cal2.intentos.length === 2 && ultimoPuntaje1 === ultimoPuntaje2) {
        emparejamiento.empate = true;
        emparejamiento.requiereDecisionManual = true;
        emparejamiento.requiereSegundoIntento = false;
        emparejamiento.ganador = null;
      }
      // Hay un ganador
      else if (cal1.intentos.length === cal2.intentos.length) {
        emparejamiento.ganador = ultimoPuntaje1 > ultimoPuntaje2 ? 
          emparejamiento.equipo1 : emparejamiento.equipo2;
        emparejamiento.empate = false;
        emparejamiento.requiereSegundoIntento = false;
        emparejamiento.requiereDecisionManual = false;
      }
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