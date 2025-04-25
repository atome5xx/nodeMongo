import mongoose from '../config/database.js';

const Schema = mongoose.Schema;

const EmpruntSchema = new Schema({
    id: { type: Number, required: false },
    idUser: { type: Number, required: true },
    id: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    emprunt: [Number],
}, { collection: 'Emprunts' });

const EMPRUNT = mongoose.model('Emprunts', EmpruntSchema);

export default EMPRUNT;