import express from 'express';
import { check, validationResult } from 'express-validator';
import materielController from '../controller/materielController.js';
import security from "../middleware/authMiddleware.js";
import securityId from "../middleware/idMiddleware.js";
import securityAdmin from "../middleware/adminMiddleware.js";
const router = express.Router();

// --------------------------------------------------
// 1) Validation commune pour création & modification
// --------------------------------------------------
const validateMateriel = [
  check('name',        'Le nom est requis').notEmpty(),
  check('description', 'La description est requise').notEmpty(),
  check('serieNumber', 'Le numéro de série doit être un nombre')
    .optional()
    .isNumeric(),
  check('state',
        'L\'état doit être une des valeurs suivantes : Neuf, Correct, Bon, Mauvais'
  )
    .optional()
    .isIn(['Neuf', 'Correct', 'Bon', 'Mauvais'])
];

// ---------------------------------
// 2) Routes de rendu des vues EJS
// ---------------------------------
// Liste des matériels
router.get('/', materielController.listMaterielsView);

// Formulaire de création
router.get('/create',security, securityAdmin, materielController.formMaterielView);

// Formulaire d’édition
router.get('/:id/edit', security, securityAdmin, materielController.formMaterielView);

// ---------------------------------------------------
// 3) Traitement du formulaire de création (/POST /)
// ---------------------------------------------------
// Création
router.post(
    '/', security, securityAdmin,
    validateMateriel,
    (req, res, next) => {
      const errs = validationResult(req);
      if (!errs.isEmpty()) {
        return res.status(400).render('materiels/form', {
          materiel: req.body,
          errors:   errs.array()
        });
      }
      next();
    },
    materielController.createMateriel
  );
  
  // Mise à jour
  router.put(
    '/', security, securityAdmin,
    validateMateriel,
    (req, res, next) => {
      const errs = validationResult(req);
      if (!errs.isEmpty()) {
        return res.status(400).render('materiels/form', {
          materiel: req.body,
          errors:   errs.array()
        });
      }
      next();
    },
    materielController.updateMateriel
  );

// --------------------------------------
// 5) Route de suppression (DELETE /:id)
// --------------------------------------
router.delete('/:id', security, securityAdmin, materielController.deleteMateriel);

export default router;
