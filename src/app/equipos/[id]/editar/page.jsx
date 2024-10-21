'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function EditarEquipoPage({ params }) {
  const router = useRouter();
  const [equipo, setEquipo] = useState({
    nombre: '',
    miembros: [],
    coach: { nombre: '', email: '' }
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('miembros')) {
      const [_, index, field] = name.split('.');
      const newMiembros = [...equipo.miembros];
      newMiembros[index] = { ...newMiembros[index], [field]: value };
      setEquipo({ ...equipo, miembros: newMiembros });
    } else if (name.startsWith('coach')) {
      setEquipo({ ...equipo, coach: { ...equipo.coach, [name.split('.')[1]]: value } });
    } else {
      setEquipo({ ...equipo, [name]: value });
    }
  };

  const handleAddMiembro = () => {
    setEquipo({ ...equipo, miembros: [...equipo.miembros, { nombre: '', edad: '' }] });
  };

  const handleRemoveMiembro = (index) => {
    const newMiembros = equipo.miembros.filter((_, i) => i !== index);
    setEquipo({ ...equipo, miembros: newMiembros });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/equipos/${params.id}`, {
        ...equipo,
        miembros: equipo.miembros.map(m => ({ ...m, edad: Number(m.edad) }))
      });
      router.push(`/equipos/${params.id}`);
    } catch (error) {
      console.error('Error al actualizar el equipo:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Editar Equipo</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nombre" className="block">Nombre del equipo:</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={equipo.nombre}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block">Miembros:</label>
          {equipo.miembros.map((miembro, index) => (
            <div key={index} className="flex space-x-2 mb-2">
              <input
                type="text"
                name={`miembros.${index}.nombre`}
                value={miembro.nombre}
                onChange={handleChange}
                placeholder="Nombre"
                required
                className="flex-1 border p-2 rounded"
              />
              <input
                type="number"
                name={`miembros.${index}.edad`}
                value={miembro.edad}
                onChange={handleChange}
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
            value={equipo.coach.nombre}
            onChange={handleChange}
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
            value={equipo.coach.email}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Actualizar Equipo
        </button>
      </form>
    </div>
  );
}