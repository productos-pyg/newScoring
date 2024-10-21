import mongoose from 'mongoose';

const EquipoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'Por favor proporciona el nombre del equipo'],
    trim: true,
    maxlength: [100, 'El nombre no puede ser más largo de 100 caracteres']
  },
  miembros: [{
    nombre: {
      type: String,
      required: [true, 'Por favor proporciona el nombre del miembro'],
      trim: true
    },
    edad: {
      type: Number,
      required: [true, 'Por favor proporciona la edad del miembro']
    }
  }],
  coach: {
    nombre: {
      type: String,
      required: [true, 'Por favor proporciona el nombre del coach'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Por favor proporciona el email del coach'],
      trim: true,
      lowercase: true
    }
  },
  reto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reto',
    required: [true, 'Por favor proporciona el ID del reto asociado']
  }
}, {
  timestamps: true
});

export default mongoose.models.Equipo || mongoose.model('Equipo', EquipoSchema);