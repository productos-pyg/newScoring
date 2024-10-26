//src/app/api/retos/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Reto from "@/models/Reto";

export async function GET(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const torneoId = searchParams.get("torneoId");

  const query = torneoId ? { torneo: torneoId } : {};
  const retos = await Reto.find(query).populate("torneo", "nombre");
  return NextResponse.json(retos);
}

export async function POST(request) {
  await dbConnect();
  try {
    const body = await request.json();
    const reto = await Reto.create(body);
    return NextResponse.json(reto, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
