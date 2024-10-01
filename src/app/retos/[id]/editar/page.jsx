"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function EditarRetoPage({ params }) {
  const router = useRouter();
  const [reto, setReto] = useState({
    nombre: "",
    descripcion: "",
    tipo: "",
    puntuacionMaxima: 0,
    reglas: {},
    categoriaEdad: "",
    duracionMaxima: 0,
    participantesPorEquipo: { min: 0, max: 0 },
  });

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setReto((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setReto((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/retos/${params.id}`, {
        ...reto,
        puntuacionMaxima: Number(reto.puntuacionMaxima),
        duracionMaxima: Number(reto.duracionMaxima),
        participantesPorEquipo: {
          min: Number(reto.participantesPorEquipo.min),
          max: Number(reto.participantesPorEquipo.max),
        },
      });
      router.push(`/retos/${params.id}`);
    } catch (error) {
      console.error("Error al actualizar el reto:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Editar Reto</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nombre" className="block">
            Nombre:
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={reto.nombre}
            onChange={handleChange}
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
            value={reto.descripcion}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          ></textarea>
        </div>
        <div>
          <label htmlFor="tipo" className="block">
            Tipo de reto:
          </label>
          <select
            id="tipo"
            name="tipo"
            value={reto.tipo}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          >
            <option value="FireFighting">Fire Fighting</option>
            <option value="LineFollowing">Line Following</option>
            <option value="Exploradores">Exploradores</option>
            <option value="BabyExploradores">Baby Exploradores</option>
            <option value="RecolectorObjetos">Recolector de Objetos</option>
          </select>
        </div>
        <div>
          <label htmlFor="puntuacionMaxima" className="block">
            Puntuación máxima:
          </label>
          <input
            type="number"
            id="puntuacionMaxima"
            name="puntuacionMaxima"
            value={reto.puntuacionMaxima}
            onChange={handleChange}
            required
            min="0"
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label htmlFor="categoriaEdad" className="block">
            Categoría de edad:
          </label>
          <select
            id="categoriaEdad"
            name="categoriaEdad"
            value={reto.categoriaEdad}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          >
            <option value="Junior">Junior</option>
            <option value="Juvenil">Juvenil</option>
            <option value="Senior">Senior</option>
            <option value="BabyExploradores">Baby Exploradores</option>
          </select>
        </div>
        <div>
          <label htmlFor="duracionMaxima" className="block">
            Duración máxima (segundos):
          </label>
          <input
            type="number"
            id="duracionMaxima"
            name="duracionMaxima"
            value={reto.duracionMaxima}
            onChange={handleChange}
            required
            min="0"
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label htmlFor="participantesMin" className="block">
            Mínimo de participantes por equipo:
          </label>
          <input
            type="number"
            id="participantesMin"
            name="participantesPorEquipo.min"
            value={reto.participantesPorEquipo.min}
            onChange={handleChange}
            required
            min="1"
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label htmlFor="participantesMax" className="block">
            Máximo de participantes por equipo:
          </label>
          <input
            type="number"
            id="participantesMax"
            name="participantesPorEquipo.max"
            value={reto.participantesPorEquipo.max}
            onChange={handleChange}
            required
            min="1"
            className="w-full border p-2 rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Actualizar Reto
        </button>
      </form>
    </div>
  );
}
