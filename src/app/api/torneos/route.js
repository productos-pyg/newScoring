import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Torneo from "@/models/Torneo";

export async function GET() {
  await dbConnect();
  const torneos = await Torneo.find({});
  return NextResponse.json(torneos);
}

export async function POST(request) {
  await dbConnect();
  try {
    const body = await request.json();
    const torneo = await Torneo.create(body);
    return NextResponse.json(torneo, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
