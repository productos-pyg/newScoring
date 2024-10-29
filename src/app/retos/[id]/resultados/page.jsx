// src/app/retos/[id]/resultados/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { FaFire, FaArrowTrendUp, FaHelmetSafety } from "react-icons/fa6";
import useAuthStore from '@/store/authStore';
/* import {useAuthStore} from "@/store/authStore" */

export default function ResultadosRetoPage({ params }) {
  const { role } = useAuthStore();
  const router = useRouter();
  const [reto, setReto] = useState(null);
  const [resultados, setResultados] = useState([]);
  const [error, setError] = useState(null);
 /*  const [role, setrole] = useState("admin"); */
  const [loading, setLoading] = useState(true);
  const [puedeAvanzar, setPuedeAvanzar] = useState(false);
  const [puedeAvanzarSemis, setPuedeAvanzarSemis] = useState(false);
  const [puedeAvanzarFinal, setPuedeAvanzarFinal] = useState(false);
  const [estadoVerificacion, setEstadoVerificacion] = useState({
    tieneOchoOMasEquipos: false,
    todosConIntentosCompletos: false,
    numEquipos: 0,
    detallesEquipos: []
  });

  // Obtener el rol del usuario de la cookie al cargar
/*   useEffect(() => {
    const authCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth='));
    
    if (authCookie) {
      const authData = JSON.parse(decodeURIComponent(authCookie.split('=')[1]));
      setrole(authData.role);
    }
  }, []); */

  // Efecto principal para cargar datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Iniciando fetchData...');
        const resReto = await axios.get(`/api/retos/${params.id}`);
        setReto(resReto.data);
        
        const resCalificaciones = await axios.get(`/api/calificaciones/resultados?retoId=${params.id}`);
        console.log(resCalificaciones)
        const calificacionesClasificatoria = resCalificaciones.data.filter(
          calificacion => !calificacion.emparejamiento && 
                         calificacion.intentos && 
                         calificacion.intentos.length > 1
        );

        setResultados(calificacionesClasificatoria);

        // Verificación detallada para avanzar
        const tieneOchoOMasEquipos = calificacionesClasificatoria.length >= 8;
        const detallesEquipos = calificacionesClasificatoria.map(cal => ({
          equipo: cal.equipo.nombre,
          intentos: cal.intentos.length,
          intentosValidos: cal.intentos.filter(i => i.puntuacion !== undefined || i.noRealizado === true).length
        }));

// En el useEffect donde hacemos la verificación
const todosConIntentosCompletos = calificacionesClasificatoria.every(cal => {
  const intentosRequeridos = resReto.data.tipo === 'Exploradores' ? 3 : 6;
  const intentosValidos = cal.intentos.filter(intento => 
    // Un intento es válido si:
    // - Tiene puntuación definida (aunque sea 0)
    // - O está marcado explícitamente como no realizado
    intento.puntuacion !== undefined /* || intento.noRealizado === true */
  );
  //console.log(intentosValidos)
  
  console.log(`Equipo ${cal.equipo.nombre}:`, {
    intentosRequeridos,
    intentosTotales: cal.intentos.length,
    intentosValidos: intentosValidos.length,
    intentos: cal.intentos.map(i => ({
      puntuacion: i.puntuacion,
      noRealizado: i.noRealizado
    }))
  });
  
  return intentosValidos.length >= intentosRequeridos;
});

        // Actualizar estado de verificación
        setEstadoVerificacion({
          tieneOchoOMasEquipos,
          todosConIntentosCompletos,
          numEquipos: calificacionesClasificatoria.length,
          detallesEquipos
        });

        setPuedeAvanzar(tieneOchoOMasEquipos && todosConIntentosCompletos);
        console.log('Estado de avance:', { tieneOchoOMasEquipos, todosConIntentosCompletos, puedeAvanzar });

        // Verificaciones para otras fases
        if (resReto.data.fase === 'semifinal') {
          const todosCalificados = resReto.data.emparejamientos.every(
            emp => emp.ganador != null
          );
          setPuedeAvanzarFinal(todosCalificados);
        }

        if (resReto.data.fase === 'cuartos') {
          const todosCalificados = resReto.data.emparejamientos.every(
            emp => emp.ganador != null
          );
          setPuedeAvanzarSemis(todosCalificados);
        }

      } catch (error) {
        console.error('Error al obtener resultados:', error);
        setError(error.message || 'Ocurrió un error al cargar los resultados');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id]);

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
    } else if (tipoReto === 'LineFollowing') {
      // Nueva lógica para Line Following
      const puntuaciones = intentos.map(intento => intento.puntuacion || 0);
      puntuaciones.sort((a, b) => b - a); // Ordenamos de mayor a menor
      return puntuaciones.slice(0, 4).reduce((total, puntuacion) => total + puntuacion, 0);
    } else {
      // FireFighting mantiene la lógica original
      const puntuaciones = intentos.map(intento => intento.puntuacion || 0);
      puntuaciones.sort((a, b) => b - a);
      return puntuaciones.slice(0, 5).reduce((total, puntuacion) => total + puntuacion, 0);
    }
  };

  const avanzarFase = async () => {
    if (role !== 'admin') return;

    const faseActual = reto.fase;
    const mensaje = faseActual === 'clasificatoria' 
      ? '¿Estás seguro de que quieres avanzar a cuartos de final?' 
      : faseActual === 'cuartos'
      ? '¿Estás seguro de que quieres avanzar a semifinales?'
      : '¿Estás seguro de que quieres avanzar a la fase final?';

    if (window.confirm(mensaje + ' Esta acción no se puede deshacer.')) {
      try {
        const endpoint = reto.fase === 'clasificatoria' 
          ? `/api/retos/${params.id}/avanzarFase`
          : reto.fase === 'cuartos'
          ? `/api/retos/${params.id}/avanzarSemifinal`
          : `/api/retos/${params.id}/avanzarFinal`;

        const response = await axios.post(endpoint);
        alert('Se ha avanzado a la siguiente fase exitosamente.');
        window.location.reload();
      } catch (error) {
        console.error('Error al avanzar de fase:', error);
        alert('Error al avanzar de fase: ' + (error.response?.data?.error || error.message));
      }
    }
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
  
                <div className="mt-4 flex justify-center">
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
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors w-full text-center"
                    >
                      Calificar Enfrentamiento
                    </Link>
                  )}
                </div>
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

  if (error) return <div>Error: {error}</div>;
  if (!reto) return <div>Cargando...</div>;

  //console.log(puedeAvanzar)
  //console.log(reto.fase)
  console.log(role)

  return (
    <div className="container mx-auto p-4">
      {/* Encabezado con información del reto */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold mb-4">{reto.nombre}</h1>
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

      {/* Panel de debug para fase clasificatoria */}
      {reto.fase === 'clasificatoria' && role === 'admin' && (
        <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">Estado de Avance</h3>
          <ul className="space-y-2">
            <li className={`flex items-center ${estadoVerificacion.tieneOchoOMasEquipos ? 'text-green-600' : 'text-red-600'}`}>
              • {estadoVerificacion.tieneOchoOMasEquipos ? '✓' : '✗'} Mínimo 8 equipos ({estadoVerificacion.numEquipos} actuales)
            </li>
            <li className={`flex items-center ${estadoVerificacion.todosConIntentosCompletos ? 'text-green-600' : 'text-red-600'}`}>
              • {estadoVerificacion.todosConIntentosCompletos ? '✓' : '✗'} Todos los equipos han completado sus intentos
            </li>
            <li className="text-sm text-gray-600 mt-2">
              Detalles por equipo:
              {estadoVerificacion.detallesEquipos.map((detalle, index) => (
                <div key={index} className="ml-4">
                  {detalle.equipo}: {detalle.intentosValidos} intentos válidos de {detalle.intentos} totales
                </div>
              ))}
            </li>
          </ul>
        </div>
      )}

      {/* Tabla de Clasificación */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Tabla de Clasificación</h2>
        {resultados.length === 0 ? (
          <div className="text-center text-gray-600">
            No hay resultados disponibles para este reto.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 shadow-md">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2">Posición</th>
                  <th className="border border-gray-300 p-2">Equipo</th>
                  <th className="border border-gray-300 p-2">Intentos</th>
                  <th className="border border-gray-300 p-2">Puntuación Total</th>
                  {reto.fase !== 'clasificatoria' && (
                    <th className="border border-gray-300 p-2">Estado</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {resultados
                  .sort((a, b) => calcularPuntuacionTotal(b.intentos, reto.tipo) - 
                                calcularPuntuacionTotal(a.intentos, reto.tipo))
                  .map((resultado, index) => (
                    <tr 
                      key={resultado._id}
                      className={`${index < 8 ? 'bg-green-50' : ''}`}
                    >
                      <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
                      <td className="border border-gray-300 p-2">
                        {resultado.equipo.nombre}
                      </td>
                      <td className="border border-gray-300 p-2">
                        <div className="space-y-1">
                          {resultado.intentos.map((intento, i) => (
                            <div key={i} className="text-sm">
                              Intento {intento.numero}: {intento.puntuacion} 
                              {intento.noRealizado && ' (No realizado)'}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {calcularPuntuacionTotal(resultado.intentos, reto.tipo)}
                      </td>
                      {reto.fase !== 'clasificatoria' && (
                        <td className="border border-gray-300 p-2 text-center">
                          <span className={`inline-block px-2 py-1 rounded-full text-sm 
                            ${index < 8 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                          >
                            {index < 8 ? 'Clasificado' : 'Eliminado'}
                          </span>
                        </td>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Brackets y Botones de Avance */}
      {renderBrackets()}

      {/* Botones de Avance (Solo para admin) */}
      {role === 'admin' && (
        <div className="mt-6">
          {puedeAvanzar && reto.fase === 'clasificatoria' && (
            <button
              onClick={avanzarFase}
              className="bg-blue-500 text-white px-4 py-2 rounded mr-4 hover:bg-blue-600 transition-colors"
            >
              Avanzar a Cuartos de Final
            </button>
          )}

          {puedeAvanzarSemis && reto.fase === 'cuartos' && (
            <button
              onClick={avanzarFase}
              className="bg-blue-500 text-white px-4 py-2 rounded mr-4 hover:bg-blue-600 transition-colors"
            >
              Avanzar a Semifinales
            </button>
          )}

          {puedeAvanzarFinal && reto.fase === 'semifinal' && (
            <button
              onClick={avanzarFase}
              className="bg-blue-500 text-white px-4 py-2 rounded mr-4 hover:bg-blue-600 transition-colors"
            >
              Avanzar a Fase Final
            </button>
          )}
        </div>
      )}

      {/* Mensaje informativo para jueces */}
      {role === 'juez' && puedeAvanzar && (
        <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Se han cumplido las condiciones para avanzar de fase. Un administrador deberá realizar el avance.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Botón de Volver */}
      <div className="mt-6">
        <Link 
          href={`/retos/${reto._id}`} 
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Volver al reto
        </Link>
      </div>
    </div>
  );
}