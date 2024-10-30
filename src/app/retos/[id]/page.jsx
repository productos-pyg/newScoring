//src/app/retos/[id]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { FaFire, FaArrowTrendUp, FaHelmetSafety} from "react-icons/fa6"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import RouteGuard from '@/components/RouteGuard';


export default function RetoDetallePage({ params }) {
  const router = useRouter();
  const [reto, setReto] = useState(null);
  const [equipos, setEquipos] = useState([]);
  const [nuevoEquipo, setNuevoEquipo] = useState({
    nombre: '',
    miembros: [{ nombre: '', edad: '' }],
    coach: { nombre: '', email: '' }
  });

  useEffect(() => {
    const fetchRetoYEquipos = async () => {
      try {
        const resReto = await axios.get(`/api/retos/${params.id}`);
        setReto(resReto.data);
        const resEquipos = await axios.get(`/api/equipos?retoId=${params.id}`);
        setEquipos(resEquipos.data);
      } catch (error) {
        console.error('Error al obtener los datos:', error);
      }
    };
    fetchRetoYEquipos();
  }, [params.id]);

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este reto?')) {
      try {
        await axios.delete(`/api/retos/${params.id}`);
        router.push(`/torneos/${reto.torneo._id}`);
      } catch (error) {
        console.error('Error al eliminar el reto:', error);
      }
    }
  };

  const handleEquipoChange = (e, index) => {
    const { name, value } = e.target;
    if (name.startsWith('miembros')) {
      const newMiembros = [...nuevoEquipo.miembros];
      newMiembros[index] = { ...newMiembros[index], [name.split('.')[1]]: value };
      setNuevoEquipo({ ...nuevoEquipo, miembros: newMiembros });
    } else if (name.startsWith('coach')) {
      setNuevoEquipo({ ...nuevoEquipo, coach: { ...nuevoEquipo.coach, [name.split('.')[1]]: value } });
    } else {
      setNuevoEquipo({ ...nuevoEquipo, [name]: value });
    }
  };

  const handleAddMiembro = () => {
    setNuevoEquipo({ ...nuevoEquipo, miembros: [...nuevoEquipo.miembros, { nombre: '', edad: '' }] });
  };

  const handleRemoveMiembro = (index) => {
    const newMiembros = nuevoEquipo.miembros.filter((_, i) => i !== index);
    setNuevoEquipo({ ...nuevoEquipo, miembros: newMiembros });
  };

  const handleEquipoSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/equipos', {
        ...nuevoEquipo,
        reto: params.id,
        miembros: nuevoEquipo.miembros.map(m => ({ ...m, edad: Number(m.edad) }))
      });
      setEquipos([...equipos, res.data]);
      setNuevoEquipo({
        nombre: '',
        miembros: [{ nombre: '', edad: '' }],
        coach: { nombre: '', email: '' }
      });
    } catch (error) {
      console.error('Error al crear el equipo:', error);
    }
  };

  if (!reto) return <div>Cargando...</div>;
  //console.log(reto)

  return (
    <RouteGuard allowedRoles={['admin', 'juez']}>
    <div className="container mx-auto p-4">
      <div className='flex gap-4'>
        <h1 className="text-2xl font-bold mb-4">{reto.nombre}</h1>
        {reto.tipo==="Exploradores" 
          ? <FaHelmetSafety size={28} className='text-[#81b71f]'/> 
          : reto.tipo==="FireFighting" 
            ? <FaFire size={28} className='text-[#e94947]'/> 
            : <FaArrowTrendUp size={28} className='text-[#1097d5]'/>
        }
      </div>
      <div className="bg-white shadow-md rounded px-8 pt-2 pb-2 mb-4">
        <p className="mb-2"><span className="font-bold">Descripción:</span> <span className='text-xs'>{reto.descripcion}</span></p>
        <div className='flex justify-between'>
          <p className="mb-2"><span className="font-bold">Tipo de reto:</span> {reto.tipo}</p>
          {/* <p className="mb-2"><span className="font-bold">Puntuación máxima:</span> {reto.puntuacionMaxima}</p> */}
          <p className="mb-2"><span className="font-bold">Categoría:</span> {reto.categoriaEdad}</p>
        </div>
        <div className='flex justify-between'>
          <p className="mb-2"><span className="font-bold">Duración máxima:</span> {reto.duracionMaxima} segundos</p>
          <p className="mb-2"><span className="font-bold">Participantes por equipo:</span> Mínimo {reto.participantesPorEquipo.min}, Máximo {reto.participantesPorEquipo.max}</p>
          {/* <p className="mb-2"><span className="font-bold">Torneo:</span> <Link href={`/torneos/${reto.torneo._id}`} className="text-blue-500">{reto.torneo.nombre}</Link></p> */}
        </div>
      </div>
      
      <div className="mt-4 space-x-2">
        <Link href={`/retos/${reto._id}/editar`} className="bg-[#81b71f] text-white px-4 py-2 rounded">
          Editar
        </Link>
        <button onClick={handleDelete} className="bg-[#e94947] text-white px-4 py-1 rounded">
          Eliminar
        </button>
        <Link href={`/torneos/${reto.torneo}`} className="bg-[#211551] text-white px-4 py-2 rounded">
          Volver al torneo
        </Link>
        <Link href={`/retos/${reto._id}/resultados`} className="bg-[#1097d5] text-white px-4 py-2 rounded">
          Ver Resultados
        </Link>
        <Dialog>
        <DialogTrigger className='bg-[#f59c10] p-1.5 rounded-sm text-slate-100'>Nuevo Equipo</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir nuevo equipo</DialogTitle>
            <DialogDescription>
            <form onSubmit={handleEquipoSubmit} className="space-y-4">
              <div>
                <label htmlFor="nombre" className="block">Nombre del equipo:</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={nuevoEquipo.nombre}
                  onChange={handleEquipoChange}
                  required
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block">Miembros:</label>
                {nuevoEquipo.miembros.map((miembro, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      name={`miembros.nombre`}
                      value={miembro.nombre}
                      onChange={(e) => handleEquipoChange(e, index)}
                      placeholder="Nombre"
                      required
                      className="flex-1 border p-2 rounded"
                    />
                    <input
                      type="number"
                      name={`miembros.edad`}
                      value={miembro.edad}
                      onChange={(e) => handleEquipoChange(e, index)}
                      placeholder="Edad"
                      required
                      min="0"
                      className="w-20 border p-2 rounded"
                    />
                    {index > 0 && (
                      <button type="button" onClick={() => handleRemoveMiembro(index)} className="bg-red-500 text-white px-2 py-1 rounded">
                        Eliminar
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={handleAddMiembro} className="bg-[#81b71f] text-white px-2 py-1 rounded">
                  Añadir miembro
                </button>
              </div>
              <div>
                <label htmlFor="coachNombre" className="block">Nombre del coach:</label>
                <input
                  type="text"
                  id="coachNombre"
                  name="coach.nombre"
                  value={nuevoEquipo.coach.nombre}
                  onChange={handleEquipoChange}
                  required
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label htmlFor="coachEmail" className="block">Email del coach:</label>
                <input
                  type="email"
                  id="coachEmail"
                  name="coach.email"
                  value={nuevoEquipo.coach.email}
                  onChange={handleEquipoChange}
                  required
                  className="w-full border p-2 rounded"
                />
              </div>
              <button type="submit" className="bg-[#1097d5] text-white px-4 py-2 rounded">
                Añadir Equipo
              </button>
            </form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      </div>



      <h2 className="text-xl font-bold mt-6 mb-4 text-[#211551]">Equipos:</h2>
      <ul className='border shadow-md rounded-md p-2 h-[40vh] overflow-y-auto'>
        {equipos.map((equipo) => (
          <li key={equipo._id} className="mb-2">
            <Link href={`/equipos/${equipo._id}`} className="text-lg font-semibold text-[#1097d5]">
              {equipo.nombre}
            </Link>
            <span className='text-xs font-semibold text-slate-400'>
              {` - Miembros: ${equipo.miembros.length}`}
            </span>
          </li>
        ))}
      </ul>

{/*       <h3 className="text-lg font-bold mt-6 mb-2">Añadir nuevo equipo</h3> */}
{/*       <form onSubmit={handleEquipoSubmit} className="space-y-4">
        <div>
          <label htmlFor="nombre" className="block">Nombre del equipo:</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={nuevoEquipo.nombre}
            onChange={handleEquipoChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block">Miembros:</label>
          {nuevoEquipo.miembros.map((miembro, index) => (
            <div key={index} className="flex space-x-2 mb-2">
              <input
                type="text"
                name={`miembros.nombre`}
                value={miembro.nombre}
                onChange={(e) => handleEquipoChange(e, index)}
                placeholder="Nombre"
                required
                className="flex-1 border p-2 rounded"
              />
              <input
                type="number"
                name={`miembros.edad`}
                value={miembro.edad}
                onChange={(e) => handleEquipoChange(e, index)}
                placeholder="Edad"
                required
                min="0"
                className="w-20 border p-2 rounded"
              />
              {index > 0 && (
                <button type="button" onClick={() => handleRemoveMiembro(index)} className="bg-red-500 text-white px-2 py-1 rounded">
                  Eliminar
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={handleAddMiembro} className="bg-green-500 text-white px-2 py-1 rounded">
            Añadir miembro
          </button>
        </div>
        <div>
          <label htmlFor="coachNombre" className="block">Nombre del coach:</label>
          <input
            type="text"
            id="coachNombre"
            name="coach.nombre"
            value={nuevoEquipo.coach.nombre}
            onChange={handleEquipoChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label htmlFor="coachEmail" className="block">Email del coach:</label>
          <input
            type="email"
            id="coachEmail"
            name="coach.email"
            value={nuevoEquipo.coach.email}
            onChange={handleEquipoChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Añadir Equipo
        </button>
      </form> */}
    </div>
    </RouteGuard>
  );
}