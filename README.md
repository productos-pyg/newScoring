# Sistema de Gestión de Torneos de Robótica

## 🤖 Descripción General

Sistema web completo para la gestión y calificación de torneos de robótica, desarrollado con Next.js 14. Permite organizar torneos, gestionar retos, equipos y calificaciones, con soporte para diferentes tipos de competencias y un sistema completo de eliminatorias.

## ✨ Características Principales

### Gestión de Torneos
- Creación y administración de torneos con fechas y estados
- Seguimiento del estado del torneo (Planificado, En progreso, Finalizado)
- Visualización de historial y detalles de torneos

### Retos y Competencias
- Soporte para múltiples tipos de retos:
  - 🔥 FireFighting
    - Sistema de puntuación basado en velas apagadas
    - Bonificaciones por tiempo restante
    - Penalizaciones por intervención
  - ↗️ LineFollowing
    - Puntuación por checkpoints completados
    - Sistema de pelotas adicionales
    - Bonificación por recorrido completo
  - 🗺️ Exploradores
    - Sistema de puntos por letras encontradas
    - Penalizaciones por obstáculos
    - Bonificación por tiempo
  - 👶 BabyExploradores
  - 🤖 RecolectorObjetos
- Sistema de puntuación específico por tipo de reto
- Reglas y criterios de evaluación personalizados

### Gestión de Equipos
- Registro de equipos con múltiples participantes
- Gestión de información de coaches
- Límites configurables de participantes por equipo
- Asociación de equipos a retos específicos

### Sistema de Calificación
- Múltiples intentos por equipo según el tipo de reto
- Sistema de puntuación con criterios específicos:
  - FireFighting: 6 intentos (mejores 5 puntuaciones)
  - LineFollowing: 6 intentos (mejores 5 puntuaciones)
  - Exploradores: 3 intentos (suma total)
- Registro de tiempo y penalizaciones
- Calificación en tiempo real

### Sistema de Competencia
#### Fase Clasificatoria
- Múltiples intentos por equipo
- Cálculo automático de mejores puntuaciones
- Ranking en tiempo real
- Clasificación automática de los 8 mejores equipos

#### Sistema de Eliminatorias
- Cuartos de Final
  - Emparejamientos automáticos (1° vs 8°, 2° vs 7°, etc.)
  - Calificación de enfrentamientos directos
- Semifinales
  - Avance automático de ganadores
  - Registro de perdedores para tercer puesto
- Fase Final
  - Final por el campeonato
  - Disputa por el tercer lugar
  - Podio visual con los tres primeros lugares
  - Identificación clara de campeón, subcampeón y tercer lugar

### Visualización de Resultados
- Tabla de clasificación en fase inicial
- Sistema de brackets para fases eliminatorias
- Podio interactivo para resultados finales
- Histórico de enfrentamientos y puntuaciones

## 🛠️ Stack Tecnológico

### Frontend
- Next.js 14
- React 18
- Tailwind CSS para estilos
- Axios para peticiones HTTP
- Zustand para gestión de estado
- React Hook Form para formularios

### Backend
- Next.js API Routes
- MongoDB con Mongoose
- Sistema de validación robusto

### Dependencias Principales
```json
{
  "dependencies": {
    "next": "14.2.13",
    "react": "^18",
    "mongoose": "^8.7.0",
    "axios": "^1.7.7",
    "zustand": "^5.0.0-rc.2",
    "react-hook-form": "^7.53.0"
  }
}
```

## 🏗️ Estructura del Proyecto

```
src/
├── app/
│   ├── api/
│   │   ├── calificaciones/
│   │   │   ├── route.js
│   │   │   ├── [id]/route.js
│   │   │   └── resultados/route.js
│   │   ├── equipos/
│   │   │   ├── route.js
│   │   │   └── [id]/route.js
│   │   ├── retos/
│   │   │   ├── route.js
│   │   │   └── [id]/
│   │   │       ├── route.js
│   │   │       ├── avanzarFase/route.js
│   │   │       ├── avanzarSemifinal/route.js
│   │   │       ├── avanzarFinal/route.js
│   │   │       └── calificar-enfrentamiento/route.js
│   │   └── torneos/
│   │       ├── route.js
│   │       └── [id]/route.js
│   ├── equipos/
│   │   └── [id]/
│   │       ├── page.jsx
│   │       └── editar/page.jsx
│   ├── jueces/
│   │   ├── page.jsx
│   │   ├── calificar/
│   │   │   └── [retoId]/
│   │   │       └── [equipoId]/page.jsx
│   │   └── calificar-enfrentamiento/
│   │       └── [retoId]/
│   │           └── [emparejamientoId]/page.jsx
│   ├── retos/
│   │   └── [id]/
│   │       ├── page.jsx
│   │       ├── brackets/page.jsx
│   │       ├── editar/page.jsx
│   │       └── resultados/page.jsx
│   └── torneos/
│       ├── page.jsx
│       ├── crear/page.jsx
│       └── [id]/
│           ├── page.jsx
│           └── editar/page.jsx
├── lib/
│   └── mongodb.js
└── models/
    ├── Calificacion.js
    ├── Equipo.js
    ├── Reto.js
    ├── Torneo.js
    └── Usuario.js
```

