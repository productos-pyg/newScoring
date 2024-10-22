// src/app/jueces/calificar-enfrentamiento/[retoId]/[emparejamientoId]/page.jsx

'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CalificarEnfrentamientoPage({ params }) {
  const router = useRouter();
  const [reto, setReto] = useState(null);
  const [emparejamiento, setEmparejamiento] = useState(null);
  const [calificacionActual, setCalificacionActual] = useState({
    equipo1: {
      intentos: [],
      intentoActual: 1,
      tareas: {},
      tiempoRestante: 0,
      calificacionFinal: 0
    },
    equipo2: {
      intentos: [],
      intentoActual: 1,
      tareas: {},
      tiempoRestante: 0,
      calificacionFinal: 0
    }
  });
  const [equipoCalificando, setEquipoCalificando] = useState(null); // 'equipo1' o 'equipo2'
  const [calificacionIniciada, setCalificacionIniciada] = useState(false);

  // src/app/jueces/calificar-enfrentamiento/[retoId]/[emparejamientoId]/page.jsx

// Añadir al inicio del componente después de los estados
useEffect(() => {
  const fetchData = async () => {
    try {
      const retoResponse = await axios.get(`/api/retos/${params.retoId}`);
      setReto(retoResponse.data);
      
      const emparejamientoEncontrado = retoResponse.data.emparejamientos.find(
        e => e._id === params.emparejamientoId
      );
      setEmparejamiento(emparejamientoEncontrado);

      // Si ya hay un ganador, no permitir más calificaciones
      if (emparejamientoEncontrado.ganador) {
        router.push(`/retos/${params.retoId}/brackets`);
        alert('Este enfrentamiento ya ha sido calificado.');
        return;
      }

      // Inicializar tareas según el tipo de reto
      const tareasIniciales = initializeTareasPorTipo(retoResponse.data.tipo);
      setCalificacionActual(prev => ({
        equipo1: { ...prev.equipo1, tareas: tareasIniciales },
        equipo2: { ...prev.equipo2, tareas: tareasIniciales }
      }));
    } catch (error) {
      console.error('Error al obtener datos:', error);
    }
  };

  fetchData();
}, [params.retoId, params.emparejamientoId, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const retoResponse = await axios.get(`/api/retos/${params.retoId}`);
        setReto(retoResponse.data);
        
        const emparejamientoEncontrado = retoResponse.data.emparejamientos.find(
          e => e._id === params.emparejamientoId
        );
        setEmparejamiento(emparejamientoEncontrado);

        // Inicializar tareas según el tipo de reto
        const tareasIniciales = initializeTareasPorTipo(retoResponse.data.tipo);
        setCalificacionActual(prev => ({
          equipo1: { ...prev.equipo1, tareas: tareasIniciales },
          equipo2: { ...prev.equipo2, tareas: tareasIniciales }
        }));
      } catch (error) {
        console.error('Error al obtener datos:', error);
      }
    };

    fetchData();
  }, [params.retoId, params.emparejamientoId]);

  const initializeTareasPorTipo = (tipoReto) => {
    switch (tipoReto) {
      case 'LineFollowing':
        return {
          salirInicio: false,
          superarInterseccionIda: false,
          detenerseEnTorre: false,
          depositarPelota: false,
          devolverseInicio: false,
          superarInterseccionRegreso: false,
          regresarInicio: false,
          pelotasAdicionales: 0
        };
      case 'FireFighting':
        return {
          vela1: { sinPenalidad: false, conPenalidad: false },
          vela2: { sinPenalidad: false, conPenalidad: false },
          vela3: { sinPenalidad: false, conPenalidad: false },
          vela4: { sinPenalidad: false, conPenalidad: false }
        };
      case 'Exploradores':
        return {
          inicioAS: false,
          SAI: false,
          IAR: false,
          RAFinal: false,
          penalizaciones: {
            letraIncorrecta: [false, false, false],
            obstaculos: [false, false, false, false, false]
          }
        };
      default:
        return {};
    }
  };

  const iniciarCalificacionEquipo = (equipo) => {
    setEquipoCalificando(equipo);
    setCalificacionIniciada(true);
    const tiempoInicial = reto.tipo === 'Exploradores' ? 240 : 180;
    setCalificacionActual(prev => ({
      ...prev,
      [equipo]: {
        ...prev[equipo],
        tiempoRestante: tiempoInicial
      }
    }));
  };

  const handleTareaChange = (tarea, subtarea = null) => {
    if (!equipoCalificando) return;

    setCalificacionActual(prev => {
      const nuevasTareas = { ...prev[equipoCalificando].tareas };

      if (reto.tipo === 'LineFollowing') {
        if (tarea === 'pelotasAdicionales') {
          nuevasTareas.pelotasAdicionales = parseInt(subtarea) || 0;
        } else {
          nuevasTareas[tarea] = !nuevasTareas[tarea];
        }
      } else if (reto.tipo === 'FireFighting') {
        nuevasTareas[tarea] = {
          ...nuevasTareas[tarea],
          [subtarea]: !nuevasTareas[tarea][subtarea]
        };
      } else if (reto.tipo === 'Exploradores') {
        if (subtarea === null) {
          nuevasTareas[tarea] = !nuevasTareas[tarea];
        } else {
          nuevasTareas.penalizaciones[tarea][subtarea] = 
            !nuevasTareas.penalizaciones[tarea][subtarea];
        }
      }

      return {
        ...prev,
        [equipoCalificando]: {
          ...prev[equipoCalificando],
          tareas: nuevasTareas
        }
      };
    });
  };

  // Continuará en el siguiente mensaje...
  // Continuación de src/app/jueces/calificar-enfrentamiento/[retoId]/[emparejamientoId]/page.jsx

  useEffect(() => {
    let intervalo;
    if (calificacionIniciada && equipoCalificando) {
      intervalo = setInterval(() => {
        setCalificacionActual(prev => {
          const tiempoRestante = prev[equipoCalificando].tiempoRestante;
          if (tiempoRestante <= 1) {
            clearInterval(intervalo);
            return {
              ...prev,
              [equipoCalificando]: {
                ...prev[equipoCalificando],
                tiempoRestante: 0
              }
            };
          }
          return {
            ...prev,
            [equipoCalificando]: {
              ...prev[equipoCalificando],
              tiempoRestante: tiempoRestante - 1
            }
          };
        });
      }, 1000);
    }
    return () => clearInterval(intervalo);
  }, [calificacionIniciada, equipoCalificando]);

  const calcularPuntuacion = (equipoData) => {
    if (!reto) return 0;

    switch (reto.tipo) {
      case 'LineFollowing': {
        let puntuacion = 0;
        const tareas = equipoData.tareas;

        if (tareas.salirInicio) puntuacion += 25;
        if (tareas.superarInterseccionIda) puntuacion += 25;
        if (tareas.detenerseEnTorre) puntuacion += 100;
        if (tareas.depositarPelota) puntuacion += 100;
        if (tareas.devolverseInicio) puntuacion += 25;
        if (tareas.superarInterseccionRegreso) puntuacion += 25;
        if (tareas.regresarInicio) puntuacion += 100;
        puntuacion += tareas.pelotasAdicionales || 0;

        return puntuacion;
      }
      case 'FireFighting': {
        let puntuacion = 0;
        const tareas = equipoData.tareas;

        if (tareas.vela1.sinPenalidad) puntuacion += 100;
        else if (tareas.vela1.conPenalidad) puntuacion += 50;
        if (tareas.vela2.sinPenalidad) puntuacion += 200;
        else if (tareas.vela2.conPenalidad) puntuacion += 100;
        if (tareas.vela3.sinPenalidad) puntuacion += 300;
        else if (tareas.vela3.conPenalidad) puntuacion += 150;
        if (tareas.vela4.sinPenalidad) puntuacion += 400;
        else if (tareas.vela4.conPenalidad) puntuacion += 200;

        puntuacion += equipoData.tiempoRestante;
        return puntuacion;
      }
      case 'Exploradores': {
        let puntuacion = 50;
        const tareas = equipoData.tareas;

        if (tareas.inicioAS) puntuacion += 25;
        if (tareas.SAI) puntuacion += 25;
        if (tareas.IAR) puntuacion += 25;
        if (tareas.RAFinal) puntuacion += 25;

        const penalizacionesLetras = tareas.penalizaciones.letraIncorrecta.filter(Boolean).length;
        const penalizacionesObstaculos = tareas.penalizaciones.obstaculos.filter(Boolean).length;

        puntuacion -= penalizacionesLetras * 20;
        puntuacion -= penalizacionesObstaculos * 10;
        puntuacion += equipoData.tiempoRestante;

        if (penalizacionesLetras === 0 && penalizacionesObstaculos === 0) {
          puntuacion += 50;
        }

        return puntuacion;
      }
      default:
        return 0;
    }
  };

  const finalizarIntentoEquipo = async () => {
    if (!equipoCalificando) return;

    const puntuacion = calcularPuntuacion(calificacionActual[equipoCalificando]);
    
    setCalificacionActual(prev => ({
      ...prev,
      [equipoCalificando]: {
        ...prev[equipoCalificando],
        calificacionFinal: puntuacion,
        intentos: [...prev[equipoCalificando].intentos, {
          numero: prev[equipoCalificando].intentoActual,
          puntuacion,
          detallesTareas: JSON.stringify(prev[equipoCalificando].tareas),
          tiempoUtilizado: reto.tipo === 'Exploradores' ? 240 - prev[equipoCalificando].tiempoRestante : 180 - prev[equipoCalificando].tiempoRestante
        }]
      }
    }));

    setCalificacionIniciada(false);
    setEquipoCalificando(null);
  };

  const determinarGanador = async () => {
    const puntuacionEquipo1 = calificacionActual.equipo1.calificacionFinal;
    const puntuacionEquipo2 = calificacionActual.equipo2.calificacionFinal;

    if (puntuacionEquipo1 === puntuacionEquipo2 && 
        calificacionActual.equipo1.intentoActual === 1) {
      // Empate en primer intento, habilitar segundo intento
      setCalificacionActual(prev => ({
        equipo1: { ...prev.equipo1, intentoActual: 2 },
        equipo2: { ...prev.equipo2, intentoActual: 2 }
      }));
      alert('Empate en el primer intento. Se habilitará un segundo intento para ambos equipos.');
      return;
    }

    // Cambiamos const por let ya que necesitamos reasignarlo
    let ganador = puntuacionEquipo1 > puntuacionEquipo2 ? 
      emparejamiento.equipo1 : 
      puntuacionEquipo2 > puntuacionEquipo1 ? 
        emparejamiento.equipo2 : 
        null;

    if (!ganador && calificacionActual.equipo1.intentoActual === 2) {
      // Empate en segundo intento, permitir decisión manual
      if (window.confirm('Empate en segundo intento. ¿Debe ganar el equipo 1?')) {
        ganador = emparejamiento.equipo1;
      } else {
        ganador = emparejamiento.equipo2;
      }
    }

    try {
      await axios.post(`/api/retos/${params.retoId}/calificar-enfrentamiento`, {
        emparejamientoId: params.emparejamientoId,
        intentosEquipo1: calificacionActual.equipo1.intentos,
        intentosEquipo2: calificacionActual.equipo2.intentos,
        ganador: ganador._id
      });

      alert('Enfrentamiento calificado exitosamente');
      router.push(`/retos/${params.retoId}/brackets`);
    } catch (error) {
      console.error('Error al enviar la calificación:', error);
      alert('Error al enviar la calificación: ' + error.response?.data?.error || error.message);
    }
  };

  if (!reto || !emparejamiento) return <div>Cargando...</div>;

  if (emparejamiento.ganador) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h1 className="text-2xl font-bold mb-4">Enfrentamiento Finalizado</h1>
          <h2 className="text-xl mb-4">{reto.nombre} - {reto.fase}</h2>
          
          <div className="bg-green-100 border border-green-400 rounded p-4 mb-4">
            <p className="text-lg font-semibold text-green-700">
              Ganador: {emparejamiento.ganador.nombre}
            </p>
            <div className="mt-2">
              <p className="font-semibold">Resultados:</p>
              <p>{emparejamiento.equipo1.nombre}: {emparejamiento.calificacionEquipo1?.puntuacionTotal || 0} puntos</p>
              <p>{emparejamiento.equipo2.nombre}: {emparejamiento.calificacionEquipo2?.puntuacionTotal || 0} puntos</p>
            </div>
          </div>
  
          <Link 
            href={`/retos/${reto._id}/brackets`}
            className="bg-blue-500 text-white px-4 py-2 rounded inline-block"
          >
            Volver a Brackets
          </Link>
        </div>
      </div>
    );
  }
  

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Calificar Enfrentamiento</h1>
      <h2 className="text-xl mb-4">{reto.nombre} - {reto.fase}</h2>

      <div className="grid grid-cols-2 gap-4">
        {/* Equipo 1 */}
        <div className="border p-4 rounded">
          <h3 className="font-bold">{emparejamiento.equipo1.nombre}</h3>
          {!equipoCalificando && calificacionActual.equipo1.intentos.length < calificacionActual.equipo1.intentoActual && (
            <button
              onClick={() => iniciarCalificacionEquipo('equipo1')}
              className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
            >
              Iniciar Intento {calificacionActual.equipo1.intentoActual}
            </button>
          )}
          {calificacionActual.equipo1.calificacionFinal > 0 && (
            <p>Puntuación: {calificacionActual.equipo1.calificacionFinal}</p>
          )}
        </div>

        {/* Equipo 2 */}
        <div className="border p-4 rounded">
          <h3 className="font-bold">{emparejamiento.equipo2.nombre}</h3>
          {!equipoCalificando && calificacionActual.equipo2.intentos.length < calificacionActual.equipo2.intentoActual && (
            <button
              onClick={() => iniciarCalificacionEquipo('equipo2')}
              className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
            >
              Iniciar Intento {calificacionActual.equipo2.intentoActual}
            </button>
          )}
          {calificacionActual.equipo2.calificacionFinal > 0 && (
            <p>Puntuación: {calificacionActual.equipo2.calificacionFinal}</p>
          )}
        </div>
      </div>

      {/* Formulario de calificación activo */}
      {calificacionIniciada && equipoCalificando && (
        <div className="mt-4 border p-4 rounded">
          <h3 className="font-bold mb-2">
            Calificando: {equipoCalificando === 'equipo1' ? 
              emparejamiento.equipo1.nombre : 
              emparejamiento.equipo2.nombre}
          </h3>
          <p className="text-xl mb-4">
            Tiempo restante: {calificacionActual[equipoCalificando].tiempoRestante} segundos
          </p>

          {/* Formulario específico según tipo de reto */}
          {/* Line Following */}
          {reto.tipo === 'LineFollowing' && (
            <div className="space-y-2">
              {Object.entries(calificacionActual[equipoCalificando].tareas)
                .filter(([key]) => key !== 'pelotasAdicionales')
                .map(([tarea, completada]) => (
                <div key={tarea}>
                  <input
                    type="checkbox"
                    id={tarea}
                    checked={completada}
                    onChange={() => handleTareaChange(tarea)}
                  />
                  <label htmlFor={tarea} className="ml-2">
                    {tarea.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                </div>
              ))}
              <div className="mt-4">
                <label htmlFor="pelotasAdicionales" className="block">
                  Pelotas adicionales:
                </label>
                <input
                  type="number"
                  id="pelotasAdicionales"
                  value={calificacionActual[equipoCalificando].tareas.pelotasAdicionales || 0}
                  onChange={(e) => handleTareaChange('pelotasAdicionales', e.target.value)}
                  className="border p-2 rounded"
                />
              </div>
            </div>
          )}

          {/* Fire Fighting */}
          {reto.tipo === 'FireFighting' && (
            <div className="space-y-4">
              {Object.entries(calificacionActual[equipoCalificando].tareas).map(([vela, estados]) => (
                <div key={vela} className="border p-4 rounded">
                  <h4 className="font-bold">{vela.toUpperCase()}</h4>
                  <div>
                    <input
                      type="checkbox"
                      id={`${vela}-sinPenalidad`}
                      checked={estados.sinPenalidad}
                      onChange={() => handleTareaChange(vela, 'sinPenalidad')}
                    />
                    <label htmlFor={`${vela}-sinPenalidad`} className="ml-2">
                      Sin penalidad
                    </label>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      id={`${vela}-conPenalidad`}
                      checked={estados.conPenalidad}
                      onChange={() => handleTareaChange(vela, 'conPenalidad')}
                    />
                    <label htmlFor={`${vela}-conPenalidad`} className="ml-2">
                      Con penalidad
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Exploradores */}
          {reto.tipo === 'Exploradores' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold">Tareas principales</h4>
                {['inicioAS', 'SAI', 'IAR', 'RAFinal'].map((tarea) => (
                  <div key={tarea}>
                    <input
                      type="checkbox"
                      id={tarea}
                      checked={calificacionActual[equipoCalificando].tareas[tarea]}
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
                <h4 className="font-bold">Penalizaciones</h4>
                <div>
                  <h5>Letra incorrecta</h5>
                  {calificacionActual[equipoCalificando].tareas.penalizaciones.letraIncorrecta.map((_, index) => (
                    <div key={`letra-${index}`}>
                      <input
                        type="checkbox"
                        id={`letra-${index}`}
                        checked={calificacionActual[equipoCalificando].tareas.penalizaciones.letraIncorrecta[index]}
                        onChange={() => handleTareaChange('letraIncorrecta', index)}
                      />
                      <label htmlFor={`letra-${index}`} className="ml-2">
                        Letra incorrecta {index + 1}
                      </label>
                    </div>
                  ))}
                </div>
                <div>
                  <h5>Obstáculos no evadidos</h5>
                  {calificacionActual[equipoCalificando].tareas.penalizaciones.obstaculos.map((_, index) => (
                    <div key={`obstaculo-${index}`}>

<input
  type="checkbox"
  id={`obstaculo-${index}`}
  checked={calificacionActual[equipoCalificando].tareas.penalizaciones.obstaculos[index]}
  onChange={() => handleTareaChange('obstaculos', index)}
/>
<label htmlFor={`obstaculo-${index}`} className="ml-2">
  Obstáculo {index + 1}
</label>
</div>
))}
</div>
</div>
</div>
)}

<p className="text-xl mt-4">
Puntuación actual: {calcularPuntuacion(calificacionActual[equipoCalificando])}
</p>

<button
onClick={finalizarIntentoEquipo}
className="bg-green-500 text-white px-4 py-2 rounded mt-4"
>
Finalizar Intento
</button>
</div>
)}

{/* Botón para determinar ganador */}
{calificacionActual.equipo1.calificacionFinal > 0 && 
calificacionActual.equipo2.calificacionFinal > 0 && (
<button
onClick={determinarGanador}
className="bg-blue-500 text-white px-4 py-2 rounded mt-4 block w-full"
>
Determinar Ganador
</button>
)}
</div>
);
}