//src/app/jueces/page.jsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import RouteGuard from '@/components/RouteGuard';

export default function JuecesPage() {
  const [retos, setRetos] = useState([]);

  useEffect(() => {
    const fetchRetos = async () => {
      try {
        const response = await axios.get('/api/retos');
        /* setRetos(response.data); */
        /* setRetos(response.data.filter((reto)=>reto.torneo._id==='671b94d3a5b5f6dabab84f07')); *///OJO ESTO NO DEBE SER HARDCODED HAY QUE VER LA FORMA DE MOSTRAR LOS DEL TORNEO EN PROGRESO
        setRetos(response.data);//OJO ESTO NO DEBE SER HARDCODED HAY QUE VER LA FORMA DE MOSTRAR LOS DEL TORNEO EN PROGRESO
      } catch (error) {
        console.error('Error al obtener los retos:', error);
      }
    };
    fetchRetos();
  }, []);

  //console.log(retos.filter((reto)=>reto.torneo._id==='671b94d3a5b5f6dabab84f07'))

  return (
    <RouteGuard allowedRoles={['admin', 'juez']}>
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Panel de Jueces</h1>
      <h2 className="text-xl font-semibold mb-2">Retos disponibles:</h2>
      <div className='h-[70vh] border rounded-md p-2 overflow-y-auto shadow-lg'>
        <ul>
          {retos.map((reto) => (
            <li key={reto._id} className="mb-2">
              <Link href={`/jueces/retos/${reto._id}`} className="text-[#1097d5] font-semibold hover:underline hover:text-[#81b71f]">
                {reto.nombre}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
    </RouteGuard>
  );
}