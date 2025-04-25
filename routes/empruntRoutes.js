const express = require("express");
const router = express.Router();
const empruntController = require("../controllers/empruntController");
const { isAuth, isAdmin } = require("../middlewares/authMiddleware");

// 📌 Un utilisateur peut réserver un matériel
router.post("/reserver/:materielId", isAuth, empruntController.reserverMateriel);

// 📌 Un admin peut valider ou refuser une réservation
router.patch("/valider/:empruntId", isAuth, isAdmin, empruntController.validerReservation);

// 📌 Un utilisateur peut signaler un retour
router.patch("/retour/:empruntId", isAuth, empruntController.signalerRetour);

// 📌 Un admin valide le retour
router.patch("/valider-retour/:empruntId", isAuth, isAdmin, empruntController.validerRetour);

module.exports = router;
