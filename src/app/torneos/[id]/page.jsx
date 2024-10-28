//src/app/torneos/[id]/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import RouteGuard from "@/components/RouteGuard";


export default function TorneoDetallePage({ params }) {
  const router = useRouter();
  const [torneo, setTorneo] = useState(null);
  const [retos, setRetos] = useState([]);
  const [nuevoReto, setNuevoReto] = useState({
    nombre: "",
    descripcion: "",
    tipo: "FireFighting",
    puntuacionMaxima: 0,
    reglas: {},
    categoriaEdad: "Junior",
    duracionMaxima: 180,
    participantesPorEquipo: { min: 2, max: 4 },
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
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setNuevoReto((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setNuevoReto((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRetoSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/retos", {
        ...nuevoReto,
        torneo: params.id,
        puntuacionMaxima: Number(nuevoReto.puntuacionMaxima),
        duracionMaxima: Number(nuevoReto.duracionMaxima),
        participantesPorEquipo: {
          min: Number(nuevoReto.participantesPorEquipo.min),
          max: Number(nuevoReto.participantesPorEquipo.max),
        },
      });
      setRetos([...retos, res.data]);
      setNuevoReto({
        nombre: "",
        descripcion: "",
        tipo: "FireFighting",
        puntuacionMaxima: 0,
        reglas: {},
        categoriaEdad: "Junior",
        duracionMaxima: 180,
        participantesPorEquipo: { min: 2, max: 4 },
      });
    } catch (error) {
      console.error("Error al crear el reto:", error);
    }
  };

  if (!torneo) return <div>Cargando...</div>;

  return (
    <RouteGuard allowedRoles={['admin']}>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">{torneo.nombre}</h1>
        <div className="flex justify-between">
          <p>
            Fecha de inicio: {new Date(torneo.fechaInicio).toLocaleDateString()}
          </p>
          <p>Fecha de fin: {new Date(torneo.fechaFin).toLocaleDateString()}</p>
        </div>
        <p>Estado: {torneo.estado}</p>
        <p>Descripción: {torneo.descripcion}</p>
        <div className="mt-4 space-x-2">
          <Link
            href={`/torneos/${torneo._id}/editar`}
            className="bg-[#81b71f] text-white px-4 py-2 rounded"
          >
            Editar
          </Link>
          <button
            onClick={handleDelete}
            className="bg-[#e94947] text-white px-4 py-1 rounded"
          >
            Eliminar
          </button>
          <Link
            href="/torneos"
            className="bg-[#211551] text-white px-4 py-2 rounded"
          >
            Volver
          </Link>
          <Dialog>
          <DialogTrigger className="bg-[#1097d5] text-white p-1.5 rounded-sm shadow-md">Nuevo Reto</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear nuevo reto</DialogTitle>
              <DialogDescription>
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
                  <label htmlFor="tipo" className="block">
                    Tipo de reto:
                  </label>
                  <select
                    id="tipo"
                    name="tipo"
                    value={nuevoReto.tipo}
                    onChange={handleRetoChange}
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
                  <label htmlFor="categoriaEdad" className="block">
                    Categoría de edad:
                  </label>
                  <select
                    id="categoriaEdad"
                    name="categoriaEdad"
                    value={nuevoReto.categoriaEdad}
                    onChange={handleRetoChange}
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
                    value={nuevoReto.duracionMaxima}
                    onChange={handleRetoChange}
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
                    value={nuevoReto.participantesPorEquipo.min}
                    onChange={handleRetoChange}
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
                    value={nuevoReto.participantesPorEquipo.max}
                    onChange={handleRetoChange}
                    required
                    min="1"
                    className="w-full border p-2 rounded"
                  />
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
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
        </div>

        <h2 className="text-xl font-bold mt-8 mb-4">Listado de Retos</h2>
        <div className="h-[50vh] border p-2 shadow-md rounded-md overflow-y-auto">
          <ul>
            {retos.map((reto) => (
              <li key={reto._id} className="mb-2">
                <Link href={`/retos/${reto._id}`} className="text-[#1097d5] font-semibold hover:underline hover:text-[#81b71f]">
                  {reto.nombre}
                </Link>
              {/*  {` - Puntuación máxima: ${reto.puntuacionMaxima}`} */}
              </li>
            ))}
          </ul>
        </div>

  {/*       <Dialog>
          <DialogTrigger className="bg-[#1097d5] text-white p-2 rounded-md shadow-md">Nuevo Reto</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear nuevo reto</DialogTitle>
              <DialogDescription>
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
                  <label htmlFor="tipo" className="block">
                    Tipo de reto:
                  </label>
                  <select
                    id="tipo"
                    name="tipo"
                    value={nuevoReto.tipo}
                    onChange={handleRetoChange}
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
                  <label htmlFor="categoriaEdad" className="block">
                    Categoría de edad:
                  </label>
                  <select
                    id="categoriaEdad"
                    name="categoriaEdad"
                    value={nuevoReto.categoriaEdad}
                    onChange={handleRetoChange}
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
                    value={nuevoReto.duracionMaxima}
                    onChange={handleRetoChange}
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
                    value={nuevoReto.participantesPorEquipo.min}
                    onChange={handleRetoChange}
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
                    value={nuevoReto.participantesPorEquipo.max}
                    onChange={handleRetoChange}
                    required
                    min="1"
                    className="w-full border p-2 rounded"
                  />
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
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog> */}


  {/*       <h3 className="text-lg font-bold mt-6 mb-2">Añadir nuevo reto</h3> */}
  {/*       <form onSubmit={handleRetoSubmit} className="space-y-4">
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
            <label htmlFor="tipo" className="block">
              Tipo de reto:
            </label>
            <select
              id="tipo"
              name="tipo"
              value={nuevoReto.tipo}
              onChange={handleRetoChange}
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
            <label htmlFor="categoriaEdad" className="block">
              Categoría de edad:
            </label>
            <select
              id="categoriaEdad"
              name="categoriaEdad"
              value={nuevoReto.categoriaEdad}
              onChange={handleRetoChange}
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
              value={nuevoReto.duracionMaxima}
              onChange={handleRetoChange}
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
              value={nuevoReto.participantesPorEquipo.min}
              onChange={handleRetoChange}
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
              value={nuevoReto.participantesPorEquipo.max}
              onChange={handleRetoChange}
              required
              min="1"
              className="w-full border p-2 rounded"
            />
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
        </form> */}
      </div>
    </RouteGuard>
  );
}
