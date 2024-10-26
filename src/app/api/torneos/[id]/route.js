//src/app/api/torneos/[id]/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Torneo from "@/models/Torneo";

export async function GET(request, { params }) {
  await dbConnect();
  const torneo = await Torneo.findById(params.id);
  if (!torneo) {
    return NextResponse.json(
      { error: "Torneo no encontrado" },
      { status: 404 }
    );
  }
  return NextResponse.json(torneo);
}

export async function PUT(request, { params }) {
  await dbConnect();
  const body = await request.json();
  const torneo = await Torneo.findByIdAndUpdate(params.id, body, {
    new: true,
    runValidators: true,
  });
  if (!torneo) {
    return NextResponse.json(
      { error: "Torneo no encontrado" },
      { status: 404 }
    );
  }
  return NextResponse.json(torneo);
}

export async function DELETE(request, { params }) {
  await dbConnect();
  const torneo = await Torneo.findByIdAndDelete(params.id);
  if (!torneo) {
    return NextResponse.json(
      { error: "Torneo no encontrado" },
      { status: 404 }
    );
  }
  return NextResponse.json({ message: "Torneo eliminado exitosamente" });
}
