import USER from '../model/userModel.js';
import Counter from '../model/counterModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import sendEmail from '../utils/email.js';


// Fonction d'inscription
export const register = async (req, res) => {
    const { firstName, lastName, email, password, emprunt = [] } = req.body;

    try {
        let user = await USER.findOne({ email });
        if (user) {
            return res.status(400).render('authentification/creation', { error: 'User already exists' });
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

        // 🔐 Si l'email est "admin@gmail.com", on force le rôle admin
        const isAdmin = email.toLowerCase() === "admin@gmail.com";

        user = new USER({
            id,
            firstName,
            lastName,
            email,
            password: hashedPassword,
            emprunt,
            isAdmin
        });

        await user.save();

        // ✉️ Envoi d’un email de bienvenue
        await sendEmail(
            email,
            'Bienvenue sur LabManager',
            'Votre compte a bien été créé.',
            `<p>Bonjour ${firstName},<br>Bienvenue sur <strong>LabManager</strong> ! Votre compte a bien été créé.</p>`
        );

        const payload = {
            user: {
                id: user.id,
                isAdmin: user.isAdmin,
            },
        };

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ msg: 'JWT secret is not defined' });
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000
        }).redirect(`/users/${user.id}`);
    } catch (err) {
        console.error('Erreur lors de l’inscription :', err);
        res.status(500).send('Server error');
    }
};



// Fonction de connexion
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await USER.findOne({ email }).exec();
        if (!user) {
            return res.status(400).render('authentification/login', { error: 'Email ou mot de passe incorrect.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).render('authentification/login', { error: 'Email ou mot de passe incorrect.' });
        }

        const payload = {
            user: {
                id: user.id,
                isAdmin: user.isAdmin,
            },
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000
        }).redirect(`/users/${user.id}`);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

export const deconnect = async (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
}





//Forgot password

export const forgotPasswordForm = (req, res) => {
    res.render('authentification/forgotPassword', { error: null, success: null });
};




export const sendResetLink = async (req, res) => {
  const email = req.body.email.toLowerCase();  // conversion en minuscules
  try {
    const user = await USER.findOne({ email });
    if (!user) {
      return res.status(400).render('authentification/forgotPassword', {
        error: 'Aucun utilisateur trouvé avec cet email.',
        success: null,
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000; // 1h
    await user.save();

    const resetUrl = `http://${req.headers.host}/auth/resetPassword/${token}`;

    const html = `
      <p>Bonjour ${user.firstName},</p>
      <p>Vous avez demandé une réinitialisation de votre mot de passe.</p>
      <p>Cliquez sur ce lien pour créer un nouveau mot de passe :</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>Ce lien expire dans 1 heure.</p>
    `;

    await sendEmail(
      user.email,
      'Réinitialisation de mot de passe',
      `Visitez ce lien : ${resetUrl}`,
      html
    );

    res.render('authentification/forgotPassword', {
      success: 'Un lien de réinitialisation a été envoyé à votre adresse email.',
      error: null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
};


  

export const resetPasswordForm = async (req, res) => {
  const { token } = req.params;
  console.log('Token reçu :', token);
  try {
    const user = await USER.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });
    console.log('User trouvé :', user);
    if (!user) {
      return res.status(400).send('Lien invalide ou expiré.');
    }
    res.render('authentification/resetPassword', { 
      token, 
      error: null, 
      success: null 
    });
  } catch (err) {
    res.status(500).send('Erreur serveur');
  }
};



export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
  
    try {
      const user = await USER.findOne({
        resetToken: token,
        resetTokenExpiry: { $gt: Date.now() }
      });
  
      if (!user) {
        return res.status(400).send('Lien invalide ou expiré.');
      }
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      user.password = hashedPassword;
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;
      await user.save();
  
      res.redirect('/');
    } catch (err) {
      res.status(500).send('Erreur serveur');
    }
};
  




export default {
    register,
    login,
    deconnect,
    forgotPasswordForm,
    sendResetLink,
    resetPasswordForm,
    resetPassword
  };
