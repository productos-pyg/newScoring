// src/app/api/retos/[id]/avanzarSemifinal/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Reto from '@/models/Reto';

export async function POST(request, { params }) {
  await dbConnect();

  try {
    const reto = await Reto.findById(params.id);
    if (!reto) {
      return NextResponse.json({ error: 'Reto no encontrado' }, { status: 404 });
    }

    // Verificar que todos los enfrentamientos de cuartos tengan ganador
    const todosCalificados = reto.emparejamientos.every(emp => emp.ganador);
    if (!todosCalificados) {
      return NextResponse.json(
        { error: 'No se pueden crear las semifinales hasta que todos los cuartos estén calificados' },
        { status: 400 }
      );
    }

    // Obtener los ganadores de cada llave de cuartos
    const ganadores = reto.emparejamientos.map(emp => ({
      equipo: emp.ganador,
      llave: emp._id
    }));

    // Crear los nuevos emparejamientos para semifinales
    // Llave1 vs Llave4, Llave2 vs Llave3
    const emparejamientosSemis = [
      {
        fase: 'semifinal',
        equipo1: ganadores[0].equipo, // Ganador Llave 1
        equipo2: ganadores[3].equipo, // Ganador Llave 4
      },
      {
        fase: 'semifinal',
        equipo1: ganadores[1].equipo, // Ganador Llave 2
        equipo2: ganadores[2].equipo, // Ganador Llave 3
      }
    ];

    // Actualizar el reto con los nuevos emparejamientos y la nueva fase
    reto.fase = 'semifinal';
    reto.emparejamientos = emparejamientosSemis;

    await reto.save();

    return NextResponse.json({ 
      message: 'Reto avanzado a semifinales',
      reto 
    });

  } catch (error) {
    console.error('Error al avanzar a semifinales:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}