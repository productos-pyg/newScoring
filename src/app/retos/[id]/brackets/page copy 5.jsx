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

  const renderEnfrentamiento = (emparejamiento, tipo) => (
    <div className={`border rounded-lg shadow bg-white p-4 ${
      tipo === 'final' ? 'border-yellow-400 shadow-yellow-200' : 'border-bronze shadow-bronze-200'
    }`}>
      <h3 className={`text-lg font-bold mb-3 text-center ${
        tipo === 'final' ? 'text-yellow-600' : 'text-bronze-600'
      }`}>
        {tipo === 'final' ? 'Final' : 'Tercer Puesto'}
      </h3>
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
            <div className={`${
              tipo === 'final' 
                ? 'bg-yellow-100 border-yellow-400' 
                : 'bg-bronze-100 border-bronze-400'
            } border rounded p-3 w-full text-center`}>
              <p className={`${
                tipo === 'final' ? 'text-yellow-700' : 'text-bronze-700'
              } font-semibold`}>
                {tipo === 'final' 
                  ? `¡Campeón!: ${emparejamiento.ganador === emparejamiento.equipo1._id 
                      ? emparejamiento.equipo1.nombre 
                      : emparejamiento.equipo2.nombre}`
                  : `Tercer Lugar: ${emparejamiento.ganador === emparejamiento.equipo1._id 
                      ? emparejamiento.equipo1.nombre 
                      : emparejamiento.equipo2.nombre}`
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
  );

  const renderPodio = (emparejamientos) => {
    // Encontramos el enfrentamiento de la final y del tercer puesto
    const finalMatch = emparejamientos.find(e => e.tipo === 'final');
    const tercerPuestoMatch = emparejamientos.find(e => e.tipo === 'tercerPuesto');
  
    // Solo mostramos el podio si ambos enfrentamientos tienen ganador
    if (!finalMatch?.ganador || !tercerPuestoMatch?.ganador) return null;
  
    // Determinamos el subcampeón (el que perdió la final)
    const subcampeon = finalMatch.ganador === finalMatch.equipo1._id
      ? finalMatch.equipo2
      : finalMatch.equipo1;
  
    return (
      <div className="mt-8 mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">Podio Final</h2>
        <div className="flex justify-center items-end space-x-4">
          {/* Segundo Lugar */}
          <div className="text-center">
            <div className="h-24 w-32 bg-gradient-to-b from-gray-200 to-gray-400 rounded-t-lg flex items-end justify-center">
              <div className="text-white text-xl font-bold mb-2">2°</div>
            </div>
            <div className="bg-gray-100 p-4 rounded-b-lg shadow-md">
              <div className="font-bold text-gray-700">🥈 Subcampeón</div>
              <div>{subcampeon.nombre}</div>
            </div>
          </div>
  
          {/* Primer Lugar */}
          <div className="text-center -mt-8">
            <div className="h-32 w-32 bg-gradient-to-b from-yellow-300 to-yellow-500 rounded-t-lg flex items-end justify-center">
              <div className="text-white text-2xl font-bold mb-2">1°</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-b-lg shadow-md">
              <div className="font-bold text-yellow-700">🏆 Campeón</div>
              <div>{finalMatch.ganador === finalMatch.equipo1._id 
                ? finalMatch.equipo1.nombre 
                : finalMatch.equipo2.nombre}</div>
            </div>
          </div>
  
          {/* Tercer Lugar */}
          <div className="text-center">
            <div className="h-20 w-32 bg-gradient-to-b from-amber-600 to-amber-800 rounded-t-lg flex items-end justify-center">
              <div className="text-white text-xl font-bold mb-2">3°</div>
            </div>
            <div className="bg-amber-50 p-4 rounded-b-lg shadow-md">
              <div className="font-bold text-amber-700">🥉 Tercer Lugar</div>
              <div>{tercerPuestoMatch.ganador === tercerPuestoMatch.equipo1._id 
                ? tercerPuestoMatch.equipo1.nombre 
                : tercerPuestoMatch.equipo2.nombre}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!reto) return <div>Cargando...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Brackets de Eliminación: {reto.nombre}</h1>
      {reto.fase === 'final' && (
      <>
        {/* Renderizar el podio si ambos enfrentamientos están calificados */}
        {renderPodio(emparejamientos)}
        
        {/* Los enfrentamientos existentes */}
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* ... resto del código de los enfrentamientos ... */}
          </div>
        </div>
      </>
    )}
      {/* Renderizado condicional según la fase */}
      {reto.fase === 'final' ? (
        <div className="space-y-8">
          {/* Enfrentamientos finales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {emparejamientos.map((emparejamiento) => (
              <div key={emparejamiento._id}>
                {renderEnfrentamiento(emparejamiento, emparejamiento.tipo)}
              </div>
            ))}
          </div>
        </div>
      ) : reto.fase === 'semifinal' ? (
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