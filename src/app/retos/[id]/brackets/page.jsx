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

  if (!reto) return <div>Cargando...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Brackets de Eliminación: {reto.nombre}</h1>
      
      {reto.fase === 'cuartos' && (
      <div>
        <h2 className="text-xl font-semibold mb-2">Cuartos de Final</h2>
        {emparejamientos.map((emparejamiento, index) => (
          <div key={index} className="mb-4 p-2 border rounded">
            <p>{emparejamiento.equipo1?.nombre} vs {emparejamiento.equipo2?.nombre}</p>
            <Link 
              href={`/jueces/calificar-enfrentamiento/${reto._id}/${emparejamiento._id}`}
              className="bg-blue-500 text-white px-2 py-1 rounded mt-2 inline-block"
            >
              Calificar
            </Link>
          </div>
        ))}
      </div>
    )}
      
      {/* Añadir secciones similares para semifinales y finales cuando se implementen */}
      
      <Link href={`/retos/${reto._id}`} className="bg-blue-500 text-white px-4 py-2 rounded mt-4 inline-block">
        Volver al Reto
      </Link>
    </div>
  );
}