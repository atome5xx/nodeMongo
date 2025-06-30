import express from "express";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import methodOverride from 'method-override';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import materielRoutes from './routes/materielRoutes.js';
import empruntRoutes from './routes/empruntRoutes.js';
import './utils/scheduler.js';  // Scheduler lancé ici

dotenv.config(); // Doit être appelé avant tout autre code

// Pour __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Connexion MongoDB
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Labo';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Connecté à MongoDB');

  // Configuration express

  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(methodOverride('_method'));
  app.use('/css', express.static(path.join(__dirname, 'public/css')));

  app.get('/', (req, res) => {
    res.render('authentification/login');
  });

  app.use('/auth', authRoutes);
  app.use('/users', userRoutes);
  app.use('/materiels', materielRoutes);
  app.use('/reservations', empruntRoutes);

  // Lancement serveur
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`App listening on port ${PORT}`);
    console.log('JWT_SECRET:', process.env.JWT_SECRET);
  });

}).catch(err => {
  console.error('❌ Erreur de connexion à MongoDB:', err);
  process.exit(1);
});
