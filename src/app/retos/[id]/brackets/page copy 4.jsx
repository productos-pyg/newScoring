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
        const reto = retoResponse.data;
        
        // Procesamos los emparejamientos para incluir la información correcta
        const emparejamientosProcessed = reto.emparejamientos.map(emp => {
          const puntuacionEquipo1 = emp.calificacionEquipo1?.intentos?.[0]?.puntuacion || 0;
          const puntuacionEquipo2 = emp.calificacionEquipo2?.intentos?.[0]?.puntuacion || 0;
          
          return {
            ...emp,
            puntuacionEquipo1,
            puntuacionEquipo2
          };
        });

        setReto(reto);
        setEmparejamientos(emparejamientosProcessed);
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
      
      {/* Mostramos los brackets según la fase */}
      {reto.fase === 'semifinal' ? (
        <div>
          <h2 className="text-xl font-semibold mb-4">Semifinales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {emparejamientos.map((emparejamiento, index) => (
              <div key={index} className="border rounded-lg shadow bg-white p-4">
                <div className="grid grid-cols-1 gap-4">
                  {/* Equipo 1 */}
                  <div className={`p-3 rounded ${
                    emparejamiento.ganador === emparejamiento.equipo1._id 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-gray-50'
                  }`}>
                    <span className="font-semibold">{emparejamiento.equipo1?.nombre}</span>
                    {emparejamiento.puntuacionEquipo1 > 0 && (
                      <span className="ml-2 text-gray-600">
                        ({emparejamiento.puntuacionEquipo1} puntos)
                      </span>
                    )}
                  </div>
                  
                  {/* VS */}
                  <div className="text-center text-gray-500 font-medium">
                    VS
                  </div>
                  
                  {/* Equipo 2 */}
                  <div className={`p-3 rounded ${
                    emparejamiento.ganador === emparejamiento.equipo2._id 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-gray-50'
                  }`}>
                    <span className="font-semibold">{emparejamiento.equipo2?.nombre}</span>
                    {emparejamiento.puntuacionEquipo2 > 0 && (
                      <span className="ml-2 text-gray-600">
                        ({emparejamiento.puntuacionEquipo2} puntos)
                      </span>
                    )}
                  </div>
                  
                  {/* Estado o Botón de Calificar */}
                  <div className="mt-2 flex justify-center">
                    {emparejamiento.ganador ? (
                      <div className="bg-green-100 border border-green-400 rounded p-3 w-full text-center">
                        <p className="text-green-700 font-semibold">
                          Ganador: {
                            emparejamiento.ganador === emparejamiento.equipo1._id 
                              ? emparejamiento.equipo1.nombre 
                              : emparejamiento.equipo2.nombre
                          }
                        </p>
                      </div>
                    ) : (
                      <Link
                        href={`/jueces/calificar-enfrentamiento/${reto._id}/${emparejamiento._id}`}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                      >
                        Calificar
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : reto.fase === 'cuartos' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Cuartos de Final</h2>
          <div className="space-y-4">
            {emparejamientos.map((emparejamiento, index) => (
              <div key={index} className="border rounded-lg shadow bg-white p-4">
                <div className="grid grid-cols-1 gap-4">
                  {/* Equipo 1 */}
                  <div className={`p-3 rounded ${
                    emparejamiento.ganador === emparejamiento.equipo1._id 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-gray-50'
                  }`}>
                    <span className="font-semibold">{emparejamiento.equipo1?.nombre}</span>
                    {emparejamiento.puntuacionEquipo1 > 0 && (
                      <span className="ml-2 text-gray-600">
                        ({emparejamiento.puntuacionEquipo1} puntos)
                      </span>
                    )}
                  </div>
                  
                  {/* VS */}
                  <div className="text-center text-gray-500 font-medium">
                    VS
                  </div>
                  
                  {/* Equipo 2 */}
                  <div className={`p-3 rounded ${
                    emparejamiento.ganador === emparejamiento.equipo2._id 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-gray-50'
                  }`}>
                    <span className="font-semibold">{emparejamiento.equipo2?.nombre}</span>
                    {emparejamiento.puntuacionEquipo2 > 0 && (
                      <span className="ml-2 text-gray-600">
                        ({emparejamiento.puntuacionEquipo2} puntos)
                      </span>
                    )}
                  </div>
                  
                  {/* Estado o Botón de Calificar */}
                  <div className="mt-2 flex justify-center">
                    {emparejamiento.ganador ? (
                      <div className="bg-green-100 border border-green-400 rounded p-3 w-full text-center">
                        <p className="text-green-700 font-semibold">
                          Ganador: {
                            emparejamiento.ganador === emparejamiento.equipo1._id 
                              ? emparejamiento.equipo1.nombre 
                              : emparejamiento.equipo2.nombre
                          }
                        </p>
                      </div>
                    ) : (
                      <Link
                        href={`/jueces/calificar-enfrentamiento/${reto._id}/${emparejamiento._id}`}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                      >
                        Calificar
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Link 
        href={`/retos/${reto._id}`} 
        className="mt-6 inline-block bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
      >
        Volver al Reto
      </Link>
    </div>
  );
}