"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

export default function RetoDetallePage({ params }) {
  const router = useRouter();
  const [reto, setReto] = useState(null);

  useEffect(() => {
    const fetchReto = async () => {
      try {
        const res = await axios.get(`/api/retos/${params.id}`);
        setReto(res.data);
      } catch (error) {
        console.error("Error al obtener el reto:", error);
      }
    };
    fetchReto();
  }, [params.id]);

  const handleDelete = async () => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este reto?")) {
      try {
        await axios.delete(`/api/retos/${params.id}`);
        router.push(`/torneos/${reto.torneo._id}`);
      } catch (error) {
        console.error("Error al eliminar el reto:", error);
      }
    }
  };

  if (!reto) return <div>Cargando...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{reto.nombre}</h1>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <p className="mb-2">
          <span className="font-bold">Descripción:</span> {reto.descripcion}
        </p>
        <p className="mb-2">
          <span className="font-bold">Tipo de reto:</span> {reto.tipo}
        </p>
        <p className="mb-2">
          <span className="font-bold">Puntuación máxima:</span>{" "}
          {reto.puntuacionMaxima}
        </p>
        <p className="mb-2">
          <span className="font-bold">Categoría de edad:</span>{" "}
          {reto.categoriaEdad}
        </p>
        <p className="mb-2">
          <span className="font-bold">Duración máxima:</span>{" "}
          {reto.duracionMaxima} segundos
        </p>
        <p className="mb-2">
          <span className="font-bold">Participantes por equipo:</span> Mínimo{" "}
          {reto.participantesPorEquipo.min}, Máximo{" "}
          {reto.participantesPorEquipo.max}
        </p>
        <p className="mb-2">
          <span className="font-bold">Torneo:</span>{" "}
          <Link href={`/torneos/${reto.torneo._id}`} className="text-blue-500">
            {reto.torneo.nombre}
          </Link>
        </p>

        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">Reglas específicas:</h2>
          {Object.entries(reto.reglas).length > 0 ? (
            <ul className="list-disc list-inside">
              {Object.entries(reto.reglas).map(([key, value]) => (
                <li key={key}>
                  <span className="font-semibold">{key}:</span>{" "}
                  {JSON.stringify(value)}
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay reglas específicas definidas para este reto.</p>
          )}
        </div>
      </div>

      <div className="mt-4 space-x-2">
        <Link
          href={`/retos/${reto._id}/editar`}
          className="bg-yellow-500 text-white px-4 py-2 rounded"
        >
          Editar
        </Link>
        <button
          onClick={handleDelete}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Eliminar
        </button>
        <Link
          href={`/torneos/${reto.torneo._id}`}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Volver al torneo
        </Link>
      </div>
    </div>
  );
}
