// src/app/retos/[id]/brackets/page.jsx

'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import useAuthStore from '@/store/authStore';

export default function BracketsPage({ params }) {
  const [reto, setReto] = useState(null);
  const [emparejamientos, setEmparejamientos] = useState([]);
  const { role } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const retoResponse = await axios.get(`/api/retos/${params.id}`);
        const reto = retoResponse.data;
        
        // Procesamos los emparejamientos para incluir la información correcta
        const emparejamientosProcessed = reto.emparejamientos.map(emp => {
          const puntuacionEquipo1 = emp.calificacionEquipo1?.intentos?.[emp.calificacionEquipo1?.intentos?.length - 1]?.puntuacion || 0;
          const puntuacionEquipo2 = emp.calificacionEquipo2?.intentos?.[emp.calificacionEquipo2?.intentos?.length - 1]?.puntuacion || 0;
          
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

    // Actualizar datos cada 5 segundos
    const interval = setInterval(fetchData, 5000);
    fetchData(); // Primera carga

    return () => clearInterval(interval);
  }, [params.id]);

  // Función para renderizar el estado del enfrentamiento
  const renderEstadoEnfrentamiento = (emparejamiento) => {
    if (emparejamiento.ganador) {
      return (
        <div className="bg-green-100 border border-green-400 rounded p-3 w-full text-center">
          <p className="text-green-700 font-semibold">
            Ganador: {
              emparejamiento.ganador === emparejamiento.equipo1._id 
                ? emparejamiento.equipo1.nombre 
                : emparejamiento.equipo2.nombre
            }
          </p>
        </div>
      );
    }
    if (emparejamiento.empate) {
      if (emparejamiento.requiereSegundoIntento) {
        return (
          <div className="bg-yellow-100 border border-yellow-400 rounded p-3 w-full">
            <p className="text-yellow-700 font-semibold text-center mb-2">
              ¡Empate detectado!
            </p>
            <p className="text-yellow-600 text-sm text-center">
              Se requiere un segundo intento para ambos equipos
            </p>
            <Link
              href={`/jueces/calificar-enfrentamiento/${reto._id}/${emparejamiento._id}`}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors w-full text-center block mt-2"
            >
              Calificar Segundo Intento
            </Link>
          </div>
        );
      }

      if (emparejamiento.requiereDecisionManual) {
        if (role === 'admin') {
          return (
            <div className="bg-red-100 border border-red-400 rounded p-3 w-full">
              <p className="text-red-700 font-semibold text-center mb-2">
                ¡Empate persistente!
              </p>
              <p className="text-red-600 text-sm text-center mb-2">
                Como administrador, debes seleccionar al ganador manualmente
              </p>
              <Link
                href={`/jueces/calificar-enfrentamiento/${reto._id}/${emparejamiento._id}`}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors w-full text-center block"
              >
                Decidir Ganador
              </Link>
            </div>
          );
        } else {
          return (
            <div className="bg-orange-100 border border-orange-400 rounded p-3 w-full text-center">
              <p className="text-orange-700 font-semibold">
                Empate persistente - Esperando decisión administrativa
              </p>
            </div>
          );
        }
      }
    }

    // Estado normal - Sin calificar o en proceso
    if (!emparejamiento.calificacionEquipo1 || !emparejamiento.calificacionEquipo2) {
      return (
        <Link
          href={`/jueces/calificar-enfrentamiento/${reto._id}/${emparejamiento._id}`}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors w-full text-center block"
        >
          Calificar Enfrentamiento
        </Link>
      );
    }
  };
  const renderEnfrentamiento = (emparejamiento, tipo) => (
    <div className={`border rounded-lg shadow bg-white p-4 ${
      tipo === 'final' ? 'border-yellow-400 shadow-yellow-200' : 
      tipo === 'tercerPuesto' ? 'border-amber-400 shadow-amber-200' : ''
    }`}>
      <h3 className={`text-lg font-bold mb-3 text-center ${
        tipo === 'final' ? 'text-yellow-600' : 
        tipo === 'tercerPuesto' ? 'text-amber-600' : ''
      }`}>
        {tipo === 'final' ? 'Final' : 
         tipo === 'tercerPuesto' ? 'Tercer Puesto' : 
         'Enfrentamiento'}
      </h3>
      <div className="grid grid-cols-1 gap-4">
        {/* Equipo 1 */}
        <div className={`p-3 rounded ${
          emparejamiento.ganador === emparejamiento.equipo1._id 
            ? 'bg-green-50 border border-green-200' 
            : emparejamiento.calificacionEquipo1
            ? 'bg-blue-50 border border-blue-200'
            : 'bg-gray-50'
        }`}>
          <div className="flex justify-between items-center">
            <span className="font-semibold">{emparejamiento.equipo1?.nombre}</span>
            {emparejamiento.puntuacionEquipo1 > 0 && (
              <span className="text-gray-600 bg-white px-2 py-1 rounded-full text-sm">
                {emparejamiento.puntuacionEquipo1} pts
              </span>
            )}
          </div>
          {emparejamiento.calificacionEquipo1?.intentos?.length > 1 && (
            <div className="text-xs text-gray-500 mt-1">
              Segundo intento: {emparejamiento.calificacionEquipo1.intentos[1].puntuacion} pts
            </div>
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
            : emparejamiento.calificacionEquipo2
            ? 'bg-blue-50 border border-blue-200'
            : 'bg-gray-50'
        }`}>
          <div className="flex justify-between items-center">
            <span className="font-semibold">{emparejamiento.equipo2?.nombre}</span>
            {emparejamiento.puntuacionEquipo2 > 0 && (
              <span className="text-gray-600 bg-white px-2 py-1 rounded-full text-sm">
                {emparejamiento.puntuacionEquipo2} pts
              </span>
            )}
          </div>
          {emparejamiento.calificacionEquipo2?.intentos?.length > 1 && (
            <div className="text-xs text-gray-500 mt-1">
              Segundo intento: {emparejamiento.calificacionEquipo2.intentos[1].puntuacion} pts
            </div>
          )}
        </div>
        
        {/* Estado del enfrentamiento */}
        <div className="mt-2">
          {renderEstadoEnfrentamiento(emparejamiento)}
        </div>
      </div>
    </div>
  );
  const renderPodio = (emparejamientos) => {
    const finalMatch = emparejamientos.find(e => e.tipo === 'final');
    const tercerPuestoMatch = emparejamientos.find(e => e.tipo === 'tercerPuesto');
  
    if (!finalMatch?.ganador || !tercerPuestoMatch?.ganador) return null;
  
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

  if (!reto) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold">Cargando...</div>
      </div>
    );
  }
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Brackets de Eliminación: {reto.nombre}</h1>

      {/* Panel informativo de fase */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <p className="text-blue-700">
          <span className="font-bold">Fase actual: </span>
          {reto.fase === 'cuartos' ? 'Cuartos de Final' :
           reto.fase === 'semifinal' ? 'Semifinales' :
           reto.fase === 'final' ? 'Final' : 'Clasificatoria'}
        </p>
      </div>

      {/* Renderizado condicional según la fase */}
      {reto.fase === 'final' ? (
        <>
          {renderPodio(emparejamientos)}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {emparejamientos.map((emparejamiento) => (
              <div key={emparejamiento._id}>
                {renderEnfrentamiento(emparejamiento, emparejamiento.tipo)}
              </div>
            ))}
          </div>
        </>
      ) : reto.fase === 'semifinal' || reto.fase === 'cuartos' ? (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {reto.fase === 'semifinal' ? 'Semifinales' : 'Cuartos de Final'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {emparejamientos.map((emparejamiento, index) => (
              <div key={emparejamiento._id || index}>
                {renderEnfrentamiento(emparejamiento)}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Botón de volver */}
      <div className="mt-6 flex gap-4">
        <Link 
          href={`/retos/${reto._id}`}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
        >
          Volver al Reto
        </Link>
        <Link 
          href={`/retos/${reto._id}/resultados`}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Ver Resultados
        </Link>
      </div>

      {/* Panel de actualización automática */}
      <div className="fixed bottom-4 right-4">
        <div className="bg-white shadow-lg rounded-full px-4 py-2 text-sm text-gray-600 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
          Actualizando en tiempo real
        </div>
      </div>
    </div>
  );
}