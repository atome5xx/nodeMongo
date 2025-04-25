import USER from "../model/userModel.js";

// Afficher les données d'un utilisateur
export const getProfile = async (req, res) => {
    const userId = parseInt(req.params.id, 10);
    try {
        const user = await USER.findOne({ id: userId }, { _id: 0 }).exec();
        if (user) {
            res.json(user);
        } else {
            logger.warn(`Utilisateur non trouvé pour l'ID ${userId}.`);
            res.status(404).json('Utilisateur non trouvé.');
        }
    } catch (err) {
        logger.error('Erreur lors de la récupération du profil utilisateur :', err.message);
        res.status(500).send('Server error');
    }
};

// Mettre à jour le profil d'un utilisateur
export const updateUser = async (req, res) => {
    const userId = req.body.id;
    const userFirstName = req.body.firstName;
    const userLastName = req.body.lastName;
    const userEmail = req.body.email;
    const userPassword = req.body.password;
    try {
        const user = await USER.findOne({ id: userId }, { _id: 0 }).exec();

        if (user) {
            const misesAJour = {};
            if (userFirstName !== undefined) misesAJour.firstName = userFirstName;
            if (userLastName !== undefined) misesAJour.lastName = userLastName;
            if (userEmail !== undefined) misesAJour.email = userEmail;
            if (userPassword !== undefined) misesAJour.password = userPassword;

            const result = await USER.updateOne({ id: userId }, { $set: misesAJour });

            if (result.matchedCount === 1 && result.modifiedCount === 1) {
                res.status(200).json({ message: "Utilisateur mis à jour avec succès", data: result });
            } else if (result.matchedCount === 1 && result.modifiedCount === 0) {
                res.status(200).json({ message: "Aucune modification effectuée" });
            } else {
                res.status(404).json({ message: "Utilisateur non trouvé" });
            }
        } else {
            res.status(404).json({ message: "Utilisateur non trouvé" });
        }
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur lors de la mise à jour de l'utilisateur", error });
    }
}

// Supprimer un utilisateur
export const deleteUser = async (req, res) => {
    const userId = parseInt(req.params.id, 10);
    try {
        const result = await USER.deleteOne({ id: userId }).exec();
        if (result.deletedCount === 0) {
            return res.status(404).json('Aucun utilisateur trouvé.');
        }

        res.status(200).json('Utilisateur supprimé avec succès.');
    } catch (error) {
        res.status(500).json('Erreur lors de la suppression de l\'utilisateur.');
    }
}

// Ajouter un materiel aux emprunts d'un utilisateur
export const addEmprunt = async (req, res) => {

    try {
        const userId = req.body.id;
        const empruntId = req.body.empruntId;

        // Vérification de la validité des IDs
        if (isNaN(userId) || isNaN(empruntId)) {
            return res.status(400).json('ID utilisateur ou ID emprunt invalide.');
        }

        // Vérification si l'emprunt existe
        const emprunt = await EMPRUNT.findOne({ id: empruntId });
        if (!emprunt) {
            return res.status(404).json('Emprunt non trouvé.');
        }

        // Vérification si l'utilisateur existe
        const user = await USER.findOne({ id: userId });
        if (!user) {
            return res.status(404).json('Utilisateur non trouvé.');
        }

        // Vérification si l'emprunt est déjà dans les favoris
        if (user.emprunt.includes(empruntId)) {
            return res.status(400).json('Le matériel est déjà dans la liste des empruns.');
        }

        // Ajout de l'emprunt aux favoris de l'utilisateur
        user.emprunt.push(empruntId);
        await user.save();

        res.status(200).json('Emprunt ajouté aux emprunts avec succès.');
    } catch (error) {
        res.status(500).json('Erreur lors de l\'emprunt.');
    }
};

// Supprimer un materiel des emprunts d'un utilisateur
export const delEmprunt = async (req, res) => {
    logger.info('Received request:', { method: req.method, url: req.originalUrl });

    try {
        const userId = req.body.id;
        const empruntId = req.body.empruntId;

        // Vérification de la validité des IDs
        if (isNaN(userId) || isNaN(empruntId)) {
            return res.status(400).json('ID utilisateur ou ID emprunt invalide.');
        }

        // Vérification si l'emprunt existe
        const emprunt = await EMPRUNT.findOne({ id: empruntId });
        if (!emprunt) {
            return res.status(404).json('Emprunt non trouvé.');
        }

        // Vérification si l'utilisateur existe
        const user = await USER.findOne({ id: userId });
        if (!user) {
            return res.status(404).json('Utilisateur non trouvé.');
        }

        // Vérification si l'emprunt est dans la liste
        if (!user.emprunt.includes(empruntId)) {
            return res.status(400).json('Le matériel n\'est pas dans la liste des emprunts.');
        }

        // Suppression du materiel des emprunts
        user.emprunt = user.emprunt.filter(empId => empId !== empruntId);
        await user.save();

        res.status(200).json('Matériel supprimé des emprunts avec succès.');
    } catch (error) {
        res.status(500).json('Erreur lors de la suppression du matériel dans l\'emprunt.');
    }
};

// Afficher les emprunts d'un utilisateur
export const affEmprunt = async (req, res) => {
    try {
        const userId = parseInt(req.params.id, 10);

        if (isNaN(userId)) {
            return res.status(400).json('ID utilisateur invalide.');
        }

        const user = await USER.findOne({ id: userId }).exec();
        if (!user) {
            logger.warn(`Utilisateur non trouvé pour l'ID ${userId}.`);
            return res.status(404).json('Utilisateur non trouvé.');
        }

        const empruntIds = user.emprunt;

        if (empruntIds.length === 0) {
            return res.status(200).json('Aucun emprunt dans la liste.');
        }

        const materiels = await MATERIEL.find({ id: { $in: empruntIds } }).exec();
        const materielTitles = materiels.map(materiel => materiel.nom);

        res.status(200).json({ emprunts: materielTitles });
    } catch (error) {
        res.status(500).json('Erreur lors de l\'affichage des emprunts.');
    }
};

const userController = {
    getProfile,
    updateUser,
    deleteUser,
    addEmprunt,
    delEmprunt,
    affEmprunt
};

export default userController;