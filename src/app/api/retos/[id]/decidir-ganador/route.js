// src/app/api/retos/[id]/decidir-ganador/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Reto from '@/models/Reto';

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

    // Solo permitir decisión manual si hay empate persistente
    if (!emparejamiento.requiereDecisionManual) {
      return NextResponse.json(
        { error: 'Este emparejamiento no requiere decisión manual' }, 
        { status: 400 }
      );
    }

    emparejamiento.ganador = body.ganadorId;
    emparejamiento.decisionManual = true;
    emparejamiento.empate = false;
    emparejamiento.requiereDecisionManual = false;

    await reto.save();

    return NextResponse.json({ 
      message: 'Ganador decidido manualmente',
      emparejamiento 
    });
  } catch (error) {
    console.error('Error al decidir ganador:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}