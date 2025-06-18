import sendEmail from './email.js';
import Emprunt from '../model/empruntModel.js';

export async function sendReminders() {
  try {
    const now = new Date();
    const reminderStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const reminderEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    const emprunts = await Emprunt.find({
      finEmprunt: { $gte: reminderStart, $lte: reminderEnd },
      isValid: 'Validé',
      isRendu: 'Non Rendu',
      isRappelEnvoye: false  // Ne pas envoyer plusieurs fois
    }).populate('user').populate('materiel');

    if (emprunts.length === 0) {
      console.log('ℹ️ Aucun emprunt à rappeler.');
      return;
    }

    for (const emprunt of emprunts) {
      const user = emprunt.user;
      const materiel = emprunt.materiel;

      if (!user || !materiel) continue;

      const subject = '⏰ Rappel : votre emprunt se termine bientôt';
      const text = `Bonjour ${user.firstName},

Votre emprunt pour le matériel "${materiel.nom}" se termine dans moins de 24 heures.

Merci de le retourner à temps.

Cordialement,
LabManager`;

      const html = `<p>Bonjour ${user.firstName},</p>
<p>Votre emprunt pour le matériel <strong>${materiel.nom}</strong> se termine dans moins de 24 heures.</p>
<p>Merci de le retourner à temps.</p>
<p>Cordialement,<br>LabManager</p>`;

      await sendEmail(user.email, subject, text, html);

      // Mise à jour pour éviter de renvoyer un rappel
      emprunt.isRappelEnvoye = true;
      await emprunt.save();
    }

    console.log(`✅ ${emprunts.length} rappel(s) envoyé(s)`);
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi des rappels :', error);
  }
}
