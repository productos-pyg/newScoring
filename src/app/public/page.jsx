// src/app/public/page.jsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function PublicPage() {
  const [torneos, setTorneos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTorneos = async () => {
      try {
        const res = await axios.get('/api/torneos');
        // Filtrar solo torneos en progreso o finalizados
        const torneosActivos = res.data.filter(
          torneo => torneo.estado !== 'Planificado'
        );
        setTorneos(torneosActivos);
      } catch (error) {
        console.error('Error al obtener torneos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTorneos();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold">Cargando torneos...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Torneos de Robótica</h1>
      {torneos.length === 0 ? (
        <div className="text-center text-gray-600">
          No hay torneos activos en este momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {torneos.map((torneo) => (
            <Link
              key={torneo._id}
              href={`/public/${torneo._id}`}
              className="block"
            >
              <div className="border rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 p-6 bg-white">
                <h2 className="text-xl font-bold mb-2">{torneo.nombre}</h2>
                <div className="space-y-2 text-gray-600">
                  <p>
                    <span className="font-semibold">Inicio:</span>{' '}
                    {new Date(torneo.fechaInicio).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-semibold">Fin:</span>{' '}
                    {new Date(torneo.fechaFin).toLocaleDateString()}
                  </p>
                  <p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold 
                      ${torneo.estado === 'En progreso' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'}`}
                    >
                      {torneo.estado}
                    </span>
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}