'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function CalificarEnfrentamientoPage({ params }) {
  const router = useRouter();
  const [reto, setReto] = useState(null);
  const [emparejamiento, setEmparejamiento] = useState(null);
  const [puntuaciones, setPuntuaciones] = useState({ equipo1: 0, equipo2: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const retoResponse = await axios.get(`/api/retos/${params.retoId}`);
        console.log('Reto data:', retoResponse.data);
        setReto(retoResponse.data);
        const emparejamientoEncontrado = retoResponse.data.emparejamientos.find(
          e => e._id === params.emparejamientoId
        );
        console.log(params)
        console.log('Emparejamiento encontrado:', emparejamientoEncontrado);
        console.log('Params emparejamientoId:', params.emparejamientoId);
        setEmparejamiento(emparejamientoEncontrado);
      } catch (error) {
        console.error('Error al obtener datos:', error);
      }
    };
    fetchData();
  }, [params.retoId, params.emparejamientoId]);

  const handlePuntuacionChange = (equipo, valor) => {
    setPuntuaciones(prev => ({ ...prev, [equipo]: valor }));
  };

  const enviarCalificacion = async () => {
    try {
      await axios.post(`/api/retos/${params.retoId}/calificar-enfrentamiento`, {
        emparejamientoId: params.emparejamientoId,
        puntuaciones
      });
      alert('Calificación enviada con éxito');
      router.push(`/retos/${params.retoId}/brackets`);
    } catch (error) {
      console.error('Error al enviar la calificación:', error);
      alert('Error al enviar la calificación: ' + error.response?.data?.error || error.message);
    }
  };

  if (!reto || !emparejamiento) return <div>Cargando...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Calificar Enfrentamiento</h1>
      <h2 className="text-xl mb-4">{reto.nombre} - {reto.fase}</h2>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3>{emparejamiento.equipo1.nombre}</h3>
          <input
            type="number"
            value={puntuaciones.equipo1}
            onChange={(e) => handlePuntuacionChange('equipo1', parseInt(e.target.value))}
            className="border p-2 rounded"
          />
        </div>
        <div className="text-2xl font-bold">VS</div>
        <div>
          <h3>{emparejamiento.equipo2.nombre}</h3>
          <input
            type="number"
            value={puntuaciones.equipo2}
            onChange={(e) => handlePuntuacionChange('equipo2', parseInt(e.target.value))}
            className="border p-2 rounded"
          />
        </div>
      </div>
      <button
        onClick={enviarCalificacion}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Enviar Calificación
      </button>
    </div>
  );
}