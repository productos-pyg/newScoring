'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function JuecesPage() {
  const [retos, setRetos] = useState([]);

  useEffect(() => {
    const fetchRetos = async () => {
      try {
        const response = await axios.get('/api/retos');
        setRetos(response.data);
      } catch (error) {
        console.error('Error al obtener los retos:', error);
      }
    };
    fetchRetos();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Panel de Jueces</h1>
      <h2 className="text-xl font-semibold mb-2">Retos disponibles para calificar:</h2>
      <ul>
        {retos.map((reto) => (
          <li key={reto._id} className="mb-2">
            <Link href={`/jueces/retos/${reto._id}`} className="text-blue-500 hover:underline">
              {reto.nombre}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}