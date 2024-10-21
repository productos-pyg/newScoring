'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function ResultadosRetoPage({ params }) {
  const [reto, setReto] = useState(null);
  const [resultados, setResultados] = useState([]);
  const [error, setError] = useState(null);

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
        console.log('Reto obtenido:', resReto.data);

        const resCalificaciones = await axios.get(`/api/calificaciones/resultados?retoId=${params.id}`);
        console.log('Calificaciones recibidas:', resCalificaciones.data);

        const calificaciones = resCalificaciones.data;

        if (calificaciones.length === 0) {
          console.log('No se encontraron calificaciones');
          setResultados([]);
          return;
        }

        const resultadosFinales = calificaciones.map(calificacion => ({
          id: calificacion._id,
          equipo: calificacion.equipo,
          intentos: calificacion.intentos,
          puntuacionTotal: calcularPuntuacionTotal(calificacion.intentos, resReto.data.tipo)
        }));

        resultadosFinales.sort((a, b) => b.puntuacionTotal - a.puntuacionTotal);
        setResultados(resultadosFinales);
        console.log('Resultados finales:', resultadosFinales);
      } catch (error) {
        console.error('Error al obtener los resultados:', error);
        setError(error.message || 'Ocurrió un error al cargar los resultados');
      }
    };
    fetchResultados();
  }, [params.id]);

  if (error) return <div>Error: {error}</div>;
  if (!reto) return <div>Cargando...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Resultados del Reto: {reto.nombre}</h1>
      {resultados.length === 0 ? (
        <p>No hay resultados disponibles para este reto.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
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
      <div className="mt-4">
        <Link href={`/retos/${reto._id}`} className="bg-gray-500 text-white px-4 py-2 rounded">
          Volver al reto
        </Link>
      </div>
    </div>
  );
}