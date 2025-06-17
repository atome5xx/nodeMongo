import express from "express";
import { check, validationResult } from 'express-validator';  
import checkJWT from '../middleware/authMiddleware.js';           // ← au lieu de “security”
import securityAdmin from "../middleware/adminMiddleware.js";
import empruntController from '../controller/empruntController.js';


const router = express.Router();

router.get('/admin', checkJWT, securityAdmin, empruntController.adminListReservations);

router.post("/", checkJWT, securityAdmin, empruntController.listEmprunts);
router.get(
  '/reserver/:materielId', checkJWT,
  empruntController.reservationFormView
);

// Création de la réservation
router.post(
  '/reserver/:materielId', 
  checkJWT,
  // Validation des dates
  [
    check('debutEmprunt', 'Date de début invalide').isISO8601(),
    check('finEmprunt',  'Date de fin invalide').isISO8601(),
    (req, res, next) => {
      const errs = validationResult(req);
      if (!errs.isEmpty()) {
        // Re-rendre le form avec les erreurs
        return res.status(400).render('reservations/reserver', {
          materiel: { id: req.params.materielId },
          errors: errs.array()
        });
      }
      next();
    }
  ],
  empruntController.reserverMateriel
);
router.post(
  '/valider/:id',
  checkJWT, securityAdmin,
  empruntController.validerReservation
);
router.post("/retour/:empruntId", checkJWT, empruntController.signalerRetour);
router.patch("/valider-retour/:empruntId", checkJWT, securityAdmin, empruntController.validerRetour);


export default router;
