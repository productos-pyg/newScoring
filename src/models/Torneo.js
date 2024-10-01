import mongoose from "mongoose";

const TorneoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "Por favor proporciona el nombre del torneo"],
      trim: true,
      maxlength: [100, "El nombre no puede ser más largo de 100 caracteres"],
    },
    fechaInicio: {
      type: Date,
      required: [true, "Por favor proporciona la fecha de inicio"],
    },
    fechaFin: {
      type: Date,
      required: [true, "Por favor proporciona la fecha de fin"],
    },
    descripcion: {
      type: String,
      required: false,
      maxlength: [
        1000,
        "La descripción no puede ser más larga de 1000 caracteres",
      ],
    },
    estado: {
      type: String,
      enum: ["Planificado", "En progreso", "Finalizado"],
      default: "Planificado",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Torneo || mongoose.model("Torneo", TorneoSchema);
