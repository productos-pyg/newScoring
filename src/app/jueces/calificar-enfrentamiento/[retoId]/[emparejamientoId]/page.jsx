// src/app/jueces/calificar-enfrentamiento/[retoId]/[emparejamientoId]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import RouteGuard from '@/components/RouteGuard';

export default function CalificarEnfrentamientoPage({ params }) {
  const router = useRouter();
  const [reto, setReto] = useState(null);
  const [emparejamientoActual, setEmparejamientoActual] = useState(null);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
  const [calificacion, setCalificacion] = useState({
    intentos: [],
    intentoActual: 1,
    tareas: {},
    tiempoRestante: 0,
    calificacionFinal: 0
  });
  const [calificacionIniciada, setCalificacionIniciada] = useState(false);

  // Efecto para cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        const retoResponse = await axios.get(`/api/retos/${params.retoId}`);
        setReto(retoResponse.data);
      } catch (error) {
        console.error('Error al obtener datos:', error);
        alert('Error al cargar los datos del reto');
      }
    };
    fetchData();
  }, [params.retoId]);

  // Efecto para verificar estado del emparejamiento
  useEffect(() => {
    const verificarEstado = async () => {
      try {
        const response = await axios.get(
          `/api/retos/${params.retoId}/calificar-equipo?emparejamientoId=${params.emparejamientoId}`
        );
        setEmparejamientoActual(response.data);
        
        // Si el emparejamiento ya tiene ganador, redirigir a brackets
        if (response.data.ganador) {
          router.push(`/retos/${params.retoId}/brackets`);
          return;
        }
      } catch (error) {
        console.error('Error al verificar estado:', error);
      }
    };

    const interval = setInterval(verificarEstado, 5000); // Verificar cada 5 segundos
    verificarEstado(); // Verificación inicial

    return () => clearInterval(interval);
  }, [params.retoId, params.emparejamientoId, router]);
  // Efecto para el temporizador
  useEffect(() => {
    let intervalo;
    if (calificacionIniciada && calificacion.tiempoRestante > 0) {
      intervalo = setInterval(() => {
        setCalificacion(prev => ({
          ...prev,
          tiempoRestante: prev.tiempoRestante - 1
        }));
      }, 1000);
    }
    return () => clearInterval(intervalo);
  }, [calificacionIniciada, calificacion.tiempoRestante]);

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

  const iniciarCalificacion = () => {
    if (!equipoSeleccionado) return;
    
    setCalificacionIniciada(true);
    setCalificacion(prev => ({
      ...prev,
      tiempoRestante: reto.tipo === 'Exploradores' ? 240 : 180,
      tareas: initializeTareasPorTipo(reto.tipo)
    }));
  };

  const handleTareaChange = (tarea, subtarea = null) => {
    if (!calificacionIniciada) return;

    setCalificacion(prev => {
      const nuevasTareas = { ...prev.tareas };

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
        tareas: nuevasTareas
      };
    });
  };
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

  const finalizarIntento = async () => {
    if (!equipoSeleccionado || !calificacionIniciada) return;

    const puntuacion = calcularPuntuacion(calificacion);
    
    try {
      await axios.post(`/api/retos/${params.retoId}/calificar-equipo`, {
        emparejamientoId: params.emparejamientoId,
        equipoId: equipoSeleccionado.id,
        juezId: "66fd725c056f60d8d3c282ec",
        intentos: [{
          numero: calificacion.intentoActual,
          puntuacion,
          detallesTareas: JSON.stringify(calificacion.tareas),
          tiempoUtilizado: reto.tipo === 'Exploradores' ? 
            240 - calificacion.tiempoRestante : 
            180 - calificacion.tiempoRestante
        }]
      });

      router.push(`/retos/${params.retoId}/brackets`);
    } catch (error) {
      console.error('Error al enviar calificación:', error);
      alert('Error al enviar la calificación: ' + (error.response?.data?.error || error.message));
    }
  };
  if (!reto || !emparejamientoActual) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold">Cargando...</div>
      </div>
    );
  }

  return (
    <RouteGuard allowedRoles={['admin', 'juez']}>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Calificar Enfrentamiento</h1>
        <h2 className="text-xl mb-4">{reto.nombre} - {reto.fase}</h2>

        {/* Selección de equipo */}
        {!equipoSeleccionado ? (
          <>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <p className="text-sm text-blue-700">
                Seleccione el equipo que va a calificar. Cada equipo debe ser calificado
                por un juez diferente. El sistema determinará automáticamente el ganador
                cuando ambos equipos hayan sido calificados.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Equipo 1 */}
              <div 
                className={`border p-6 rounded-lg shadow-sm ${
                  !emparejamientoActual.calificacionEquipo1 
                    ? 'hover:bg-blue-50 cursor-pointer' 
                    : 'bg-gray-50'
                } transition-colors`}
                onClick={() => !emparejamientoActual.calificacionEquipo1 && 
                  setEquipoSeleccionado({
                    id: emparejamientoActual.equipo1._id,
                    nombre: emparejamientoActual.equipo1.nombre
                  })}
              >
                <h3 className="text-lg font-bold mb-2">
                  {emparejamientoActual.equipo1.nombre}
                </h3>
                {emparejamientoActual.calificacionEquipo1 ? (
                  <span className="inline-flex items-center text-green-600">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Calificado
                  </span>
                ) : (
                  <span className="text-blue-600">Click para calificar</span>
                )}
              </div>

              {/* Equipo 2 */}
              <div 
                className={`border p-6 rounded-lg shadow-sm ${
                  !emparejamientoActual.calificacionEquipo2 
                    ? 'hover:bg-blue-50 cursor-pointer' 
                    : 'bg-gray-50'
                } transition-colors`}
                onClick={() => !emparejamientoActual.calificacionEquipo2 && 
                  setEquipoSeleccionado({
                    id: emparejamientoActual.equipo2._id,
                    nombre: emparejamientoActual.equipo2.nombre
                  })}
              >
                <h3 className="text-lg font-bold mb-2">
                  {emparejamientoActual.equipo2.nombre}
                </h3>
                {emparejamientoActual.calificacionEquipo2 ? (
                  <span className="inline-flex items-center text-green-600">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Calificado
                  </span>
                ) : (
                  <span className="text-blue-600">Click para calificar</span>
                )}
              </div>
            </div>
          </>
        ) : (
          !calificacionIniciada ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <h3 className="font-bold text-lg mb-2">
                  Calificando a: {equipoSeleccionado.nombre}
                </h3>
                <p className="text-sm text-blue-700">
                  En enfrentamientos directos, cada equipo tiene un intento.
                  En caso de empate, se habilitará un segundo intento.
                </p>
              </div>
              <button
                onClick={iniciarCalificacion}
                className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                Iniciar Calificación
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Información de calificación en curso */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <h3 className="font-bold">
                  Calificando a: {equipoSeleccionado.nombre}
                </h3>
                <p className="text-xl mb-2">
                  Tiempo restante: {calificacion.tiempoRestante} segundos
                </p>
                {calificacion.intentoActual > 1 && (
                  <p className="text-sm text-blue-700">
                    Intento de desempate
                  </p>
                )}
              </div>

              {/* Formulario específico según tipo de reto */}
              {reto.tipo === 'LineFollowing' && (
                <div className="space-y-4">
                  {Object.entries(calificacion.tareas)
                    .filter(([key]) => key !== 'pelotasAdicionales')
                    .map(([tarea, completada]) => (
                      <div key={tarea} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={tarea}
                          checked={completada}
                          onChange={() => handleTareaChange(tarea)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor={tarea} className="text-gray-700">
                          {tarea.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                      </div>
                    ))}
                  <div className="mt-4">
                    <label htmlFor="pelotasAdicionales" className="block text-gray-700">
                      Pelotas adicionales:
                    </label>
                    <input
                      type="number"
                      id="pelotasAdicionales"
                      value={calificacion.tareas.pelotasAdicionales || 0}
                      onChange={(e) => handleTareaChange('pelotasAdicionales', e.target.value)}
                      min="0"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {reto.tipo === 'FireFighting' && (
                <div className="space-y-6">
                  {Object.entries(calificacion.tareas).map(([vela, estados]) => (
                    <div key={vela} className="border p-4 rounded-lg bg-white shadow-sm">
                      <h4 className="font-bold mb-2">{vela.toUpperCase()}</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`${vela}-sinPenalidad`}
                            checked={estados.sinPenalidad}
                            onChange={() => handleTareaChange(vela, 'sinPenalidad')}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor={`${vela}-sinPenalidad`}>
                            Sin penalidad
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`${vela}-conPenalidad`}
                            checked={estados.conPenalidad}
                            onChange={() => handleTareaChange(vela, 'conPenalidad')}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor={`${vela}-conPenalidad`}>
                            Con penalidad
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
{reto.tipo === 'Exploradores' && (
                <div className="space-y-6">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="font-bold mb-3">Tareas principales</h4>
                    <div className="space-y-2">
                      {[
                        { key: 'inicioAS', label: 'Ir del inicio a la letra S' },
                        { key: 'SAI', label: 'Ir de la letra S a la letra I' },
                        { key: 'IAR', label: 'Ir de la letra I a la letra R' },
                        { key: 'RAFinal', label: 'Ir de la letra R al punto final' }
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={key}
                            checked={calificacion.tareas[key]}
                            onChange={() => handleTareaChange(key)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor={key}>{label}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="font-bold mb-3">Penalizaciones</h4>
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium mb-2">Letra incorrecta</h5>
                        {calificacion.tareas.penalizaciones.letraIncorrecta.map((_, index) => (
                          <div key={`letra-${index}`} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`letra-${index}`}
                              checked={calificacion.tareas.penalizaciones.letraIncorrecta[index]}
                              onChange={() => handleTareaChange('letraIncorrecta', index)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor={`letra-${index}`}>
                              Letra incorrecta {index + 1}
                            </label>
                          </div>
                        ))}
                      </div>

                      <div>
                        <h5 className="font-medium mb-2">Obstáculos no evadidos</h5>
                        {calificacion.tareas.penalizaciones.obstaculos.map((_, index) => (
                          <div key={`obstaculo-${index}`} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`obstaculo-${index}`}
                              checked={calificacion.tareas.penalizaciones.obstaculos[index]}
                              onChange={() => handleTareaChange('obstaculos', index)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor={`obstaculo-${index}`}>
                              Obstáculo {index + 1}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Puntuación y botón de finalizar */}
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xl font-bold">
                    Puntuación: {calcularPuntuacion(calificacion)}
                  </p>
                </div>

                <button
                  onClick={finalizarIntento}
                  className="w-full bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 transition-colors"
                >
                  Finalizar Calificación
                </button>
              </div>
            </div>
          )
        )}

        {/* Botón de volver */}
        <div className="mt-6">
          <Link 
            href={`/retos/${reto._id}/brackets`}
            className="inline-block bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            Volver a brackets
          </Link>
        </div>
      </div>
    </RouteGuard>
  );
}