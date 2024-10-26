//src/app/torneos/[id]/editar/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function EditarTorneoPage({ params }) {
  const router = useRouter();
  const [torneo, setTorneo] = useState({
    nombre: "",
    fechaInicio: "",
    fechaFin: "",
    descripcion: "",
    estado: "",
  });

  useEffect(() => {
    const fetchTorneo = async () => {
      try {
        const res = await axios.get(`/api/torneos/${params.id}`);
        const torneoData = res.data;
        setTorneo({
          ...torneoData,
          fechaInicio: torneoData.fechaInicio.split("T")[0],
          fechaFin: torneoData.fechaFin.split("T")[0],
        });
      } catch (error) {
        console.error("Error al obtener el torneo:", error);
      }
    };
    fetchTorneo();
  }, [params.id]);

  const handleChange = (e) => {
    setTorneo({ ...torneo, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/torneos/${params.id}`, torneo);
      router.push(`/torneos/${params.id}`);
    } catch (error) {
      console.error("Error al actualizar el torneo:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Editar Torneo</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nombre" className="block">
            Nombre:
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={torneo.nombre}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label htmlFor="fechaInicio" className="block">
            Fecha de inicio:
          </label>
          <input
            type="date"
            id="fechaInicio"
            name="fechaInicio"
            value={torneo.fechaInicio}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label htmlFor="fechaFin" className="block">
            Fecha de fin:
          </label>
          <input
            type="date"
            id="fechaFin"
            name="fechaFin"
            value={torneo.fechaFin}
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
            value={torneo.descripcion}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          ></textarea>
        </div>
        <div>
          <label htmlFor="estado" className="block">
            Estado:
          </label>
          <select
            id="estado"
            name="estado"
            value={torneo.estado}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="Planificado">Planificado</option>
            <option value="En progreso">En progreso</option>
            <option value="Finalizado">Finalizado</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Actualizar Torneo
        </button>
      </form>
    </div>
  );
}
