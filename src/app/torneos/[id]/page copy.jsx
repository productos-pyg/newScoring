"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

export default function TorneoDetallePage({ params }) {
  const router = useRouter();
  const [torneo, setTorneo] = useState(null);
  const [retos, setRetos] = useState([]);
  const [nuevoReto, setNuevoReto] = useState({
    nombre: "",
    descripcion: "",
    puntuacionMaxima: 0,
  });

  useEffect(() => {
    const fetchTorneo = async () => {
      try {
        const resTorneo = await axios.get(`/api/torneos/${params.id}`);
        setTorneo(resTorneo.data);
        const resRetos = await axios.get(`/api/retos?torneoId=${params.id}`);
        setRetos(resRetos.data);
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };
    fetchTorneo();
  }, [params.id]);

  const handleDelete = async () => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este torneo?")) {
      try {
        await axios.delete(`/api/torneos/${params.id}`);
        router.push("/torneos");
      } catch (error) {
        console.error("Error al eliminar el torneo:", error);
      }
    }
  };

  const handleRetoChange = (e) => {
    setNuevoReto({ ...nuevoReto, [e.target.name]: e.target.value });
  };

  const handleRetoSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/retos", {
        ...nuevoReto,
        torneo: params.id,
        puntuacionMaxima: Number(nuevoReto.puntuacionMaxima),
      });
      setRetos([...retos, res.data]);
      setNuevoReto({ nombre: "", descripcion: "", puntuacionMaxima: 0 });
    } catch (error) {
      console.error("Error al crear el reto:", error);
    }
  };

  if (!torneo) return <div>Cargando...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{torneo.nombre}</h1>
      <p>
        Fecha de inicio: {new Date(torneo.fechaInicio).toLocaleDateString()}
      </p>
      <p>Fecha de fin: {new Date(torneo.fechaFin).toLocaleDateString()}</p>
      <p>Estado: {torneo.estado}</p>
      <p>Descripción: {torneo.descripcion}</p>
      <div className="mt-4 space-x-2">
        <Link
          href={`/torneos/${torneo._id}/editar`}
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
          href="/torneos"
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Volver a la lista
        </Link>
      </div>

      <h2 className="text-xl font-bold mt-8 mb-4">Retos</h2>
      <ul>
        {retos.map((reto) => (
          <li key={reto._id} className="mb-2">
            <Link href={`/retos/${reto._id}`} className="text-blue-500">
              {reto.nombre}
            </Link>
            {` - Puntuación máxima: ${reto.puntuacionMaxima}`}
          </li>
        ))}
      </ul>

      <h3 className="text-lg font-bold mt-6 mb-2">Añadir nuevo reto</h3>
      <form onSubmit={handleRetoSubmit} className="space-y-4">
        <div>
          <label htmlFor="nombre" className="block">
            Nombre:
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={nuevoReto.nombre}
            onChange={handleRetoChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label htmlFor="descripcion" className="block">
            Descripción:
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={nuevoReto.descripcion}
            onChange={handleRetoChange}
            className="w-full border p-2 rounded"
          ></textarea>
        </div>
        <div>
          <label htmlFor="puntuacionMaxima" className="block">
            Puntuación máxima:
          </label>
          <input
            type="number"
            id="puntuacionMaxima"
            name="puntuacionMaxima"
            value={nuevoReto.puntuacionMaxima}
            onChange={handleRetoChange}
            required
            min="0"
            className="w-full border p-2 rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Añadir Reto
        </button>
      </form>
    </div>
  );
}
