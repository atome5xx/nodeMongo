import mongoose from '../config/database.js';

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    id: { type: Number, required: false },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },  // <-- ajout lowercase ici
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    emprunt: [Number],
    resetToken: { type: String },           // <-- ajout
    resetTokenExpiry: { type: Number },     // <-- ajout
}, { collection: 'Users' });

const USER = mongoose.model('Users', UserSchema);

export default USER;