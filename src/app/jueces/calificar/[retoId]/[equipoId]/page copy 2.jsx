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
  const [tareas, setTareas] = useState({});
  const [pelotasAdicionales, setPelotasAdicionales] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const retoResponse = await axios.get(`/api/retos/${params.retoId}`);
        setReto(retoResponse.data);
        const equipoResponse = await axios.get(`/api/equipos/${params.equipoId}`);
        setEquipo(equipoResponse.data);
        
        // Inicializar tareas según el tipo de reto
        if (retoResponse.data.tipo === 'LineFollowing') {
          setTareas({
            salirInicio: false,
            superarInterseccionIda: false,
            detenerseEnTorre: false,
            depositarPelota: false,
            devolverseInicio: false,
            superarInterseccionRegreso: false,
            regresarInicio: false
          });
        } else if (retoResponse.data.tipo === 'FireFighting') {
          setTareas({
            vela1: { sinPenalidad: false, conPenalidad: false },
            vela2: { sinPenalidad: false, conPenalidad: false },
            vela3: { sinPenalidad: false, conPenalidad: false },
            vela4: { sinPenalidad: false, conPenalidad: false },
          });
        }
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
    if (reto.tipo === 'LineFollowing') {
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
    } else if (reto.tipo === 'FireFighting') {
      setTareas({
        vela1: { sinPenalidad: false, conPenalidad: false },
        vela2: { sinPenalidad: false, conPenalidad: false },
        vela3: { sinPenalidad: false, conPenalidad: false },
        vela4: { sinPenalidad: false, conPenalidad: false },
      });
    }
  };

  const handleTareaChange = (tarea, subtarea = null) => {
    if (reto.tipo === 'LineFollowing') {
      setTareas(prevTareas => ({ ...prevTareas, [tarea]: !prevTareas[tarea] }));
    } else if (reto.tipo === 'FireFighting') {
      setTareas(prevTareas => ({
        ...prevTareas,
        [tarea]: { ...prevTareas[tarea], [subtarea]: !prevTareas[tarea][subtarea] }
      }));
    }
  };

  const calcularPuntuacion = () => {
    if (reto.tipo === 'LineFollowing') {
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
    } else if (reto.tipo === 'FireFighting') {
      let puntuacion = 0;
      if (tareas.vela1.sinPenalidad) puntuacion += 100;
      else if (tareas.vela1.conPenalidad) puntuacion += 50;
      if (tareas.vela2.sinPenalidad) puntuacion += 200;
      else if (tareas.vela2.conPenalidad) puntuacion += 100;
      if (tareas.vela3.sinPenalidad) puntuacion += 300;
      else if (tareas.vela3.conPenalidad) puntuacion += 150;
      if (tareas.vela4.sinPenalidad) puntuacion += 400;
      else if (tareas.vela4.conPenalidad) puntuacion += 200;
      puntuacion += tiempoRestante;
      return puntuacion;
    }
    return 0;
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
        pelotasAdicionales: reto.tipo === 'LineFollowing' ? pelotasAdicionales : 0,
        comentarios: `Calificación ${reto.tipo} completada`
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
          <p className="text-xl mb-4">Tiempo restante: {tiempoRestante} segundos</p>
          
          {reto.tipo === 'LineFollowing' && (
            <div className="space-y-2">
              {Object.entries(tareas).map(([tarea, completada]) => (
                <div key={tarea}>
                  <input 
                    type="checkbox" 
                    id={tarea} 
                    checked={completada}
                    onChange={() => handleTareaChange(tarea)}
                    disabled={tiempoRestante === 0}
                  />
                  <label htmlFor={tarea} className="ml-2">{tarea.replace(/([A-Z])/g, ' $1').trim()}</label>
                </div>
              ))}
              <div className="mt-4">
                <label htmlFor="pelotasAdicionales" className="block">Pelotas adicionales:</label>
                <input 
                  type="number" 
                  id="pelotasAdicionales"
                  value={pelotasAdicionales}
                  onChange={(e) => setPelotasAdicionales(Number(e.target.value))}
                  className="border p-2 rounded"
                  disabled={tiempoRestante === 0}
                />
              </div>
            </div>
          )}

          {reto.tipo === 'FireFighting' && (
            <div className="space-y-4">
              {Object.entries(tareas).map(([vela, estados]) => (
                <div key={vela} className="border p-4 rounded">
                  <h3 className="font-bold">{vela.toUpperCase()}</h3>
                  <div>
                    <input 
                      type="checkbox" 
                      id={`${vela}-sinPenalidad`}
                      checked={estados.sinPenalidad}
                      onChange={() => handleTareaChange(vela, 'sinPenalidad')}
                    />
                    <label htmlFor={`${vela}-sinPenalidad`} className="ml-2">Sin penalidad</label>
                  </div>
                  <div>
                    <input 
                      type="checkbox" 
                      id={`${vela}-conPenalidad`}
                      checked={estados.conPenalidad}
                      onChange={() => handleTareaChange(vela, 'conPenalidad')}
                    />
                    <label htmlFor={`${vela}-conPenalidad`} className="ml-2">Con penalidad</label>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="text-xl mt-4">Puntuación total: {calcularPuntuacion()}</p>
          <button 
            onClick={enviarCalificacion}
            className="bg-green-500 text-white px-4 py-2 rounded mt-4"
            disabled={reto.tipo === 'LineFollowing' && tiempoRestante > 0}
          >
            Terminar Calificación
          </button>
        </div>
      )}
    </div>
  );
}