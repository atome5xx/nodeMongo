import express from 'express';
import { check, validationResult } from 'express-validator';
import materielController from '../controller/materielController.js';

const router = express.Router();

// Middleware de validation

const validateMateriel = [
    check('name', 'Le nom est requis').notEmpty(),
    check('description', 'La description est requise').notEmpty(),
    check('serieNumber', 'Le numéro de série doit être un nombre').optional().isNumeric(),
    check('state', 'L\'état doit être une des valeurs suivantes : Neuf, Correct, Bon, Mauvais')
        .optional()
        .isIn(['Neuf', 'Correct', 'Bon', 'Mauvais']),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// 1) Vues (statique) — à déclarer avant la route paramétrée `/:id`
router.get('/',       materielController.listMaterielsView);  // GET /materiels
router.get('/create', materielController.formMaterielView);   // GET /materiels/create
router.get('/:id/edit', materielController.formMaterielView); // GET /materiels/123/edit

// 2) API JSON
router.post('/', validateMateriel, materielController.createMateriel);    // POST /materiels
router.get('/:id',           materielController.getMateriel);            // GET /materiels/123
router.put('/',  validateMateriel, materielController.updateMateriel);  // PUT  /materiels
router.delete('/:id',        materielController.deleteMateriel);         // DELETE /materiels/123

export default router;
