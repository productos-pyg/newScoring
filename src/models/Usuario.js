import mongoose from 'mongoose';

const UsuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'Por favor proporciona el nombre del usuario'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Por favor proporciona el email del usuario'],
    unique: true,
    trim: true,
    lowercase: true
  },
  rol: {
    type: String,
    enum: ['admin', 'juez', 'espectador'],
    default: 'espectador'
  }
}, {
  timestamps: true
});

export default mongoose.models.Usuario || mongoose.model('Usuario', UsuarioSchema);