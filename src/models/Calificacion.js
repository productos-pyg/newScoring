import mongoose from 'mongoose';

const IntentoSchema = new mongoose.Schema({
  numero: Number,
  puntuacion: Number,
  detallesTareas: String,
  tiempoUtilizado: Number,
  noRealizado: { type: Boolean, default: false }
});

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
  intentos: [IntentoSchema],
  puntuacionTotal: { type: Number, default: 0 }
}, {
  timestamps: true,
  collection: 'calificacions'
});

export default mongoose.models.Calificacion || mongoose.model('Calificacion', CalificacionSchema);