## 📋 Modelos de Datos

### Torneo
```javascript
{
  nombre: String,
  fechaInicio: Date,
  fechaFin: Date,
  descripcion: String,
  estado: Enum['Planificado', 'En progreso', 'Finalizado']
}
```

### Reto
```javascript
{
  nombre: String,
  descripcion: String,
  tipo: Enum['FireFighting', 'LineFollowing', 'Exploradores', ...],
  puntuacionMaxima: Number,
  reglas: Map,
  categoriaEdad: Enum['Junior', 'Juvenil', 'Senior', 'BabyExploradores'],
  duracionMaxima: Number,
  participantesPorEquipo: {
    min: Number,
    max: Number
  },
  fase: Enum['clasificatoria', 'cuartos', 'semifinal', 'final'],
  emparejamientos: [{
    fase: String,
    tipo: Enum['final', 'tercerPuesto'],
    equipo1: ObjectId,
    equipo2: ObjectId,
    ganador: ObjectId,
    calificacionEquipo1: ObjectId,
    calificacionEquipo2: ObjectId
  }]
}
```

### Equipo
```javascript
{
  nombre: String,
  miembros: [{
    nombre: String,
    edad: Number
  }],
  coach: {
    nombre: String,
    email: String
  },
  reto: ObjectId
}
```

### Calificacion
```javascript
{
  equipo: ObjectId,
  reto: ObjectId,
  juez: ObjectId,
  intentos: [{
    numero: Number,
    puntuacion: Number,
    detallesTareas: String,
    tiempoUtilizado: Number,
    noRealizado: Boolean
  }],
  puntuacionTotal: Number
}
```
## 🚀 Configuración e Instalación

1. Clonar el repositorio
```bash
git clone [url-repositorio]
```

2. Instalar dependencias
```bash
npm install
```

3. Configurar variables de entorno
```env
MONGODB_URI=tu_uri_de_mongodb
```

4. Ejecutar en desarrollo
```bash
npm run dev
```


## 🔄 Flujo de Trabajo

### Gestión de Torneos
1. Crear nuevo torneo
2. Añadir retos al torneo
3. Configurar reglas y parámetros

### Registro de Equipos
1. Crear equipos
2. Asignar participantes
3. Vincular con retos

### Proceso de Competencia
1. Fase Clasificatoria
  - Registro de equipos en retos
  - Calificacion de intentos según tipo de reto
  - Calsificación de los 8 mejores equipos
2. Cuartos de Final
  - Generación automática de emparejamientos
  - Calificación de enfrentamientos directos
  - Avance de ganadores a semifinales
3. Semifinales
  - Enfrentamientos entre ganadores de cuartos
  - Registro de ganadores y perdedores
  - Preparación para fase final
4. Vincular con retos
  - Final por el campeonato
  - Disputa por el tercer lugar
  - Visualización del podio final

### Sistema de Calificación
1. Fase Clasificatoria:
  - Multiple intentos según tipo de reto
  - Cálculo de mejores puntuaciones
  - Ranking automático
2. Fases Eliminatorias:
  - Un intento por equipo en cada enfrentamiento
  - Posibilidad de segundo intento en caso de empate
  - Decisión manual del juez si persiste el empate

### Visualización de Resultados
1. Durante la Competencia:
  - Tabla de clasificación en tiempo real
  - Brackets de eliminatorias
  - Estado actual de enfrentamientos
2. Resultados Finales:
  - Podio visual con los tres primeros lugares
  - Histórico de enfrentamientos
  - Estadísticas por equipo
3. Avance automático de ganadores

## 🛣️ Próximos Pasos y Mejoras Planificadas

- [ ] Sistema de autenticación para jueces y administradores
- [ ] Dashboard de estadísticas
- [ ] Sistema de notificaciones en tiempo real
- [ ] Exportación de resultados en múltiples formatos
- [ ] Configuración de reglas personalizadas por torneo
- [ ] Sistema de gestión de conflictos y apelaciones
- [ ] Integración con sistemas de transmisión en vivo
- [ ] Aplicación móvil para jueces
- [ ] Sistema de backup y recuperación de datos
- [ ] Modo práctica para equipos

## 👥 Contribución

Las contribuciones son bienvenidas. Por favor, seguir el siguiente proceso:
1. Fork del repositorio
2. Crear rama para nueva característica (git checkout -b feature/AmazingFeature)
3. Commit de cambios (git commit -m 'Add some AmazingFeature')
3. Push a la rama (git push origin feature/AmazingFeature)
4. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE para detalles.
