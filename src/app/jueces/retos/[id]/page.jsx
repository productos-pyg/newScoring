//src/app/jueces/retos/[id]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { FaFire, FaArrowTrendUp, FaHelmetSafety } from "react-icons/fa6";
import RouteGuard from '@/components/RouteGuard';

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
    <RouteGuard allowedRoles={['admin', 'juez']}>
    <div className="container mx-auto p-4">
      <div className='flex gap-4'>
        <h1 className="text-2xl font-bold">
          <span className='text-[#211551]'>Equipos: </span>
          <span className='text-[#1097d5]'>{reto.nombre}</span>
        </h1>
        {reto.tipo==="Exploradores" 
          ? <FaHelmetSafety size={28} className='text-[#81b71f]'/> 
          : reto.tipo==="FireFighting" 
            ? <FaFire size={28} className='text-[#e94947]'/> 
            : <FaArrowTrendUp size={28} className='text-[#1097d5]'/>
        }
      </div>

      {/* Nuevo: Alerta de fase eliminatoria */}
      {reto.fase !== 'clasificatoria' && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-blue-700">
                <span className="font-bold">Fase Actual: </span>
                {reto.fase === 'cuartos' ? 'Cuartos de Final' :
                 reto.fase === 'semifinal' ? 'Semifinales' :
                 'Final'}
              </p>
            </div>
            <Link
              href={`/retos/${reto._id}/resultados`}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Ver y Calificar Llaves
            </Link>
          </div>
        </div>
      )}

      <div className='border p-2 h-[75vh] overflow-y-auto shadow-lg rounded-md'>
        <ul>
          {equipos.map((equipo) => (
            <li key={equipo._id} className="mb-2 border-b-2">
              <Link 
                href={`/jueces/calificar/${reto._id}/${equipo._id}`} 
                className="text-[#1097d5] text-lg font-semibold hover:underline hover:text-[#81b71f]"
              >
                {equipo.nombre}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
    </RouteGuard>
  );
}