//src/app/torneos/page.jsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

export default function TorneosPage() {
  const [torneos, setTorneos] = useState([]);

  useEffect(() => {
    const fetchTorneos = async () => {
      const res = await axios.get("/api/torneos");
      setTorneos(res.data);
    };
    fetchTorneos();
  }, []);

  return (
    <div className="container mx-auto p-4 bg-slate-50 mt-4 rounded-md shadow-2xl h-[85vh] overflow-y-auto">
      <h1 className="text-2xl font-bold mb-4">Torneos</h1>
      <Link
        href="/torneos/crear"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Crear Torneo
      </Link>
      <ul className="mt-4">
        {torneos.map((torneo) => (
          <li key={torneo._id} className="border p-4 mb-2 rounded shadow-md">
            <h2 className="text-xl">{torneo.nombre}</h2>
            <div className="flex justify-between">
              <p>
                Fecha de inicio:{" "}
                {new Date(torneo.fechaInicio).toLocaleDateString()}
              </p>
              <p>
                Fecha de fin: {new Date(torneo.fechaFin).toLocaleDateString()}
              </p>
            </div>
            <div className="flex justify-between">
              <p>Estado: {torneo.estado}</p>
              <Link href={`/torneos/${torneo._id}`} className="bg-[#1097d5] px-1 text-white rounded">
                Ver detalles
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
