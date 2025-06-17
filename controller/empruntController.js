import EMPRUNT from '../model/empruntModel.js';
import USER from '../model/userModel.js';
import MATERIEL from '../model/materielModel.js';
import sendEmail from '../utils/email.js';
import userController from './userController.js';


export const reserverMateriel = async (req, res) => {
  try {
    console.log('--- reserverMateriel ---');
    console.log('req.user       =', req.user);
    console.log('req.params     =', req.params);
    console.log('req.body       =', req.body);

    const userId = req.user.id;
    const materielId = parseInt(req.params.materielId, 10);
    const { debutEmprunt, finEmprunt } = req.body;

    // 1) Récupère l’utilisateur et le matériel en base
    const user = await USER.findOne({ id: userId });
    const materiel = await MATERIEL.findOne({ id: materielId });

    if (!user || !materiel) {
      console.warn('Utilisateur ou matériel non trouvé.', { user, materiel });
      return res.status(404).send('Utilisateur ou matériel non trouvé.');
    }

    // 2) Vérifier la cohérence des dates
    const debut = new Date(debutEmprunt);
    const fin = new Date(finEmprunt);
    if (isNaN(debut) || isNaN(fin) || debut >= fin) {
      console.warn('Dates invalides', { debutEmprunt, finEmprunt });
      return res.status(400).send('Dates de début/fin invalides ou incohérentes.');
    }

    // 3) Crée l’emprunt
    const nouvelleResa = new EMPRUNT({
      user: user._id,
      materiel: materiel._id,
      debutEmprunt: debut,
      finEmprunt: fin,
      isValid: 'En attente',
      isRendu: false
    });

    const saved = await nouvelleResa.save();
    console.log('Nouvelle réservation créée:', saved);

    materiel.isDisponible = false;
    await materiel.save();
    console.log(`Matériel #${materiel.id} passé en indisponible.`);
    // 4) Ajouter l'emprunt à l'utilisateur
    if (!Array.isArray(user.emprunt)) {
      user.emprunt = [];
    }
    if (!user.emprunt.includes(saved._id)) {
      user.emprunt.push(saved._id); // Assure-toi que `user.emprunt` est un tableau
      await user.save();
      console.log(`Emprunt #${saved._id} ajouté à l'utilisateur #${user.id}`);
    }
    // 5) Redirection ou JSON
    return res.redirect('/materiels');
  } catch (error) {
    console.error('Erreur réservation matériel :', error);
    return res.status(500).send('Erreur serveur lors de la création de la réservation.');
  }
};

/**
 * 📌 Un admin peut valider ou refuser une réservation
 * PATCH /valider/:empruntId
 * body { decision: 'refuser' | 'valider' }
 */
export const validerReservation = async (req, res) => {
  const { id } = req.params;            // _id du document
  const { decision } = req.body;        // 'valider' ou 'refuser'

  try {
    const emprunt = await EMPRUNT.findById(id)
      .populate('user', 'firstName lastName email')
      .populate('materiel', 'name');
    if (!emprunt) return res.status(404).send('Réservation non trouvée.');

    const statut = decision === 'refuser' ? 'Non Validé' : 'Validé';
    emprunt.isValid = statut;
    await emprunt.save();

    // Mettre à jour la dispo du matériel
    emprunt.materiel.isDisponible = (statut === 'Validé') ? false : true;
    await emprunt.materiel.save();

    // Envoi d'email (facultatif)

    // Rendre la vue de confirmation
    if (statut === 'Validé') {
      return res.render('reservations/validated', { reservation: emprunt });
    } else {
      return res.render('reservations/refused', { reservation: emprunt });
    }

  } catch (err) {
    console.error(err);
    return res.status(500).send('Erreur serveur lors de la validation.');
  }
};


export const reservationFormView = async (req, res) => {
  const materielId = parseInt(req.params.materielId, 10);
  try {
    const materiel = await MATERIEL.findOne({ id: materielId }).lean();
    if (!materiel) {
      return res.status(404).send('Matériel non trouvé.');
    }
    res.render('reservations/reserver', { materiel, errors: [] });
  } catch (err) {
    console.error('Erreur affichage form réservation :', err);
    res.status(500).send('Erreur serveur.');
  }
};

export const adminListReservations = async (req, res) => {
  const all = await EMPRUNT
    .find({})
    .populate('user', 'firstName lastName')
    .populate('materiel', 'name')
    .lean();

  const pending = all.filter(r => r.isValid === 'En attente');
  const processed = all.filter(r => r.isValid !== 'En attente');

  res.render('reservations/admin_list', { pending, processed });
};

/**
 * 📌 Un utilisateur peut signaler un retour
 * PATCH /retour/:empruntId
 */
export const signalerRetour = async (req, res) => {
  try {
    const empruntId = parseInt(req.params.empruntId, 10);
    const emprunt = await EMPRUNT.findOne({ id: empruntId });
    stop();
    if (!emprunt) {
      return res.status(404).json({ message: 'Réservation non trouvée.' });
    }

    emprunt.isRendu = true;
    await emprunt.save();

    res.json({ message: 'Retour signalé. En attente de validation par un admin.' });
  } catch (error) {
    console.error('Erreur signaler retour :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la signalisation du retour.' });
  }
};

/**
 * 📌 Un admin valide le retour
 * PATCH /valider-retour/:empruntId
 */
export const validerRetour = async (req, res) => {
  try {
    const empruntId = parseInt(req.params.empruntId, 10);
    const emprunt = await EMPRUNT.findOne({ id: empruntId });
    if (!emprunt) {
      return res.status(404).json({ message: 'Réservation non trouvée.' });
    }
    if (!emprunt.isRendu) {
      return res.status(400).json({ message: 'Le retour n\'a pas encore été signalé par l\'utilisateur.' });
    }

    // Remettre le matériel en dispo
    const materiel = await MATERIEL.findOne({ id: emprunt.idMateriel });
    if (!materiel) {
      return res.status(500).json({ message: 'Matériel lié non trouvé.' });
    }
    materiel.isDisponible = true;
    await materiel.save();

    // Envoi d'un email de confirmation de retour
    const user = await USER.findOne({ id: emprunt.idUser });
    if (!user) {
      return res.status(500).json({ message: 'Utilisateur lié non trouvé.' });
    }
    await sendEmail(
      user.email,
      'Confirmation de retour',
      'Votre retour a été validé.',
      `<p>Bonjour ${user.firstName || user.nom},<br>Votre retour pour <strong>${materiel.name || materiel.nom}</strong> a été <strong>validé</strong>. Merci !</p>`
    );

    res.json({ message: 'Retour validé, matériel remis en disponibilité et email envoyé.' });
  } catch (error) {
    console.error('Erreur validation retour :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la validation du retour.' });
  }
};

export const listEmprunts = async (req, res) => {
  try {
    // Récupère tous les emprunts
    const emprunts = await EMPRUNT.find({}).lean();

    // Optionnel : peupler manuellement les infos utilisateur et matériel
    // const detailed = await Promise.all(emprunts.map(async e => {
    //   const user     = await USER.findOne({ id: e.idUser }).lean();
    //   const materiel = await MATERIEL.findOne({ id: e.idMateriel }).lean();
    //   return { ...e, user, materiel };
    // }));

    res.status(200).json({ data: emprunts });
  } catch (error) {
    console.error('Erreur lors de la récupération des emprunts :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des emprunts.' });
  }
};

const empruntController = {
  validerReservation,
  validerRetour,
  reserverMateriel,
  signalerRetour,
  listEmprunts,
  reservationFormView,
  adminListReservations
};

export default empruntController;