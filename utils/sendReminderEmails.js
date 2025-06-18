import mongoose from 'mongoose';
import dotenv from 'dotenv';
import sendEmail from './email.js';

import Emprunt from '../model/empruntModel.js';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

export async function sendReminders() {
  if (!MONGO_URI) {
    console.error('❌ MONGODB_URI est introuvable dans le fichier .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connecté à MongoDB');

    const now = new Date();
    const reminderStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const reminderEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    const emprunts = await Emprunt.find({
      finEmprunt: { $gte: reminderStart, $lte: reminderEnd },
      isValid: 'Validé',
      isRendu: false,
    }).populate('user').populate('materiel');

    if (emprunts.length === 0) {
      console.log('ℹ️ Aucun emprunt à rappeler.');
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
    }

    console.log(`✅ ${emprunts.length} rappel(s) envoyé(s)`);
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi des rappels :', error);
  } finally {
    await mongoose.disconnect();
  }
}
