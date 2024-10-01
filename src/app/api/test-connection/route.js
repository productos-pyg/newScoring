import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";

export async function GET() {
  try {
    await dbConnect();
    return NextResponse.json(
      { message: "Conexión exitosa a MongoDB" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Error al conectar a MongoDB" },
      { status: 500 }
    );
  }
}
