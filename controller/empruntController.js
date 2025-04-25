const sendEmail = require("../utils/email");

exports.confirmerReservation = async (req, res) => {
  // ...logique de validation...
  await sendEmail(
    user.email,
    "Confirmation de réservation",
    "Votre matériel est réservé.",
    `<p>Bonjour ${user.nom},<br>Votre réservation pour <strong>${materiel.nom}</strong> a été confirmée.</p>`
  );
  res.status(200).json({ message: "Réservation confirmée et email envoyé." });
};
