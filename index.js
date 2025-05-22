import express from "express";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import methodOverride from 'method-override';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import materielRoutes from './routes/materielRoutes.js';
import empruntRoutes from './routes/empruntRoutes.js';

dotenv.config(); // Doit être appelé avant tout autre code

// Pour __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 1) Configuration du moteur de vues (EJS)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 2) Middlewares pour les formulaires & JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cookieParser());

// 3) method-override pour supporter PUT/DELETE dans les formulaires HTML
app.use(methodOverride('_method'));

// 4) Dossier static pour CSS, images…
app.use('/css', express.static(path.join(__dirname, 'public/css')));

app.get('/', (req, res) => {
  res.render('authentification/login');
});

// Montée des routes avec le bon préfixe "/auth"
app.use('/auth', authRoutes);

app.use('/users', userRoutes);
app.use('/materiels', materielRoutes);
app.use('/reservations', empruntRoutes);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('JWT_SECRET:', process.env.JWT_SECRET);
});
