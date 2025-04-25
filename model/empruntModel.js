import mongoose from '../config/database.js';

const Schema = mongoose.Schema;

const EmpruntSchema = new Schema({
    id: { type: Number, required: false },
    idUser: { type: Number, required: true },
    idMateriel: { type: Number, required: true },
    debutEmprunt: { type: Date, required: true },
    finEmprunt: { type: Date, required: true },
    isValid: {
        type: String,
        enum: ['En attente', 'Non Validé', 'Validé'],
        default: 'En attente'
    },
    isRendu: { type: Boolean, default: false },
}, { collection: 'Emprunts' });

const EMPRUNT = mongoose.model('Emprunts', EmpruntSchema);

export default EMPRUNT;