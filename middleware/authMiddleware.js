import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const checkJWT = async (req, res, next) => {
  // Obtenir le token du header de la requête
  const token = req.header('Authorization');

  // Vérifier si le token existe
  if (!token) {
    return res.status(401).json({ msg: 'Aucun token, autorisation refusée.' });
  }

  try {
    // Décoder et vérifier le token
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);

    // Ajouter l'utilisateur du token décodé à la requête
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Le token n\'est pas valide.' });
  }
};

export default checkJWT;
