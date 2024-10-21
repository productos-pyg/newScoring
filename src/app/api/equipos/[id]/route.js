import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Equipo from '@/models/Equipo';

export async function GET(request, { params }) {
  await dbConnect();
  const equipo = await Equipo.findById(params.id).populate('reto', 'nombre');
  if (!equipo) {
    return NextResponse.json({ error: 'Equipo no encontrado' }, { status: 404 });
  }
  return NextResponse.json(equipo);
}

export async function PUT(request, { params }) {
  await dbConnect();
  const body = await request.json();
  const equipo = await Equipo.findByIdAndUpdate(params.id, body, { new: true, runValidators: true }).populate('reto', 'nombre');
  if (!equipo) {
    return NextResponse.json({ error: 'Equipo no encontrado' }, { status: 404 });
  }
  return NextResponse.json(equipo);
}

export async function DELETE(request, { params }) {
  await dbConnect();
  const equipo = await Equipo.findByIdAndDelete(params.id);
  if (!equipo) {
    return NextResponse.json({ error: 'Equipo no encontrado' }, { status: 404 });
  }
  return NextResponse.json({ message: 'Equipo eliminado exitosamente' });
}