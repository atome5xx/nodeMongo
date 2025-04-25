import express from 'express';
import { check, validationResult } from 'express-validator';
import materielController from '../controller/materielController.js';

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
router.get('/create', materielController.formMaterielView);

// Formulaire d’édition
router.get('/:id/edit', materielController.formMaterielView);

// ---------------------------------------------------
// 3) Traitement du formulaire de création (/POST /)
// ---------------------------------------------------
router.post(
  '/',
  validateMateriel,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // En cas d’erreurs, on ré-affiche le form avec les données et les messages
      return res.status(400).render('materiels/form', {
        materiel: req.body,
        errors:   errors.array()
      });
    }
    next();
  },
  materielController.createMateriel
);

// ----------------------------------------------------
// 4) Traitement du formulaire de mise à jour (/PUT /)
// ----------------------------------------------------
router.put(
  '/',
  validateMateriel,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('materiels/form', {
        materiel: req.body,
        errors:   errors.array()
      });
    }
    next();
  },
  materielController.updateMateriel
);

// --------------------------------------
// 5) Route de suppression (DELETE /:id)
// --------------------------------------
router.delete('/:id', materielController.deleteMateriel);

export default router;
