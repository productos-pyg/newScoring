//src/app/equipos/[id]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

export default function EquipoDetallePage({ params }) {
  const router = useRouter();
  const [equipo, setEquipo] = useState(null);
  const [calificaciones, setCalificaciones] = useState([]);
  const [nuevaCalificacion, setNuevaCalificacion] = useState({
    puntuacion: '',
    comentarios: ''
  });

  useEffect(() => {
    const fetchEquipoYCalificaciones = async () => {
      try {
        const resEquipo = await axios.get(`/api/equipos/${params.id}`);
        setEquipo(resEquipo.data);
        const resCalificaciones = await axios.get(`/api/calificaciones?equipoId=${params.id}`);
        setCalificaciones(resCalificaciones.data);
      } catch (error) {
        console.error('Error al obtener los datos:', error);
      }
    };
    fetchEquipoYCalificaciones();
  }, [params.id]);

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este equipo?')) {
      try {
        await axios.delete(`/api/equipos/${params.id}`);
        router.push(`/retos/${equipo.reto._id}`);
      } catch (error) {
        console.error('Error al eliminar el equipo:', error);
      }
    }
  };

  const handleCalificacionChange = (e) => {
    setNuevaCalificacion({ ...nuevaCalificacion, [e.target.name]: e.target.value });
  };

  const handleCalificacionSubmit = async (e) => {
    e.preventDefault();
    try {
      const calificacionData = {
        ...nuevaCalificacion,
        equipo: params.id,
        reto: equipo.reto._id,
        juez: '66fd725c056f60d8d3c282ec' // Esto deberá ser reemplazado por el ID real del juez una vez implementemos la autenticación
      };
      console.log('Datos de calificación a enviar:', calificacionData);
      const res = await axios.post('/api/calificaciones', calificacionData);
      setCalificaciones([...calificaciones, res.data]);
      setNuevaCalificacion({ puntuacion: '', comentarios: '' });
    } catch (error) {
      console.error('Error al crear la calificación:', error.response?.data || error.message);
    }
  };

  if (!equipo) return <div>Cargando...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{equipo.nombre}</h1>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-xl font-bold mb-2">Miembros:</h2>
        <ul className="list-disc list-inside mb-4">
          {equipo.miembros.map((miembro, index) => (
            <li key={index}>
              {miembro.nombre} - {miembro.edad} años
            </li>
          ))}
        </ul>
        <h2 className="text-xl font-bold mb-2">Coach:</h2>
        <p>Nombre: {equipo.coach.nombre}</p>
        <p>Email: {equipo.coach.email}</p>
        <p className="mt-4">
          <span className="font-bold">Reto:</span>{' '}
          <Link href={`/retos/${equipo.reto._id}`} className="text-blue-500">
            {equipo.reto.nombre}
          </Link>
        </p>
      </div>
      
      <div className="mt-4 space-x-2">
        <Link href={`/equipos/${equipo._id}/editar`} className="bg-yellow-500 text-white px-4 py-2 rounded">
          Editar
        </Link>
        <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded">
          Eliminar
        </button>
        <Link href={`/retos/${equipo.reto._id}`} className="bg-gray-500 text-white px-4 py-2 rounded">
          Volver al reto
        </Link>
      </div>

      <h2 className="text-xl font-bold mt-8 mb-4">Calificaciones</h2>
      <ul>
        {calificaciones.map((calificacion) => (
          <li key={calificacion._id} className="mb-2">
            Puntuación: {calificacion.puntuacion} - Juez: {calificacion.juez.nombre}
            <p>{calificacion.comentarios}</p>
          </li>
        ))}
      </ul>

      <h3 className="text-lg font-bold mt-6 mb-2">Añadir nueva calificación</h3>
      <form onSubmit={handleCalificacionSubmit} className="space-y-4">
        <div>
          <label htmlFor="puntuacion" className="block">Puntuación:</label>
          <input
            type="number"
            id="puntuacion"
            name="puntuacion"
            value={nuevaCalificacion.puntuacion}
            onChange={handleCalificacionChange}
            required
            min="0"
            max="100"
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label htmlFor="comentarios" className="block">Comentarios:</label>
          <textarea
            id="comentarios"
            name="comentarios"
            value={nuevaCalificacion.comentarios}
            onChange={handleCalificacionChange}
            className="w-full border p-2 rounded"
          ></textarea>
        </div>
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
          Añadir Calificación
        </button>
      </form>
    </div>
  );
}