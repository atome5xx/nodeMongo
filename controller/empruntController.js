import EMPRUNT   from '../model/empruntModel.js';
import USER      from '../model/userModel.js';
import MATERIEL  from '../model/materielModel.js';
import sendEmail from '../utils/email.js';

/**
 * 📌 Un utilisateur peut réserver un matériel
 * POST /reserver/:materielId
 */
export const reserverMateriel = async (req, res) => {
  try {
    const userId     = req.user.id;
    const materielId = parseInt(req.params.materielId, 10);
    const { debutEmprunt, finEmprunt } = req.body;

    // Vérification du matériel
    const materiel = await MATERIEL.findOne({ id: materielId });
    if (!materiel) {
      return res.status(404).json({ message: 'Matériel non trouvé.' });
    }
    if (!materiel.isDisponible) {
      return res.status(400).json({ message: 'Matériel non disponible.' });
    }
    if (!debutEmprunt || !finEmprunt) {
      return res.status(400).json({ message: 'Les dates de début et de fin sont requises.' });
    }

    // Création de la demande de réservation
    const nouvelleResa = new EMPRUNT({
      idUser:     userId,
      idMateriel: materielId,
      debutEmprunt,
      finEmprunt,
      isValid: 'En attente',   // statut par défaut
      isRendu:  false
    });
    await nouvelleResa.save();

    res.status(201).json({
      message: 'Réservation enregistrée, en attente de validation.',
      data: nouvelleResa
    });
  } catch (error) {
    console.error('Erreur réservation matériel :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création de la réservation.' });
  }
};

/**
 * 📌 Un admin peut valider ou refuser une réservation
 * PATCH /valider/:empruntId
 * body { decision: 'refuser' | 'valider' }
 */
export const validerReservation = async (req, res) => {
  try {
    const empruntId = parseInt(req.params.empruntId, 10);
    const { decision } = req.body; // 'refuser' ou 'valider'
    const emprunt = await EMPRUNT.findOne({ id: empruntId });
    if (!emprunt) {
      return res.status(404).json({ message: 'Réservation non trouvée.' });
    }

    // Détermination du nouveau statut
    const statut = decision === 'refuser' ? 'Non Validé' : 'Validé';
    emprunt.isValid = statut;
    await emprunt.save();

    // Mise à jour de la dispo du matériel
    const materiel = await MATERIEL.findOne({ id: emprunt.idMateriel });
    if (!materiel) {
      return res.status(500).json({ message: 'Matériel lié non trouvé.' });
    }
    materiel.isDisponible = (statut === 'Validé') ? false : true;
    await materiel.save();

    // Envoi d'email à l'utilisateur
    const user = await USER.findOne({ id: emprunt.idUser });
    if (!user) {
      return res.status(500).json({ message: 'Utilisateur lié non trouvé.' });
    }

    if (statut === 'Validé') {
      await sendEmail(
        user.email,
        'Confirmation de réservation',
        'Votre réservation a été validée.',
        `<p>Bonjour ${user.firstName || user.nom},<br>Votre réservation pour <strong>${materiel.name || materiel.nom}</strong> a été <strong>validée</strong>.</p>`
      );
    } else {
      await sendEmail(
        user.email,
        'Réservation refusée',
        'Votre réservation a été refusée.',
        `<p>Bonjour ${user.firstName || user.nom},<br>Votre demande de réservation pour <strong>${materiel.name || materiel.nom}</strong> a été <strong>refusée</strong>.</p>`
      );
    }

    res.json({ message: `Réservation ${statut === 'Validé' ? 'validée' : 'refusée'} et email envoyé.` });
  } catch (error) {
    console.error('Erreur validation réservation :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la validation de la réservation.' });
  }
};

/**
 * 📌 Un utilisateur peut signaler un retour
 * PATCH /retour/:empruntId
 */
export const signalerRetour = async (req, res) => {
  try {
    const empruntId = parseInt(req.params.empruntId, 10);
    const emprunt = await EMPRUNT.findOne({ id: empruntId });
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
  listEmprunts
};

export default empruntController;