import MATERIEL from "../model/materielModel.js";
import jwt from 'jsonwebtoken';

export const createMateriel = async (req, res) => {
  const isDisponible = !!req.body.isDisponible;
  const data = {
    name: req.body.name,
    description: req.body.description,
    serieNumber: req.body.serieNumber,
    picture: req.body.picture,
    isDisponible,
    state: req.body.state
  };

  try {
    await new MATERIEL(data).save();
    return res.redirect('/materiels');
  } catch (err) {
    console.error('Erreur création matériel :', err);
    const errors = err.name === 'ValidationError'
      ? Object.values(err.errors).map(e => ({ msg: e.message }))
      : [{ msg: err.message }];
    return res.status(400).render('materiels/form', { materiel: data, errors });
  }
};

export const getMateriel = async (req, res) => {
  const materielId = parseInt(req.params.id, 10);
  try {
    const materiel = await MATERIEL.findOne({ id: materielId }).lean();
    if (!materiel) {
      return res.status(404).json({ message: 'Matériel non trouvé.' });
    }
    res.status(200).json(materiel);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du matériel.' });
  }
};

export const updateMateriel = async (req, res) => {
  const materielId = parseInt(req.body.id, 10); // S'assurer que c'est bien un nombre
  const isDisponible = !!req.body.isDisponible;

  const updates = {
    name: req.body.name,
    description: req.body.description,
    serieNumber: parseInt(req.body.serieNumber, 10),
    picture: req.body.picture,
    isDisponible,
    state: req.body.state
  };

  try {
    // Vérifie si un autre matériel a déjà ce numéro de série
    const existing = await MATERIEL.findOne({
      serieNumber: updates.serieNumber,
      id: { $ne: materielId } // exclut le matériel actuel
    });

    if (existing) {
      return res.status(400).render('materiels/form', {
        materiel: { id: materielId, ...updates },
        errors: [{ msg: 'Ce numéro de série est déjà utilisé par un autre matériel.' }]
      });
    }

    const result = await MATERIEL.updateOne(
      { id: materielId },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return res.status(404).render('materiels/form', {
        materiel: { id: materielId, ...updates },
        errors: [{ msg: 'Matériel non trouvé pour mise à jour.' }]
      });
    }

    return res.redirect('/materiels');
  } catch (err) {
    console.error('Erreur mise à jour matériel :', err);
    const errors = err.name === 'ValidationError'
      ? Object.values(err.errors).map(e => ({ msg: e.message }))
      : [{ msg: err.message }];
    return res.status(400).render('materiels/form', {
      materiel: { id: materielId, ...updates },
      errors
    });
  }
};


export const deleteMateriel = async (req, res) => {
  const materielId = parseInt(req.params.id, 10);
  try {
    const result = await MATERIEL.deleteOne({ id: materielId }).exec();
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Matériel non trouvé.' });
    }
    res.status(200).json({ message: 'Matériel supprimé avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du matériel.' });
  }
};

export const listMaterielsView = async (req, res) => {
  try {
    const materiels = await MATERIEL.find({}).lean();

    // Récupération du token depuis cookie
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).send('Token manquant');
    }

    // Vérifier et décoder le token JWT
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    const { id, isAdmin } = decoded.user;

    res.render('materiels/list', {
      materiels,
      userId: id,
      admin: isAdmin,
    });
  } catch (error) {
    console.error("Erreur affichage liste matériels:", error);
    res.status(500).send("Erreur serveur lors de l'affichage de la liste des matériels.");
  }
};

export const formMaterielView = async (req, res) => {
  try {
    let materiel = null;
    if (req.params.id) {
      materiel = await MATERIEL.findOne({ id: parseInt(req.params.id, 10) }).lean();
      if (!materiel) {
        return res.status(404).send("Matériel non trouvé");
      }
    }
    res.render('materiels/form', { materiel, errors: [] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur lors de l'affichage du formulaire.");
  }
};

const materielController = {
  getMateriel,
  createMateriel,
  updateMateriel,
  deleteMateriel,
  listMaterielsView,
  formMaterielView
};

export default materielController;
