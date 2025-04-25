import express from 'express';
import { check, validationResult } from 'express-validator';
const router = express.Router();
import empruntController from '../controller/empruntController.js';
import checkJWT from '../middleware/authMiddleware.js';

router.use(checkJWT);


// 📌 Un utilisateur peut réserver un matériel
router.post("/reserver/:materielId", checkJWT, empruntController.reserverMateriel);

// 📌 Un admin peut valider ou refuser une réservation
router.patch("/valider/:empruntId", checkJWT, checkJWT, empruntController.validerReservation);

// 📌 Un utilisateur peut signaler un retour
router.patch("/retour/:empruntId", checkJWT, empruntController.signalerRetour);

// 📌 Un admin valide le retour
router.patch("/valider-retour/:empruntId", checkJWT, checkJWT, empruntController.validerRetour);

export default router;
