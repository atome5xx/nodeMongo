// utils/email.js
const nodemailer = require("nodemailer");
require("dotenv").config();

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

module.exports = sendEmail;
