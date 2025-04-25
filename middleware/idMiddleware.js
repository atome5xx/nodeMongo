import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const checkId = async (req, res, next) => {
  // Obtenir le token du header de la requête
  const token = req.cookies.token;

  // Vérifier si le token existe
  if (!token) {
    return res.status(401).json({ msg: 'Aucun token, autorisation refusée.' });
  }

  try {
    // Décoder et vérifier le token
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);

    // Récupérer l'ID de l'utilisateur passé par les paramètres, la query ou le corps de la requête
    const userIdFromParams = req.params.id ? parseInt(req.params.id, 10) : null;
    const userIdFromQuery = req.query.id ? parseInt(req.query.id, 10) : null;
    const userIdFromBody = req.body && req.body.id ? parseInt(req.body.id, 10) : null;

    // Utiliser l'ID trouvé dans l'une des sources, ou null si aucune n'est trouvée
    const userIdFromRequest = userIdFromParams || userIdFromQuery || userIdFromBody;

    // Vérifier si un ID a été fourni dans la requête
    if (userIdFromRequest === null) {
      return res.status(400).json({ msg: 'Aucun ID utilisateur fourni dans la requête.' });
    }

    // Comparer l'ID du token avec l'ID fourni dans la requête
    if (decoded.user.id !== userIdFromRequest) {
      return res.status(401).json({ msg: 'L\'ID utilisateur ne correspond pas au token.' });
    }

    // Ajouter l'utilisateur du token décodé à la requête
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token invalide.' });
  }
};

export default checkId;
