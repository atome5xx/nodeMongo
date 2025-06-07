import MATERIEL from "../model/materielModel.js";
import jwt from 'jsonwebtoken';

export const createMateriel = async (req, res) => {
  // cast de la checkbox
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
    // redirection VERS la liste
    return res.redirect('/materiels');
  } catch (err) {
    console.error('Erreur création matériel :', err);
    // si erreurs Mongoose ou custom, on ré-affiche le form
    const errors = err.name === 'ValidationError'
      ? Object.values(err.errors).map(e => ({ msg: e.message }))
      : [{ msg: err.message }];
    return res.status(400).render('materiels/form', { materiel: data, errors });
  }
};


// Obtenir les détails d’un matériel par ID
export const getMateriel = async (req, res) => {
  const materielId = parseInt(req.params.id, 10);
  try {
    const materiel = await MATERIEL.findOne({ id: materielId }).exec();
    if (!materiel) {
      return res.status(404).json({ message: 'Matériel non trouvé.' });
    }
    res.status(200).json(materiel);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du matériel.' });
  }
};

export const updateMateriel = async (req, res) => {
  // on récupère l'id caché et on cast la checkbox
  const materielId = req.body.id;
  const isDisponible = !!req.body.isDisponible;
  const updates = {
    name: req.body.name,
    description: req.body.description,
    serieNumber: req.body.serieNumber,
    picture: req.body.picture,
    isDisponible,
    state: req.body.state
  };

  try {
    const result = await MATERIEL.updateOne(
      { id: materielId },
      { $set: updates }
    );
    if (result.matchedCount === 0) {
      // cas où l'id n'existe pas
      return res.status(404).render('materiels/form', {
        materiel: { id: materielId, ...updates },
        errors: [{ msg: 'Matériel non trouvé pour mise à jour.' }]
      });
    }
    // redirection vers la liste
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



// Supprimer un matériel
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

// Lister tous les matériels
export const listMaterielsView = async (req, res) => {
  const materiels = await MATERIEL.find({}).lean();
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).send('Token manquant');
  }

  const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
  const { id, isAdmin } = decoded.user;

  // Envoie la vue avec les données
  res.render('materiels/list', {
    materiels,
    userId: id,
    admin: isAdmin,
  });
};

export const formMaterielView = async (req, res) => {
  try {
    let materiel = null;
    if (req.params.id) {
      materiel = await MATERIEL.findOne({ id: parseInt(req.params.id, 10) }).lean();
    }
    // Passe toujours errors, même vide
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
