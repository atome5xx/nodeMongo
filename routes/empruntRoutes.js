import express from "express";
import {
  reserverMateriel,
  validerReservation,
  signalerRetour,
  validerRetour
} from "../controllers/empruntController.js";
import { isAuth, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/reserver/:materielId", isAuth, reserverMateriel);
router.patch("/valider/:empruntId", isAuth, isAdmin, validerReservation);
router.patch("/retour/:empruntId", isAuth, signalerRetour);
router.patch("/valider-retour/:empruntId", isAuth, isAdmin, validerRetour);

export default router;
