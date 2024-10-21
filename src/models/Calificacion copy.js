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
    max: [100, 'La puntuación no puede ser mayor a 100']
  },
  comentarios: {
    type: String,
    maxlength: [500, 'Los comentarios no pueden exceder los 500 caracteres']
  }
}, {
  timestamps: true,
  collection: 'calificacions' // Esto fuerza el uso del nombre exacto de la colección
});

export default mongoose.models.Calificacion || mongoose.model('Calificacion', CalificacionSchema);