import mongoose from '../config/database.js';
import Counter from './counterModel.js';      // ← le modèle Counter

const Schema = mongoose.Schema;

const MaterielSchema = new Schema({
    id: { type: Number, required: false },
    name: { type: String, required: true },
    description: { type: String, required: true },
    serieNumber: { type: Number, default: false, unique: true },
    picture: { type: String, default: false},
    isDisponible: { type: Boolean, default: true},
    state: {
        type: String,
        enum: ['Neuf', 'Correct', 'Bon', 'Mauvais']
    },
});

MaterielSchema.pre('save', async function(next) {
    if (this.isNew && this.id == null) {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'materielId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.id = counter.seq;
    }
    next();
  });
const MATERIEL = mongoose.model('Materiels', MaterielSchema);

export default MATERIEL;