// src/app/api/retos/[id]/calificar-equipo/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Reto from '@/models/Reto';
import Calificacion from '@/models/Calificacion';

// Añadimos/corregimos el método GET
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

    // Crear o actualizar calificación para el equipo
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

    // Añadir el nuevo intento
    calificacionExistente.intentos.push(...body.intentos);
    await calificacionExistente.save();

    // Actualizar el emparejamiento con la referencia de la calificación
    if (emparejamiento.equipo1.toString() === body.equipoId) {
      emparejamiento.calificacionEquipo1 = calificacionExistente._id;
    } else {
      emparejamiento.calificacionEquipo2 = calificacionExistente._id;
    }

    // Verificar si ambos equipos tienen calificación para determinar ganador
    if (emparejamiento.calificacionEquipo1 && emparejamiento.calificacionEquipo2) {
      const cal1 = await Calificacion.findById(emparejamiento.calificacionEquipo1);
      const cal2 = await Calificacion.findById(emparejamiento.calificacionEquipo2);
    
      // Obtener última puntuación de cada equipo
      const puntaje1 = cal1.intentos[cal1.intentos.length - 1].puntuacion;
      const puntaje2 = cal2.intentos[cal2.intentos.length - 1].puntuacion;
    
      console.log('Puntuaciones:', { puntaje1, puntaje2 });
    
      // Si es primer intento y hay empate
      if (puntaje1 === puntaje2 && cal1.intentos.length === 1 && cal2.intentos.length === 1) {
        emparejamiento.empate = true;
        emparejamiento.requiereSegundoIntento = true;
        // Resetear cualquier ganador previo
        emparejamiento.ganador = null;
      } 
      // Si no hay empate
      else if (puntaje1 !== puntaje2 && cal1.intentos.length === cal2.intentos.length) {
        emparejamiento.ganador = puntaje1 > puntaje2 ? 
          emparejamiento.equipo1 : emparejamiento.equipo2;
        emparejamiento.empate = false;
        emparejamiento.requiereSegundoIntento = false;
      }
      // Si hay empate en segundo intento
      else if (puntaje1 === puntaje2 && cal1.intentos.length === 2 && cal2.intentos.length === 2) {
        emparejamiento.empate = true;
        emparejamiento.requiereDecisionManual = true;
        emparejamiento.requiereSegundoIntento = false;
        // Resetear cualquier ganador previo
        emparejamiento.ganador = null;
      }
    
      // Guardar el estado actualizado
      await reto.save();
    }

    await reto.save();

    return NextResponse.json({ 
      message: 'Calificación guardada con éxito',
      emparejamiento,
      requiereSegundoIntento: emparejamiento.requiereSegundoIntento,
      requiereDecisionManual: emparejamiento.requiereDecisionManual
    });
  } catch (error) {
    console.error('Error al calificar equipo:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}