import express from 'express';
import { check, validationResult } from 'express-validator';
import { register, login, deconnect, forgotPasswordForm, sendResetLink, resetPasswordForm, resetPassword  } from '../controller/authController.js';

const router = express.Router();

// ====== Inscription ======
router.post(
  '/register',
  [
    check('firstName', 'First name is required').not().isEmpty(),
    check('lastName', 'Last name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  ],
  (req, res, next) => {
    console.log('Corps de la requête :', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('authentification/creation', { errors: errors.array() });
    }
    next();
  },
  register
);

// ====== Connexion ======
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  login
);

// ====== Formulaire d'inscription ======
router.get('/register', (req, res) => {
  res.render('authentification/creation');
});

// ====== Déconnexion ======
router.get('/logout', deconnect);

// ====== Réinitialisation de mot de passe ======

// Affiche le formulaire "Mot de passe oublié"
router.get('/forgotPassword', forgotPasswordForm);

// Envoie le lien de réinitialisation par mail
router.post('/forgotPassword', sendResetLink);

// Affiche le formulaire pour saisir un nouveau mot de passe
router.get('/resetPassword/:token', resetPasswordForm);

// Enregistre le nouveau mot de passe
router.post('/resetPassword/:token', resetPassword);

export default router;
