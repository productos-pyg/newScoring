//src/app/jueces/retos/[id]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { FaFire, FaArrowTrendUp, FaHelmetSafety} from "react-icons/fa6"

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

  console.log(reto)
  return (
    <div className="container mx-auto p-4">
      <div className='flex gap-4'>
        <h1 className="text-2xl font-bold mb-4">Equipos Reto: <span className='text-[#1097d5]'>{reto.nombre}</span></h1>
        {reto.tipo==="Exploradores" 
            ? <FaHelmetSafety size={28} className='text-[#81b71f]'/> 
            : reto.tipo==="FireFighting" 
              ? <FaFire size={28} className='text-[#e94947]'/> 
              : <FaArrowTrendUp size={28} className='text-[#1097d5]'/>
          }
        </div>
        <div className='border p-2 h-[75vh] overflow-y-auto shadow-lg rounded-md'>
          <ul>
            {equipos.map((equipo) => (
              <li key={equipo._id} className="mb-2">
                <Link href={`/jueces/calificar/${reto._id}/${equipo._id}`} className="text-[#1097d5] font-semibold hover:underline hover:text-[#81b71f]">
                  {equipo.nombre}
                </Link>
              </li>
            ))}
          </ul>
      </div>
    </div>
  );
}