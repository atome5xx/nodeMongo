// utils/email.js
import nodemailer from "nodemailer";
import dotenv from 'dotenv';

dotenv.config(); // Doit être appelé avant tout autre code


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

const sendEmail = async (to, subject, text, html) => {
  try {
    await transporter.sendMail({
      from: `"LabManager" <${process.env.MAIL_USER}>`,
      to,
      subject,
      text,
      html
    });
    console.log("📧 Email envoyé à", to);
  } catch (err) {
    console.error("❌ Erreur d'envoi d'e-mail :", err);
  }
};

export default sendEmail;