import cron from 'node-cron';
import { sendReminders } from './sendReminderEmails.js';

// Planifie la tâche pour s'exécuter toutes les heures à la minute 0 (ex: 14:00, 15:00, 16:00, ...)
// toutes les minutes maintenant : A MODIFIER !!!
cron.schedule('* * * * *', async () => {
  console.log('⌚ Tâche cron lancée : envoi des rappels...');
  try {
    await sendReminders();
  } catch (err) {
    console.error('Erreur dans la tâche cron:', err);
  }
});

console.log('✅ Scheduler démarré, les rappels seront envoyés toutes les heures.');
