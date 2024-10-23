// src/app/api/retos/[id]/avanzarFinal/route.js

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

    // Verificar que todas las semifinales tengan ganador
    const todosCalificados = reto.emparejamientos.every(emp => emp.ganador);
    if (!todosCalificados) {
      return NextResponse.json(
        { error: 'No se puede avanzar a la final hasta que todas las semifinales estén calificadas' },
        { status: 400 }
      );
    }

    // Obtener ganadores y perdedores de las semifinales
    const semifinal1 = reto.emparejamientos[0];
    const semifinal2 = reto.emparejamientos[1];

    const ganadorSemi1 = semifinal1.ganador;
    const ganadorSemi2 = semifinal2.ganador;
    
    // Los perdedores son los equipos que no son ganadores en cada semifinal
    const perdedorSemi1 = semifinal1.equipo1._id.toString() === ganadorSemi1.toString() 
      ? semifinal1.equipo2 
      : semifinal1.equipo1;
    const perdedorSemi2 = semifinal2.equipo1._id.toString() === ganadorSemi2.toString() 
      ? semifinal2.equipo2 
      : semifinal2.equipo1;

    // Crear los nuevos emparejamientos para la final y tercer puesto
    const emparejamientosFinales = [
      {
        fase: 'final',
        equipo1: ganadorSemi1,
        equipo2: ganadorSemi2,
        tipo: 'final'
      },
      {
        fase: 'final',
        equipo1: perdedorSemi1,
        equipo2: perdedorSemi2,
        tipo: 'tercerPuesto'
      }
    ];

    // Actualizar el reto
    reto.fase = 'final';
    reto.emparejamientos = emparejamientosFinales;

    await reto.save();

    return NextResponse.json({ 
      message: 'Reto avanzado a fase final',
      reto 
    });

  } catch (error) {
    console.error('Error al avanzar a la final:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}