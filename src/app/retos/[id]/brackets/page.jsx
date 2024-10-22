// src/app/retos/[id]/brackets/page.jsx

'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function BracketsPage({ params }) {
  const [reto, setReto] = useState(null);
  const [emparejamientos, setEmparejamientos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const retoResponse = await axios.get(`/api/retos/${params.id}`);
        setReto(retoResponse.data);
        setEmparejamientos(retoResponse.data.emparejamientos || []);
      } catch (error) {
        console.error('Error al obtener datos:', error);
      }
    };

    fetchData();
  }, [params.id]);

  const renderEstadoEnfrentamiento = (emparejamiento) => {
    if (emparejamiento.ganador) {
      return (
        <div className="bg-green-100 border border-green-400 rounded p-2 mt-2">
          <p className="text-green-700">
            Ganador: {emparejamiento.ganador.nombre}
          </p>
          {emparejamiento.calificacionEquipo1 && emparejamiento.calificacionEquipo2 && (
            <p className="text-sm text-gray-600">
              Puntuaciones: {emparejamiento.equipo1.nombre} ({emparejamiento.calificacionEquipo1.puntuacionTotal}) vs 
              {emparejamiento.equipo2.nombre} ({emparejamiento.calificacionEquipo2.puntuacionTotal})
            </p>
          )}
        </div>
      );
    }
    return (
      <Link
        href={`/jueces/calificar-enfrentamiento/${reto._id}/${emparejamiento._id}`}
        className="bg-blue-500 text-white px-2 py-1 rounded mt-2 inline-block"
      >
        Calificar
      </Link>
    );
  };

  if (!reto) return <div>Cargando...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Brackets de Eliminación: {reto.nombre}</h1>
      
      {reto.fase === 'cuartos' && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Cuartos de Final</h2>
          <div className="grid grid-cols-1 gap-4">
            {emparejamientos.map((emparejamiento, index) => (
              <div key={index} className="mb-4 p-4 border rounded shadow-sm">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="font-semibold">{emparejamiento.equipo1?.nombre}</div>
                    <div className="font-semibold">{emparejamiento.equipo2?.nombre}</div>
                  </div>
                  <div className="ml-4">
                    {renderEstadoEnfrentamiento(emparejamiento)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Link href={`/retos/${reto._id}`} className="bg-gray-500 text-white px-4 py-2 rounded mt-4 inline-block">
        Volver al Reto
      </Link>
    </div>
  );
}