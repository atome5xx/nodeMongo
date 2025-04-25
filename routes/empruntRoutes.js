import express from "express";
import security from "../middleware/authMiddleware.js";
import securityAdmin from "../middleware/adminMiddleware.js";
import empruntController from '../controller/empruntController.js';


const router = express.Router();

router.post("/reserver/:materielId", security, empruntController.reserverMateriel);
router.patch("/valider/:empruntId", security, securityAdmin, empruntController.validerReservation);
router.patch("/retour/:empruntId", security, empruntController.signalerRetour);
router.patch("/valider-retour/:empruntId", security, securityAdmin, empruntController.validerRetour);


export default router;
