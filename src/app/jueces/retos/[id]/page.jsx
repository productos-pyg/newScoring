'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function RetoEquiposPage({ params }) {
  const [reto, setReto] = useState(null);
  const [equipos, setEquipos] = useState([]);

  useEffect(() => {
    const fetchRetoYEquipos = async () => {
      try {
        const retoResponse = await axios.get(`/api/retos/${params.id}`);
        setReto(retoResponse.data);
        const equiposResponse = await axios.get(`/api/equipos?retoId=${params.id}`);
        setEquipos(equiposResponse.data);
      } catch (error) {
        console.error('Error al obtener datos:', error);
      }
    };
    fetchRetoYEquipos();
  }, [params.id]);

  if (!reto) return <div>Cargando...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Equipos para el reto: {reto.nombre}</h1>
      <ul>
        {equipos.map((equipo) => (
          <li key={equipo._id} className="mb-2">
            <Link href={`/jueces/calificar/${reto._id}/${equipo._id}`} className="text-blue-500 hover:underline">
              {equipo.nombre}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}