// src/app/public/[torneoId]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { FaFire, FaArrowTrendUp, FaHelmetSafety } from "react-icons/fa6";

export default function PublicTorneoDetail({ params }) {
  const [torneo, setTorneo] = useState(null);
  const [retos, setRetos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [torneoRes, retosRes] = await Promise.all([
          axios.get(`/api/torneos/${params.torneoId}`),
          axios.get(`/api/retos?torneoId=${params.torneoId}`)
        ]);
        setTorneo(torneoRes.data);
        setRetos(retosRes.data);
      } catch (error) {
        console.error('Error al obtener datos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.torneoId]);

  const getRetoIcon = (tipo) => {
    switch (tipo) {
      case 'Exploradores':
        return <FaHelmetSafety size={28} className="text-[#81b71f]" />;
      case 'FireFighting':
        return <FaFire size={28} className="text-[#e94947]" />;
      case 'LineFollowing':
        return <FaArrowTrendUp size={28} className="text-[#1097d5]" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold">Cargando información...</div>
      </div>
    );
  }

  if (!torneo) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center text-red-600">
          Este torneo no está disponible.
        </div>
        <Link 
          href="/public" 
          className="block mt-4 text-center text-blue-500 hover:text-blue-600"
        >
          Volver a torneos
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold mb-4">{torneo.nombre}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-gray-600">
              <span className="font-semibold">Inicio:</span>{' '}
              {new Date(torneo.fechaInicio).toLocaleDateString()}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">Fin:</span>{' '}
              {new Date(torneo.fechaFin).toLocaleDateString()}
            </p>
          </div>
          <div>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold 
              ${torneo.estado === 'En progreso' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-blue-100 text-blue-800'}`}
            >
              {torneo.estado}
            </span>
          </div>
        </div>
        {torneo.descripcion && (
          <p className="text-gray-600">{torneo.descripcion}</p>
        )}
      </div>

      <h2 className="text-2xl font-bold mb-4">Retos</h2>
      {retos.length === 0 ? (
        <div className="text-center text-gray-600">
          No hay retos disponibles en este torneo.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {retos.map((reto) => (
            <Link
              key={reto._id}
              href={`/public/reto/${reto._id}`}
              className="block"
            >
              <div className="border rounded-lg shadow hover:shadow-lg transition-shadow duration-200 bg-white p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">{reto.nombre}</h3>
                  {getRetoIcon(reto.tipo)}
                </div>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    <span className="font-semibold">Tipo:</span> {reto.tipo}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Categoría:</span> {reto.categoriaEdad}
                  </p>
                  <p className="text-gray-600">
                    <span className={`inline-block px-2 py-1 rounded text-sm font-semibold 
                      ${reto.fase === 'clasificatoria' ? 'bg-yellow-100 text-yellow-800' :
                        reto.fase === 'cuartos' ? 'bg-blue-100 text-blue-800' :
                        reto.fase === 'semifinal' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'}`}
                    >
                      {reto.fase.charAt(0).toUpperCase() + reto.fase.slice(1)}
                    </span>
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-6">
        <Link 
          href="/public" 
          className="inline-block bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
        >
          Volver a torneos
        </Link>
      </div>
    </div>
  );
}