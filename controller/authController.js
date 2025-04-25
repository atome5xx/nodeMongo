import USER from '../model/userModel.js';
import Counter from '../model/counterModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Fonction d'inscription
export const register = async (req, res) => {
    const { firstName, lastName, email, password, emprunt = [] } = req.body;

    try {
        let user = await USER.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Obtenir le prochain ID à partir du compteur
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'userId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        const id = counter.seq;

        user = new USER({
            id,
            firstName,
            lastName,
            email,
            password: hashedPassword,
            emprunt,
        });

        await user.save();

        const payload = {
            user: {
                id: user.id,
                isAdmin: user.isAdmin,
            },
        };

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ msg: 'JWT secret is not defined' });
        }

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) {
                return res.status(500).send('Server error');
            }
            res.json({ token });
        });
    } catch (err) {
        res.status(500).send('Server error');
    }
};

// Fonction de connexion
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await USER.findOne({ email }).exec();
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: user.id,
                isAdmin: user.isAdmin,
            },
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) {
                return res.status(500).send('Server error');
            }
            res.header('Authorization', 'Bearer ' + token);
            res.json({ token });
        });
    } catch (err) {
        res.status(500).send('Server error');
    }
};

export default {
    register,
    login,
};
