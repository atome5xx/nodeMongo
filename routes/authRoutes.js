import express from 'express';
import { check, validationResult } from 'express-validator';
import { register, login, deconnect } from '../controller/authController.js';

const router = express.Router();

router.post(
    '/register',
    [
        check('firstName', 'First name is required').not().isEmpty(),
        check('lastName', 'Last name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    ],
    (req, res, next) => {
        console.log('Corps de la requête :', req.body);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render('authentification/creation', { errors: errors.array() });
        }
        next();
    },
    register
);

router.post(
    '/login',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists(),
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    login
);

router.get(
    '/register',
    (req, res, next) => {
        res.render('authentification/creation');
    },
);

router.get(
    '/logout',
    deconnect
);

export default router;