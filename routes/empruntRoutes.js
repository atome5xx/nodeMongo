import express from "express";
import {
  reserverMateriel,
  validerReservation,
  signalerRetour,
  validerRetour
} from "../controllers/empruntController.js";
import { isAuth, isAdmin } from "../middlewares/authMiddleware.js";

import express from 'express';
import { check, validationResult } from 'express-validator';
const router = express.Router();

router.post("/reserver/:materielId", isAuth, reserverMateriel);
router.patch("/valider/:empruntId", isAuth, isAdmin, validerReservation);
router.patch("/retour/:empruntId", isAuth, signalerRetour);
router.patch("/valider-retour/:empruntId", isAuth, isAdmin, validerRetour);
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
