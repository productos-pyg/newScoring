import mongoose from "mongoose";

const EmparejamientoSchema = new mongoose.Schema({
  fase: String,
  equipo1: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipo' },
  equipo2: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipo' },
  ganador: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipo' },
  calificacionEquipo1: { type: mongoose.Schema.Types.ObjectId, ref: 'Calificacion' },
  calificacionEquipo2: { type: mongoose.Schema.Types.ObjectId, ref: 'Calificacion' },
});

const RetoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "Por favor proporciona el nombre del reto"],
      trim: true,
      maxlength: [100, "El nombre no puede ser más largo de 100 caracteres"],
    },
    descripcion: {
      type: String,
      required: false,
      maxlength: [
        1000,
        "La descripción no puede ser más larga de 1000 caracteres",
      ],
    },
    tipo: {
      type: String,
      required: [true, "Por favor especifica el tipo de reto"],
      enum: [
        "FireFighting",
        "LineFollowing",
        "Exploradores",
        "BabyExploradores",
        "RecolectorObjetos",
      ],
    },
    puntuacionMaxima: {
      type: Number,
      required: [true, "Por favor proporciona la puntuación máxima del reto"],
      min: [0, "La puntuación máxima no puede ser negativa"],
    },
    reglas: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
    categoriaEdad: {
      type: String,
      required: [true, "Por favor especifica la categoría de edad"],
      enum: ["Junior", "Juvenil", "Senior", "BabyExploradores"],
    },
    duracionMaxima: {
      type: Number,
      required: [
        true,
        "Por favor especifica la duración máxima del reto en segundos",
      ],
    },
    participantesPorEquipo: {
      min: {
        type: Number,
        required: [
          true,
          "Por favor especifica el número mínimo de participantes por equipo",
        ],
      },
      max: {
        type: Number,
        required: [
          true,
          "Por favor especifica el número máximo de participantes por equipo",
        ],
      },
    },
    torneo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Torneo",
      required: [true, "Por favor proporciona el ID del torneo asociado"],
    },
    fase: {
      type: String,
      enum: ['clasificatoria', 'cuartos', 'semifinal', 'final'],
      default: 'clasificatoria'
    },
    emparejamientos: [EmparejamientoSchema]
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Reto || mongoose.model("Reto", RetoSchema);
