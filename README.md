# Sistema de Gestión de Torneos de Robótica

## 🤖 Descripción General

Sistema web completo para la gestión y calificación de torneos de robótica, desarrollado con Next.js 14. Permite organizar torneos, gestionar retos, equipos y calificaciones, con soporte para diferentes tipos de competencias y un sistema de eliminatorias.

## ✨ Características Principales

### Gestión de Torneos
- Creación y administración de torneos con fechas y estados
- Seguimiento del estado del torneo (Planificado, En progreso, Finalizado)
- Visualización de historial y detalles de torneos

### Retos y Competencias
- Soporte para múltiples tipos de retos:
  - 🔥 FireFighting
  - ↗️ LineFollowing
  - 🗺️ Exploradores
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
- Fase clasificatoria
- Sistema de brackets para eliminatorias
- Generación automática de emparejamientos
- Seguimiento de avance en el torneo

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
│   │   ├── equipos/
│   │   ├── retos/
│   │   └── torneos/
│   ├── equipos/
│   ├── jueces/
│   ├── retos/
│   └── torneos/
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
  emparejamientos: [EmparejamientoSchema]
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

### Proceso de Calificación
1. Los jueces acceden al panel de calificación
2. Seleccionan el reto y equipo
3. Registran puntuaciones según criterios
4. Sistema calcula totales automáticamente

### Fases Eliminatorias
1. Sistema genera brackets automáticamente
2. Jueces califican enfrentamientos
3. Avance automático de ganadores

## 🛣️ Próximos Pasos

- [ ] Implementación de sistema de autenticación
- [ ] Dashboard de estadísticas
- [ ] Sistema de notificaciones
- [ ] Exportación de resultados
- [ ] Gestión de semifinales y finales
- [ ] Sistema de gestión de conflictos/empates

## 👥 Contribución

Las contribuciones son bienvenidas. Por favor, seguir el siguiente proceso:
1. Fork del repositorio
2. Crear rama para nueva característica
3. Commit y push de cambios
4. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE para detalles.
