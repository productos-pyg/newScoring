'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function CalificarEquipoPage({ params }) {
  const router = useRouter();
  const [reto, setReto] = useState(null);
  const [equipo, setEquipo] = useState(null);
  const [tiempoRestante, setTiempoRestante] = useState(180);
  const [calificacionIniciada, setCalificacionIniciada] = useState(false);
  const [tiempoFinalizado, setTiempoFinalizado] = useState(false);
  const [tareas, setTareas] = useState({
    salirInicio: false,
    superarInterseccionIda: false,
    detenerseEnTorre: false,
    depositarPelota: false,
    devolverseInicio: false,
    superarInterseccionRegreso: false,
    regresarInicio: false
  });
  const [pelotasAdicionales, setPelotasAdicionales] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const retoResponse = await axios.get(`/api/retos/${params.retoId}`);
        setReto(retoResponse.data);
        const equipoResponse = await axios.get(`/api/equipos/${params.equipoId}`);
        setEquipo(equipoResponse.data);
      } catch (error) {
        console.error('Error al obtener datos:', error);
      }
    };
    fetchData();
  }, [params.retoId, params.equipoId]);

  useEffect(() => {
    let intervalo;
    if (calificacionIniciada && tiempoRestante > 0) {
      intervalo = setInterval(() => {
        setTiempoRestante((prevTiempo) => {
          if (prevTiempo <= 1) {
            clearInterval(intervalo);
            setTiempoFinalizado(true);
            return 0;
          }
          return prevTiempo - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalo);
  }, [calificacionIniciada, tiempoRestante]);

  const iniciarCalificacion = () => {
    setCalificacionIniciada(true);
    setTiempoRestante(180);
    setTiempoFinalizado(false);
    setTareas({
      salirInicio: false,
      superarInterseccionIda: false,
      detenerseEnTorre: false,
      depositarPelota: false,
      devolverseInicio: false,
      superarInterseccionRegreso: false,
      regresarInicio: false
    });
    setPelotasAdicionales(0);
  };

  const handleTareaChange = (tarea) => {
    setTareas(prevTareas => ({ ...prevTareas, [tarea]: !prevTareas[tarea] }));
  };

  const calcularPuntuacion = () => {
    let puntuacion = 0;
    if (tareas.salirInicio) puntuacion += 25;
    if (tareas.superarInterseccionIda) puntuacion += 25;
    if (tareas.detenerseEnTorre) puntuacion += 100;
    if (tareas.depositarPelota) puntuacion += 100;
    if (tareas.devolverseInicio) puntuacion += 25;
    if (tareas.superarInterseccionRegreso) puntuacion += 25;
    if (tareas.regresarInicio) puntuacion += 100;
    puntuacion += pelotasAdicionales;
    return puntuacion;
  };

  const enviarCalificacion = async () => {
    try {
      const response = await axios.post('/api/calificaciones', {
        equipo: params.equipoId,
        reto: params.retoId,
        juez: '66fd725c056f60d8d3c282ec',
        puntuacion: calcularPuntuacion(),
        detallesTareas: JSON.stringify(tareas),
        tiempoUtilizado: 180 - tiempoRestante,
        pelotasAdicionales: pelotasAdicionales,
        comentarios: 'Calificación completada'
      });
      console.log('Respuesta del servidor:', response.data);
      alert('Calificación enviada con éxito');
      router.push(`/jueces/retos/${params.retoId}`);
    } catch (error) {
      console.error('Error al enviar la calificación:', error);
      alert('Error al enviar la calificación: ' + error.response?.data?.error || error.message);
    }
  };

  if (!reto || !equipo) return <div>Cargando...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Calificar equipo: {equipo.nombre}</h1>
      <h2 className="text-xl mb-2">Reto: {reto.nombre}</h2>
      
      {!calificacionIniciada ? (
        <button 
          onClick={iniciarCalificacion}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Iniciar Calificación
        </button>
      ) : (
        <div>
          {tiempoFinalizado ? (
            <p className="text-xl mb-4 text-red-500">Tiempo finalizado</p>
          ) : (
            <p className="text-xl mb-4">Tiempo restante: {tiempoRestante} segundos</p>
          )}
          <div className="space-y-2">
            {Object.entries(tareas).map(([tarea, completada]) => (
              <div key={tarea}>
                <input 
                  type="checkbox" 
                  id={tarea} 
                  checked={completada}
                  onChange={() => handleTareaChange(tarea)}
                  disabled={tiempoFinalizado}
                />
                <label htmlFor={tarea} className="ml-2">{tarea.replace(/([A-Z])/g, ' $1').trim()}</label>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <label htmlFor="pelotasAdicionales" className="block">Pelotas adicionales:</label>
            <input 
              type="number" 
              id="pelotasAdicionales"
              value={pelotasAdicionales}
              onChange={(e) => setPelotasAdicionales(Number(e.target.value))}
              className="border p-2 rounded"
              disabled={!tiempoFinalizado}
            />
          </div>
          <p className="text-xl mt-4">Puntuación total: {calcularPuntuacion()}</p>
          <button 
            onClick={enviarCalificacion}
            className="bg-green-500 text-white px-4 py-2 rounded mt-4"
            disabled={!tiempoFinalizado}
          >
            Terminar Calificación
          </button>
        </div>
      )}
    </div>
  );
}