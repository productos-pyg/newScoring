'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function CalificarEquipoPage({ params }) {
  const router = useRouter();
  const [reto, setReto] = useState(null);
  const [equipo, setEquipo] = useState(null);
  const [calificacion, setCalificacion] = useState(null);
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
        const calificacionResponse = await axios.get(`/api/calificaciones?equipoId=${params.equipoId}&retoId=${params.retoId}`);
        setCalificacion(calificacionResponse.data);
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
            setCalificacionIniciada(false);
            return 0;
          }
          return prevTiempo - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalo);
  }, [calificacionIniciada, tiempoRestante]);

  const iniciarCalificacion = () => {
    const maxIntentos = reto.tipo === 'Exploradores' ? 3 : 6;
    if (calificacion.intentos.length >= maxIntentos) {
      alert('Ya se han completado todos los intentos permitidos');
      return;
    }
    
    setCalificacionIniciada(true);
    setTiempoRestante(reto.tipo === 'Exploradores' ? 240 : 180);
    
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
    } else if (reto.tipo === 'Exploradores') {
      setTareas({
        inicioAS: false,
        SAI: false,
        IAR: false,
        RAFinal: false,
        penalizaciones: {
          letraIncorrecta: [false, false, false],
          obstaculos: [false, false, false, false, false]
        }
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
    } else if (reto.tipo === 'Exploradores') {
      if (subtarea === null) {
        setTareas(prevTareas => ({ ...prevTareas, [tarea]: !prevTareas[tarea] }));
      } else {
        setTareas(prevTareas => ({
          ...prevTareas,
          penalizaciones: {
            ...prevTareas.penalizaciones,
            [tarea]: prevTareas.penalizaciones[tarea].map((val, idx) => 
              idx === subtarea ? !val : val
            )
          }
        }));
      }
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
    } else if (reto.tipo === 'Exploradores') {
      let puntuacion = 50; // Puntos iniciales
      if (tareas.inicioAS) puntuacion += 25;
      if (tareas.SAI) puntuacion += 25;
      if (tareas.IAR) puntuacion += 25;
      if (tareas.RAFinal) puntuacion += 25;
      
      // Calcular penalizaciones
      const penalizacionesLetras = tareas.penalizaciones.letraIncorrecta.filter(Boolean).length;
      const penalizacionesObstaculos = tareas.penalizaciones.obstaculos.filter(Boolean).length;
      
      // Restar penalizaciones
      puntuacion -= penalizacionesLetras * 20;
      puntuacion -= penalizacionesObstaculos * 10;
      
      // Sumar puntos por tiempo restante
      puntuacion += tiempoRestante;
      
      // Sumar 50 puntos adicionales si no hay penalizaciones
      if (penalizacionesLetras === 0 && penalizacionesObstaculos === 0) {
        puntuacion += 50;
      }
      
      return puntuacion;
    }
    return 0;
  };

  const enviarCalificacion = async () => {
    const puntuacion = calcularPuntuacion();
    const nuevoIntento = {
      numero: calificacion.intentos.length + 1,
      puntuacion: puntuacion,
      detallesTareas: JSON.stringify(tareas),
      tiempoUtilizado: reto.tipo === 'Exploradores' ? 240 - tiempoRestante : 180 - tiempoRestante,
    };
    
    try {
      const response = await axios.post('/api/calificaciones', {
        equipo: params.equipoId,
        reto: params.retoId,
        juez: '66fd725c056f60d8d3c282ec',
        ...nuevoIntento
      });
      setCalificacion(response.data);
      setCalificacionIniciada(false);
      alert('Calificación enviada con éxito');
    } catch (error) {
      console.error('Error al enviar la calificación:', error);
      alert('Error al enviar la calificación: ' + error.response?.data?.error || error.message);
    }
  };

  const marcarIntentoNoRealizado = async () => {
    try {
      const response = await axios.post('/api/calificaciones', {
        equipo: params.equipoId,
        reto: params.retoId,
        juez: 'ID_DEL_JUEZ',
        numero: calificacion.intentos.length + 1,
        puntuacion: 0,
        detallesTareas: '',
        tiempoUtilizado: 0,
        noRealizado: true
      });
      setCalificacion(response.data);
      alert('Intento marcado como no realizado');
    } catch (error) {
      console.error('Error al marcar el intento como no realizado:', error);
      alert('Error: ' + error.response?.data?.error || error.message);
    }
  };

  if (!reto || !equipo || !calificacion) return <div>Cargando...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Calificar equipo: {equipo.nombre}</h1>
      <h2 className="text-xl mb-2">Reto: {reto.nombre}</h2>
      
      {!calificacionIniciada ? (
        <div>
          <button 
            onClick={iniciarCalificacion}
            className="bg-blue-500 text-white px-4 py-2 rounded"
            disabled={calificacion.intentos.length >= (reto.tipo === 'Exploradores' ? 3 : 6)}
          >
            Iniciar Intento {calificacion.intentos.length + 1}
          </button>
          
          <button
            onClick={marcarIntentoNoRealizado}
            className="bg-red-500 text-white px-4 py-2 rounded ml-2"
            disabled={calificacion.intentos.length >= (reto.tipo === 'Exploradores' ? 3 : 6)}
          >
            Marcar Intento como No Realizado
          </button>
          
          <div className="mt-4">
            <h3 className="font-bold">Intentos realizados:</h3>
            {calificacion.intentos.map((intento, index) => (
              <div key={index}>
                Intento {intento.numero}: {intento.puntuacion} puntos
                {intento.noRealizado && ' (No realizado)'}
              </div>
            ))}
            <div className="font-bold mt-2">
              Puntuación Total: {calificacion.puntuacionTotal}
            </div>
          </div>
        </div>
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

          {reto.tipo === 'Exploradores' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold">Tareas principales</h3>
                {['inicioAS', 'SAI', 'IAR', 'RAFinal'].map((tarea) => (
                  <div key={tarea}>
                    <input 
                      type="checkbox" 
                      id={tarea} 
                      checked={tareas[tarea]}
                      onChange={() => handleTareaChange(tarea)}
                    />
                    <label htmlFor={tarea} className="ml-2">
                      {tarea === 'inicioAS' ? 'Ir del inicio a la letra S' :
                       tarea === 'SAI' ? 'Ir de la letra S a la letra I' :
                       tarea === 'IAR' ? 'Ir de la letra I a la letra R' :
                       'Ir de la letra R al punto final'}
                    </label>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="font-bold">Penalizaciones</h3>
                <div>
                  <h4>Letra incorrecta</h4>
                  {tareas.penalizaciones.letraIncorrecta.map((_, index) => (
                    <div key={`letra-${index}`}>
                      <input 
                        type="checkbox" 
                        id={`letra-${index}`} 
                        checked={tareas.penalizaciones.letraIncorrecta[index]}
                        onChange={() => handleTareaChange('letraIncorrecta', index)}
                      />
                      <label htmlFor={`letra-${index}`} className="ml-2">Letra incorrecta {index + 1}</label>
                    </div>
                  ))}
                </div>
                <div>
                  <h4>Obstáculos no evadidos</h4>
                  {tareas.penalizaciones.obstaculos.map((_, index) => (
                    <div key={`obstaculo-${index}`}>
                      <input 
                        type="checkbox" 
                        id={`obstaculo-${index}`} 
                        checked={tareas.penalizaciones.obstaculos[index]}
                        onChange={() => handleTareaChange('obstaculos', index)}
                      />
                      <label htmlFor={`obstaculo-${index}`} className="ml-2">Obstáculo {index + 1}</label>
                    </div>
                  ))}
                </div>
              </div>
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