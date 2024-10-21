import mongoose from 'mongoose';

const CalificacionSchema = new mongoose.Schema({
  equipo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipo',
    required: [true, 'Por favor proporciona el ID del equipo']
  },
  reto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reto',
    required: [true, 'Por favor proporciona el ID del reto']
  },
  juez: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'Por favor proporciona el ID del juez']
  },
  puntuacion: {
    type: Number,
    required: [true, 'Por favor proporciona la puntuación'],
    min: [0, 'La puntuación no puede ser negativa'],
    max: [20000, 'La puntuación no puede ser mayor a 20000']
  },
  detallesTareas: {
    type: String, // Almacenaremos los detalles como un string JSON
  },
  tiempoUtilizado: {
    type: Number,
    min: [0, 'El tiempo utilizado no puede ser negativo'],
    max: [180, 'El tiempo utilizado no puede ser mayor a 180 segundos']
  },
  pelotasAdicionales: {
    type: Number,
    default: 0,
    min: [0, 'El número de pelotas adicionales no puede ser negativo']
  },
  comentarios: {
    type: String,
    maxlength: [500, 'Los comentarios no pueden exceder los 500 caracteres']
  }
}, {
  timestamps: true,
  collection: 'calificacions' // Asegura que se use el nombre correcto de la colección
});

// Índices para mejorar el rendimiento de las consultas
CalificacionSchema.index({ equipo: 1, reto: 1 });
CalificacionSchema.index({ reto: 1 });
CalificacionSchema.index({ juez: 1 });

// Método virtual para calcular la puntuación total
CalificacionSchema.virtual('puntuacionTotal').get(function() {
  return this.puntuacion + this.pelotasAdicionales;
});

// Asegúrate de que los virtuals se incluyan cuando el documento se convierte a JSON
CalificacionSchema.set('toJSON', { virtuals: true });
CalificacionSchema.set('toObject', { virtuals: true });

export default mongoose.models.Calificacion || mongoose.model('Calificacion', CalificacionSchema);