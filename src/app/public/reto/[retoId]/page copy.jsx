// src/app/public/reto/[retoId]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { FaFire, FaArrowTrendUp, FaHelmetSafety } from "react-icons/fa6";

export default function PublicRetoDetail({ params }) {
  const [reto, setReto] = useState(null);
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [retoRes, resultadosRes] = await Promise.all([
          axios.get(`/api/retos/${params.retoId}`),
          axios.get(`/api/calificaciones/resultados?retoId=${params.retoId}`)
        ]);

        setReto(retoRes.data);
        setResultados(resultadosRes.data);
      } catch (error) {
        console.error('Error al obtener datos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.retoId]);

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

  const calcularPuntuacionTotal = (intentos, tipoReto) => {
    if (!intentos || intentos.length === 0) return 0;
    
    if (tipoReto === 'Exploradores') {
      return intentos.reduce((total, intento) => total + (intento.puntuacion || 0), 0);
    } else {
      const puntuaciones = intentos.map(intento => intento.puntuacion || 0);
      puntuaciones.sort((a, b) => b - a);
      return puntuaciones.slice(0, 5).reduce((total, puntuacion) => total + puntuacion, 0);
    }
  };

  const renderPodioFinal = () => {
    if (reto.fase !== 'final' || !reto.emparejamientos) return null;

    const finalMatch = reto.emparejamientos.find(e => e.tipo === 'final');
    const tercerPuestoMatch = reto.emparejamientos.find(e => e.tipo === 'tercerPuesto');

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
              <div>
                {finalMatch.ganador === finalMatch.equipo1._id 
                  ? finalMatch.equipo1.nombre 
                  : finalMatch.equipo2.nombre}
              </div>
            </div>
          </div>

          {/* Tercer Lugar */}
          <div className="text-center">
            <div className="h-20 w-32 bg-gradient-to-b from-amber-600 to-amber-800 rounded-t-lg flex items-end justify-center">
              <div className="text-white text-xl font-bold mb-2">3°</div>
            </div>
            <div className="bg-amber-50 p-4 rounded-b-lg shadow-md">
              <div className="font-bold text-amber-700">🥉 Tercer Lugar</div>
              <div>
                {tercerPuestoMatch.ganador === tercerPuestoMatch.equipo1._id 
                  ? tercerPuestoMatch.equipo1.nombre 
                  : tercerPuestoMatch.equipo2.nombre}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBrackets = () => {
    if (!reto.emparejamientos || reto.fase === 'clasificatoria') return null;

    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">
          {reto.fase === 'cuartos' ? 'Cuartos de Final' :
           reto.fase === 'semifinal' ? 'Semifinales' :
           'Fase Final'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reto.emparejamientos.map((emparejamiento, index) => (
            <div 
              key={index} 
              className={`border rounded-lg shadow p-4 ${
                emparejamiento.tipo === 'final' 
                  ? 'border-yellow-400 bg-yellow-50' 
                  : emparejamiento.tipo === 'tercerPuesto'
                    ? 'border-amber-400 bg-amber-50'
                    : 'bg-white'
              }`}
            >
              <h3 className="text-lg font-bold mb-3 text-center">
                {emparejamiento.tipo === 'final' 
                  ? 'Final' 
                  : emparejamiento.tipo === 'tercerPuesto'
                    ? 'Tercer Puesto'
                    : `Enfrentamiento ${index + 1}`}
              </h3>
              <div className="space-y-4">
                <div className={`p-3 rounded ${
                  emparejamiento.ganador === emparejamiento.equipo1._id
                    ? 'bg-green-100 border border-green-200'
                    : 'bg-gray-50'
                }`}>
                  <span className="font-semibold">{emparejamiento.equipo1.nombre}</span>
                </div>
                <div className="text-center text-gray-500 font-medium">VS</div>
                <div className={`p-3 rounded ${
                  emparejamiento.ganador === emparejamiento.equipo2._id
                    ? 'bg-green-100 border border-green-200'
                    : 'bg-gray-50'
                }`}>
                  <span className="font-semibold">{emparejamiento.equipo2.nombre}</span>
                </div>
                {emparejamiento.ganador && (
                  <div className="mt-2 text-center font-semibold text-green-700">
                    Ganador: {
                      emparejamiento.ganador === emparejamiento.equipo1._id
                        ? emparejamiento.equipo1.nombre
                        : emparejamiento.equipo2.nombre
                    }
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold">Cargando resultados...</div>
      </div>
    );
  }

  if (!reto) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center text-red-600">
          Este reto no está disponible.
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
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-3xl font-bold">{reto.nombre}</h1>
          {getRetoIcon(reto.tipo)}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-gray-600">
              <span className="font-semibold">Tipo:</span> {reto.tipo}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">Categoría:</span> {reto.categoriaEdad}
            </p>
          </div>
          <div>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold 
              ${reto.fase === 'clasificatoria' ? 'bg-yellow-100 text-yellow-800' :
                reto.fase === 'cuartos' ? 'bg-blue-100 text-blue-800' :
                reto.fase === 'semifinal' ? 'bg-purple-100 text-purple-800' :
                'bg-green-100 text-green-800'}`}
            >
              {reto.fase.charAt(0).toUpperCase() + reto.fase.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {renderPodioFinal()}
      {renderBrackets()}

      {reto.fase === 'clasificatoria' && (
        <>
          <h2 className="text-2xl font-bold mb-4">Tabla de Clasificación</h2>
          {resultados.length === 0 ? (
            <div className="text-center text-gray-600">
              Aún no hay resultados disponibles.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 shadow-md rounded-lg">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 p-2">Posición</th>
                    <th className="border border-gray-300 p-2">Equipo</th>
                    <th className="border border-gray-300 p-2">Puntuación Total</th>
                  </tr>
                </thead>
                <tbody>
                  {resultados
                    .sort((a, b) => calcularPuntuacionTotal(b.intentos, reto.tipo) - 
                                  calcularPuntuacionTotal(a.intentos, reto.tipo))
                    .map((resultado, index) => (
                      <tr key={resultado._id}>
                        <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
                        <td className="border border-gray-300 p-2">
                          {resultado.equipo.nombre}
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          {calcularPuntuacionTotal(resultado.intentos, reto.tipo)}
                        </td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <div className="mt-6">
        <Link 
          href={`/public/${reto.torneo}`} 
          className="inline-block bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
        >
          Volver al torneo
        </Link>
      </div>
    </div>
  );
}