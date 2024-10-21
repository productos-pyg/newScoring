'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function ResultadosRetoPage({ params }) {
  const [reto, setReto] = useState(null);
  const [resultados, setResultados] = useState([]);

  useEffect(() => {
    const fetchResultados = async () => {
        try {
          const resReto = await axios.get(`/api/retos/${params.id}`);
          setReto(resReto.data);
          
          const resCalificaciones = await axios.get(`/api/calificaciones?retoId=${params.id}`);
          console.log('Calificaciones recibidas:', resCalificaciones.data);
          
          // Procesar las calificaciones para obtener los resultados por equipo
          const resultadosPorEquipo = {};
          resCalificaciones.data.forEach(calificacion => {
            if (!resultadosPorEquipo[calificacion.equipo._id]) {
              resultadosPorEquipo[calificacion.equipo._id] = {
                equipo: calificacion.equipo,
                puntuacionTotal: 0,
                numCalificaciones: 0
              };
            }
            resultadosPorEquipo[calificacion.equipo._id].puntuacionTotal += calificacion.puntuacion;
            resultadosPorEquipo[calificacion.equipo._id].numCalificaciones++;
          });
      
          const resultadosFinales = Object.values(resultadosPorEquipo).map(r => ({
            ...r,
            puntuacionPromedio: r.puntuacionTotal / r.numCalificaciones
          }));
      
          resultadosFinales.sort((a, b) => b.puntuacionPromedio - a.puntuacionPromedio);
          setResultados(resultadosFinales);
        } catch (error) {
          console.error('Error al obtener los resultados:', error.response?.data || error.message);
          // Aquí puedes manejar el error, por ejemplo, mostrando un mensaje al usuario
        }
      };
    fetchResultados();
  }, [params.id]);

  if (!reto) return <div>Cargando...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Resultados del Reto: {reto.nombre}</h1>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2">Posición</th>
            <th className="border border-gray-300 p-2">Equipo</th>
            <th className="border border-gray-300 p-2">Puntuación Promedio</th>
          </tr>
        </thead>
        <tbody>
          {resultados.map((resultado, index) => (
            <tr key={resultado.equipo._id}>
              <td className="border border-gray-300 p-2">{index + 1}</td>
              <td className="border border-gray-300 p-2">
                <Link href={`/equipos/${resultado.equipo._id}`} className="text-blue-500">
                  {resultado.equipo.nombre}
                </Link>
              </td>
              <td className="border border-gray-300 p-2">{resultado.puntuacionPromedio.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4">
        <Link href={`/retos/${reto._id}`} className="bg-gray-500 text-white px-4 py-2 rounded">
          Volver al reto
        </Link>
      </div>
    </div>
  );
}