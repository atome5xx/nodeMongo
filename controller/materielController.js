import MATERIEL from "../model/materielModel.js";

export const createMateriel = async (req, res) => {
    try {
      const {
        id,
        name,
        description,
        serieNumber,
        picture,
        state
      } = req.body;
  
      // ← conversion "on" | undefined → true | false
      const isDisponible = !!req.body.isDisponible;
  
      const newMateriel = new MATERIEL({
        id,
        name,
        description,
        serieNumber,
        picture,
        isDisponible,
        state
      });
  
      const savedMateriel = await newMateriel.save();
      res.status(201).json({ message: 'Matériel créé avec succès', data: savedMateriel });
    } catch (error) {
      console.error('Erreur lors de la création du matériel :', error.message);
      res.status(500).json({ message: 'Erreur serveur lors de la création du matériel.' });
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

// Mettre à jour un matériel
export const updateMateriel = async (req, res) => {
    const materielId = req.body.id;
    try {
        const updates = req.body;
        const result = await MATERIEL.updateOne({ id: materielId }, { $set: updates });

        if (result.matchedCount === 1 && result.modifiedCount === 1) {
            res.status(200).json({ message: "Matériel mis à jour avec succès" });
        } else if (result.matchedCount === 1 && result.modifiedCount === 0) {
            res.status(200).json({ message: "Aucune modification effectuée" });
        } else {
            res.status(404).json({ message: "Matériel non trouvé" });
        }
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur lors de la mise à jour du matériel", error });
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
    res.render('materiels/list', { materiels });
  };
  
  export const formMaterielView = async (req, res) => {
    // soit vide pour création, soit chargé pour édition
    const materiel = req.params.id
      ? await MATERIEL.findOne({ id: req.params.id }).lean()
      : null;
    res.render('materiels/form', { materiel });
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
