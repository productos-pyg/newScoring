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
    const fetchEquipo = async () => {
      try {
        const res = await axios.get(`/api/equipos/${params.id}`);
        setEquipo(res.data);
      } catch (error) {
        console.error('Error al obtener el equipo:', error);
      }
    };
    fetchEquipo();
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
    </div>
  );
}