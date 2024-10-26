//src/app/api/retos/[id]/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Reto from "@/models/Reto";


    export async function GET(request, { params }) {
      await dbConnect();
      try {
        const reto = await Reto.findById(params.id)
          .populate('emparejamientos.equipo1', 'nombre')
          .populate('emparejamientos.equipo2', 'nombre')
          .populate('emparejamientos.calificacionEquipo1')
          .populate('emparejamientos.calificacionEquipo2');
        
        if (!reto) {
          return NextResponse.json({ error: 'Reto no encontrado' }, { status: 404 });
        }
        
        return NextResponse.json(reto);
      } catch (error) {
        console.error('Error al obtener el reto:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

export async function PUT(request, { params }) {
  await dbConnect();
  const body = await request.json();
  const reto = await Reto.findByIdAndUpdate(params.id, body, {
    new: true,
    runValidators: true,
  }).populate("torneo", "nombre");
  if (!reto) {
    return NextResponse.json({ error: "Reto no encontrado" }, { status: 404 });
  }
  return NextResponse.json(reto);
}

export async function DELETE(request, { params }) {
  await dbConnect();
  const reto = await Reto.findByIdAndDelete(params.id);
  if (!reto) {
    return NextResponse.json({ error: "Reto no encontrado" }, { status: 404 });
  }
  return NextResponse.json({ message: "Reto eliminado exitosamente" });
}
