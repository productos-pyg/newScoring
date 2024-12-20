//src/app/retos/[id]/resultados/page.jsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { FaFire, FaArrowTrendUp, FaHelmetSafety} from "react-icons/fa6"

export default function ResultadosRetoPage({ params }) {
  const [reto, setReto] = useState(null);
  const [resultados, setResultados] = useState([]);
  const [error, setError] = useState(null);
  const [puedeAvanzar, setPuedeAvanzar] = useState(false);
  const [puedeAvanzarSemis, setPuedeAvanzarSemis] = useState(false);
  const [puedeAvanzarFinal, setPuedeAvanzarFinal] = useState(false);

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

  useEffect(() => {
    const fetchResultados = async () => {
      try {
        const resReto = await axios.get(`/api/retos/${params.id}`);
        setReto(resReto.data);
        
        const resCalificaciones = await axios.get(`/api/calificaciones/resultados?retoId=${params.id}`);
        const calificaciones = resCalificaciones.data;

        if (calificaciones.length === 0) {
          setResultados([]);
          return;
        }

        // Filtrar solo las calificaciones que NO tienen emparejamientos
        // (es decir, solo las de fase clasificatoria)
        const calificacionesClasificatoria = calificaciones.filter(
          calificacion => !calificacion.emparejamiento
        );

        const resultadosFinales = calificacionesClasificatoria.map(calificacion => ({
          id: calificacion._id,
          equipo: calificacion.equipo,
          intentos: calificacion.intentos,
          puntuacionTotal: calcularPuntuacionTotal(calificacion.intentos, resReto.data.tipo)
        }));

        resultadosFinales.sort((a, b) => b.puntuacionTotal - a.puntuacionTotal);
        setResultados(resultadosFinales);

        // Verificaciones de fase para los botones
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

        setPuedeAvanzar(resultadosFinales.length >= 8 && resReto.data.fase === 'clasificatoria');

      } catch (error) {
        console.error('Error al obtener los resultados:', error);
        setError(error.message || 'Ocurrió un error al cargar los resultados');
      }
    };
    fetchResultados();
  }, [params.id]);

  const avanzarFase = async () => {
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

  if (error) return <div>Error: {error}</div>;
  if (!reto) return <div>Cargando...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className='flex gap-4'>
        <h1 className="text-2xl font-bold mb-4">Resultados: {reto.nombre}</h1>
        {reto.tipo==="Exploradores" 
          ? <FaHelmetSafety size={28} className='text-[#81b71f]'/> 
          : reto.tipo==="FireFighting" 
            ? <FaFire size={28} className='text-[#e94947]'/> 
            : <FaArrowTrendUp size={28} className='text-[#1097d5]'/>
        }
      </div>
      {resultados.length === 0 ? (
        <p>No hay resultados disponibles para este reto.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300 shadow-md">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2">Posición</th>
              <th className="border border-gray-300 p-2">Equipo</th>
              <th className="border border-gray-300 p-2">Intentos</th>
              <th className="border border-gray-300 p-2">Puntuación Total</th>
            </tr>
          </thead>
          <tbody>
            {resultados.map((resultado, index) => (
              <tr key={resultado.id}>
                <td className="border border-gray-300 p-2">{index + 1}</td>
                <td className="border border-gray-300 p-2">
                  <Link href={`/equipos/${resultado.equipo._id}`} className="text-blue-500">
                    {resultado.equipo.nombre}
                  </Link>
                </td>
                <td className="border border-gray-300 p-2">
                  {resultado.intentos.map((intento, i) => (
                    <div key={i}>
                      Intento {intento.numero}: {intento.puntuacion} 
                      {intento.noRealizado && ' (No realizado)'}
                    </div>
                  ))}
                </td>
                <td className="border border-gray-300 p-2">{resultado.puntuacionTotal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      {puedeAvanzar && reto.fase === 'clasificatoria' && (
        <button
          onClick={avanzarFase}
          className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
        >
          Avanzar a Cuartos de Final
        </button>
      )}

      {puedeAvanzarSemis && reto.fase === 'cuartos' && (
        <button
          onClick={avanzarFase}
          className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
        >
          Avanzar a Semifinales
        </button>
      )}

      {puedeAvanzarFinal && reto.fase === 'semifinal' && (
        <button
          onClick={avanzarFase}
          className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
        >
          Avanzar a Fase Final
        </button>
      )}

      {reto.fase !== 'clasificatoria' && (
        <Link 
          href={`/retos/${reto._id}/brackets`} 
          className="bg-blue-500 text-white px-4 py-2 rounded mt-4 ml-4 inline-block"
        >
          Ver Brackets de Eliminación
        </Link>
      )}
      
      <div className="mt-4">
        <Link href={`/retos/${reto._id}`} className="bg-gray-500 text-white px-4 py-2 rounded">
          Volver al reto
        </Link>
      </div>
    </div>
  );
}