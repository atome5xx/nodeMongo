import Emprunt from "../models/empruntModel.js";
import MATERIEL from "../models/materielModel.js";
import USER from '../model/userModel.js';
import sendEmail from "../utils/email.js";

// POST /reserver/:materielId
export const reserverMateriel = async (req, res) => {
  const { materielId } = req.params;
  const { debutEmprunt, finEmprunt } = req.body;

  try {
    const emprunt = await Emprunt.create({
      user: req.user._id,
      materiel: materielId,
      debutEmprunt,
      finEmprunt
    });

    res.status(201).json({ message: "Réservation enregistrée", emprunt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la réservation" });
  }
};

// PATCH /valider/:empruntId
export const validerReservation = async (req, res) => {
  const { empruntId } = req.params;

  try {
    const emprunt = await Emprunt.findById(empruntId).populate("user").populate("materiel");

    if (!emprunt) return res.status(404).json({ message: "Emprunt introuvable" });

    emprunt.isValid = "Validé";
    await emprunt.save();

    await sendEmail(
      emprunt.user.email,
      "Confirmation de réservation",
      "Votre matériel est réservé.",
      `<p>Bonjour ${emprunt.user.nom},<br>Votre réservation pour <strong>${emprunt.materiel.nom}</strong> a été validée.</p>`
    );

    res.status(200).json({ message: "Réservation validée et email envoyé." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la validation" });
  }
};

// PATCH /retour/:empruntId
export const signalerRetour = async (req, res) => {
  const { empruntId } = req.params;

  try {
    const emprunt = await Emprunt.findById(empruntId);
    if (!emprunt) return res.status(404).json({ message: "Emprunt introuvable" });

    emprunt.isRendu = true;
    await emprunt.save();

    res.status(200).json({ message: "Retour signalé." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors du signalement" });
  }
};

// PATCH /valider-retour/:empruntId
export const validerRetour = async (req, res) => {
  const { empruntId } = req.params;

  try {
    const emprunt = await Emprunt.findById(empruntId).populate("user").populate("materiel");
    if (!emprunt) return res.status(404).json({ message: "Emprunt introuvable" });

    emprunt.isValid = "Validé";
    emprunt.isRendu = true;
    await emprunt.save();

    await sendEmail(
      emprunt.user.email,
      "Confirmation de retour",
      "Votre matériel a été retourné.",
      `<p>Bonjour ${emprunt.user.nom},<br>Le retour du matériel <strong>${emprunt.materiel.nom}</strong> a bien été enregistré.</p>`
    );

    res.status(200).json({ message: "Retour validé et email envoyé." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la validation du retour" });
  }
};
