import express from 'express';
import { check, validationResult } from 'express-validator';
import materielController from '../controller/materielController.js';
import security from "../middleware/authMiddleware.js";
import securityAdmin from "../middleware/adminMiddleware.js";

const router = express.Router();

// Validation commune
const validateMateriel = [
  check('name', 'Le nom est requis').notEmpty(),
  check('description', 'La description est requise').notEmpty(),
  check('serieNumber', 'Le numéro de série doit être un nombre')
    .optional()
    .isNumeric(),
  check('state',
    "L'état doit être une des valeurs suivantes : Neuf, Correct, Bon, Mauvais"
  )
    .optional()
    .isIn(['Neuf', 'Correct', 'Bon', 'Mauvais'])
];

// Vues
router.get('/', security, materielController.listMaterielsView);
router.get('/create', security, securityAdmin, materielController.formMaterielView);
router.get('/:id/edit', security, securityAdmin, materielController.formMaterielView);

// Création (POST /materiels)
router.post(
  '/',
  security,
  securityAdmin,
  validateMateriel,
  (req, res, next) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
      return res.status(400).render('materiels/form', {
        materiel: req.body,
        errors: errs.array()
      });
    }
    next();
  },
  materielController.createMateriel
);

// **Mise à jour : la route PUT doit inclure l'id en paramètre d'URL**
router.put(
  '/:id',
  security,
  securityAdmin,
  validateMateriel,
  (req, res, next) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
      return res.status(400).render('materiels/form', {
        materiel: { id: req.params.id, ...req.body },
        errors: errs.array()
      });
    }
    next();
  },
  materielController.updateMateriel
);

// Suppression
router.delete('/:id', security, securityAdmin, materielController.deleteMateriel);

export default router;
