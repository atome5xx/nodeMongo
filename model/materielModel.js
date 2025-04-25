import mongoose from '../config/database.js';

const Schema = mongoose.Schema;

const MaterielSchema = new Schema({
    id: { type: Number, required: false },
    nom: { type: String, required: true },
    description: { type: String, required: true },
    numSerie: { type: Number, default: false, unique: true },
    photo: { type: String, default: false},
    etat: { type: Enumerator({'Neuf': 1, 'bon':2, 'Correct':3, 'Mauvais':4}) }
});

const MATERIEL = mongoose.model('Materiels', MaterielSchema);

export default MATERIEL;