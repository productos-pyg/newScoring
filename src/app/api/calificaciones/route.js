//src/app/api/calificiones/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Calificacion from '@/models/Calificacion';

export async function GET(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const equipoId = searchParams.get('equipoId');
  const retoId = searchParams.get('retoId');
  
  try {
    let calificacion = await Calificacion.findOne({ equipo: equipoId, reto: retoId });
    
    if (!calificacion) {
      // Si no existe una calificación, creamos una nueva sin juez
      calificacion = new Calificacion({
        equipo: equipoId,
        reto: retoId,
        intentos: [],
        puntuacionTotal: 0
      });
      // No guardamos la calificación aquí, solo la devolvemos
    }
    
    return NextResponse.json(calificacion);
  } catch (error) {
    console.error('Error al obtener calificación:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  await dbConnect();
  try {
    const body = await request.json();
    let calificacion = await Calificacion.findOne({ equipo: body.equipo, reto: body.reto });

    if (!calificacion) {
      calificacion = new Calificacion({
        equipo: body.equipo,
        reto: body.reto,
        juez: body.juez,
        intentos: [],
        puntuacionTotal: 0
      });
    }

    // Añadir el nuevo intento
    calificacion.intentos.push({
      numero: body.intentos[body.intentos.length - 1].numero,
      puntuacion: body.intentos[body.intentos.length - 1].puntuacion,
      detallesTareas: body.intentos[body.intentos.length - 1].detallesTareas,
      tiempoUtilizado: body.intentos[body.intentos.length - 1].tiempoUtilizado,
      noRealizado: body.intentos[body.intentos.length - 1].noRealizado || false
    });

    // Actualizar la puntuación total
    calificacion.puntuacionTotal = body.puntuacionTotal;

    await calificacion.save();
    return NextResponse.json(calificacion, { status: 201 });
  } catch (error) {
    console.error('Error en el servidor:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

/* export async function POST(request) {
  await dbConnect();
  try {
    const body = await request.json();
    let calificacion = await Calificacion.findOne({ equipo: body.equipo, reto: body.reto });
    
    if (!calificacion) {
      calificacion = new Calificacion({
        equipo: body.equipo,
        reto: body.reto,
        juez: body.juez,
        intentos: [],
        puntuacionTotal: 0
      });
    }
    
    calificacion.intentos.push({
      numero: body.numero,
      puntuacion: body.puntuacion,
      detallesTareas: body.detallesTareas,
      tiempoUtilizado: body.tiempoUtilizado,
      noRealizado: body.noRealizado || false
    });
    
    // Recalcular puntuación total
    calificacion.puntuacionTotal = calificacion.intentos.reduce((total, intento) => total + intento.puntuacion, 0);
    
    await calificacion.save();
    return NextResponse.json(calificacion, { status: 201 });
  } catch (error) {
    console.error('Error en el servidor:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
} */