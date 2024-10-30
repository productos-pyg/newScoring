// src/app/jueces/calificar-enfrentamiento/[retoId]/[emparejamientoId]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import RouteGuard from '@/components/RouteGuard';
import useAuthStore from '@/store/authStore';

export default function CalificarEnfrentamientoPage({ params }) {
  const router = useRouter();
  const { role } = useAuthStore();
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
  const [tiempoRestante, setTiempoRestante] = useState(180);
  const [tareas, setTareas] = useState({});
  const [pelotasAdicionales, setPelotasAdicionales] = useState(0);
  const [requiereSegundoIntento, setRequiereSegundoIntento] = useState(false);

  const verificarTareasCompletas = () => {
    if (reto.tipo === 'Exploradores') {
      return ['inicioAS', 'SAI', 'IAR', 'RAFinal'].every(
        task => tareas[task]
      );
    } else if (reto.tipo === 'FireFighting') {
      return Object.values(tareas).every(
        vela => (vela.sinPenalidad && !vela.conPenalidad) || (!vela.sinPenalidad && vela.conPenalidad)
      );
    }
    return true;
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const retoResponse = await axios.get(`/api/retos/${params.retoId}`);
        setReto(retoResponse.data);
        
        const emparejamiento = retoResponse.data.emparejamientos.find(
          e => e._id === params.emparejamientoId
        );
        
        if (!emparejamiento) {
          alert('Emparejamiento no encontrado');
          router.push(`/retos/${params.retoId}/brackets`);
          return;
        }
        
        setEmparejamientoActual(emparejamiento);
        setRequiereSegundoIntento(emparejamiento.requiereSegundoIntento || false);
        
        if (emparejamiento.ganador) {
          router.push(`/retos/${params.retoId}/brackets`);
          return;
        }
      } catch (error) {
        console.error('Error al obtener datos:', error);
        alert('Error al cargar los datos del reto');
      }
    };
    fetchData();
  }, [params.retoId, params.emparejamientoId, router]);

  useEffect(() => {
    let intervalo;
    if (calificacionIniciada && tiempoRestante > 0) {
      intervalo = setInterval(() => {
        setTiempoRestante((prevTiempo) => {
          if (prevTiempo <= 1) {
            clearInterval(intervalo);
            if (reto.tipo !== 'LineFollowing') {
              setCalificacionIniciada(false);
            }
            return 0;
          }
          return prevTiempo - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalo);
  }, [calificacionIniciada, tiempoRestante, reto?.tipo]);

  const iniciarCalificacion = () => {
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
        vela4: { sinPenalidad: false, conPenalidad: false }
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
      const nuevasTareas = { ...tareas };
      // Si intentamos marcar un checkbox y el otro ya está marcado, desmarcamos el otro
      if (subtarea === 'sinPenalidad' && nuevasTareas[tarea].conPenalidad) {
        nuevasTareas[tarea].conPenalidad = false;
      } else if (subtarea === 'conPenalidad' && nuevasTareas[tarea].sinPenalidad) {
        nuevasTareas[tarea].sinPenalidad = false;
      }
      
      // Marcamos o desmarcamos el checkbox actual
      nuevasTareas[tarea][subtarea] = !nuevasTareas[tarea][subtarea];
      
      setTareas(nuevasTareas);
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
    
      if (verificarTareasCompletas()) {
        puntuacion += tiempoRestante;
      }
    
      return puntuacion;
    } else if (reto.tipo === 'Exploradores') {
      let puntuacion = 50;
      
      if (tareas.inicioAS) puntuacion += 25;
      if (tareas.SAI) puntuacion += 25;
      if (tareas.IAR) puntuacion += 25;
      if (tareas.RAFinal) puntuacion += 25;
      
      const penalizacionesLetras = tareas.penalizaciones.letraIncorrecta.filter(Boolean).length;
      const penalizacionesObstaculos = tareas.penalizaciones.obstaculos.filter(Boolean).length;
      
      puntuacion -= penalizacionesLetras * 20;
      puntuacion -= penalizacionesObstaculos * 10;
      
      if (verificarTareasCompletas()) {
        puntuacion += tiempoRestante;
      }
      
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
      numero: equipoSeleccionado.intentoActual,
      puntuacion: puntuacion,
      detallesTareas: JSON.stringify(tareas),
      tiempoUtilizado: reto.tipo === 'Exploradores' ? 240 - tiempoRestante : 180 - tiempoRestante,
      pelotasAdicionales: reto.tipo === 'LineFollowing' ? pelotasAdicionales : 0
    };
    
    try {
      await axios.post(`/api/retos/${params.retoId}/calificar-equipo`, {
        emparejamientoId: params.emparejamientoId,
        equipoId: equipoSeleccionado.id,
        juezId: "66fd725c056f60d8d3c282ec",
        intentos: [nuevoIntento]
      });

      alert('Calificación enviada con éxito');
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
              {requiereSegundoIntento ? (
                <div className="text-sm text-blue-700">
                  <p className="font-bold mb-2">¡Empate en el primer intento!</p>
                  <p>Cada equipo debe realizar un segundo intento para desempatar.</p>
                </div>
              ) : (
                <p className="text-sm text-blue-700">
                  Seleccione el equipo que va a calificar. Recuerde que cada equipo debe ser calificado
                  por un juez diferente.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Equipo 1 */}
              <div 
                className={`border p-6 rounded-lg shadow-sm ${
                  (!emparejamientoActual.calificacionEquipo1 || 
                   (requiereSegundoIntento && !emparejamientoActual.calificacionEquipo1?.intentos?.[1]))
                    ? 'hover:bg-blue-50 cursor-pointer' 
                    : 'bg-gray-50'
                } transition-colors`}
                onClick={() => {
                  if (!emparejamientoActual.calificacionEquipo1 || 
                      (requiereSegundoIntento && !emparejamientoActual.calificacionEquipo1?.intentos?.[1])) {
                    setEquipoSeleccionado({
                      id: emparejamientoActual.equipo1._id,
                      nombre: emparejamientoActual.equipo1.nombre,
                      intentoActual: emparejamientoActual.calificacionEquipo1 ? 2 : 1
                    });
                  }
                }}
              >
                <h3 className="text-lg font-bold mb-2">
                  {emparejamientoActual.equipo1.nombre}
                </h3>
                <div className="space-y-1">
                  {emparejamientoActual.calificacionEquipo1 && (
                    <span className="inline-flex items-center text-green-600">
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Calificado
                      {requiereSegundoIntento && !emparejamientoActual.calificacionEquipo1.intentos[1] && 
                        " - Requiere segundo intento"}
                    </span>
                  )}
                </div>
              </div>

              {/* Equipo 2 */}
              <div 
                className={`border p-6 rounded-lg shadow-sm ${
                  (!emparejamientoActual.calificacionEquipo2 || 
                   (requiereSegundoIntento && !emparejamientoActual.calificacionEquipo2?.intentos?.[1]))
                    ? 'hover:bg-blue-50 cursor-pointer' 
                    : 'bg-gray-50'
                } transition-colors`}
                onClick={() => {
                  if (!emparejamientoActual.calificacionEquipo2 || 
                      (requiereSegundoIntento && !emparejamientoActual.calificacionEquipo2?.intentos?.[1])) {
                    setEquipoSeleccionado({
                      id: emparejamientoActual.equipo2._id,
                      nombre: emparejamientoActual.equipo2.nombre,
                      intentoActual: emparejamientoActual.calificacionEquipo2 ? 2 : 1
                    });
                  }
                }}
              >
                <h3 className="text-lg font-bold mb-2">
                  {emparejamientoActual.equipo2.nombre}
                </h3>
                <div className="space-y-1">
                  {emparejamientoActual.calificacionEquipo2 && (
                    <span className="inline-flex items-center text-green-600">
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Calificado
                      {requiereSegundoIntento && !emparejamientoActual.calificacionEquipo2.intentos[1] && 
                        " - Requiere segundo intento"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </>
        ) :
// Formulario de calificación cuando hay equipo seleccionado
!calificacionIniciada ? (
  <div className="space-y-4">
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
      <h3 className="font-bold text-lg mb-2">
        Calificando a: {equipoSeleccionado.nombre}
      </h3>
      <p className="text-sm text-blue-700">
        {equipoSeleccionado.intentoActual === 2 
          ? "Este es un intento de desempate"
          : "Este es el primer intento"}
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
        Tiempo restante: {tiempoRestante} segundos
      </p>
      {equipoSeleccionado.intentoActual === 2 && (
        <p className="text-sm text-blue-700">
          Intento de desempate
        </p>
      )}
    </div>

    {/* LineFollowing */}
    {reto.tipo === 'LineFollowing' && (
      <div className="space-y-4">
        {Object.entries(tareas)
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
            value={pelotasAdicionales}
            onChange={(e) => setPelotasAdicionales(Number(e.target.value))}
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
    )}

{/* desde aqui */}
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
        {(reto.tipo === 'FireFighting' || reto.tipo === 'Exploradores') && (
  <div className={`p-4 rounded-lg mb-4 ${
    verificarTareasCompletas() 
      ? "bg-green-50 text-green-700 border border-green-200"
      : "bg-yellow-50 text-yellow-700 border border-yellow-200"
  }`}>
    <p>
      {verificarTareasCompletas()
        ? "✓ El tiempo restante se sumará a la puntuación"
        : "⚠️ No se cumplieron todas las tareas - el tiempo no se sumará"}
    </p>
  </div>
)}
        <button 
          onClick={enviarCalificacion}
          className="bg-green-500 text-white px-4 py-2 rounded mt-4"
        >
          Terminar Calificación
        </button>
      </div>
    )}
  </div>
  </RouteGuard>
);
}