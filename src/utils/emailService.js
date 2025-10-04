// src/utils/emailService.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587", 10),
  secure: false, // false -> STARTTLS (porta 587)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false // permite certificados autoassinados (útil em alguns hosts). Ok pra dev.
  }
});

async function enviarEmail(to, subject, html) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"NutritionLite" <no-reply@nutritionlite.com>`,
      to,
      subject,
      html
    });
    console.log("✅ Email enviado:", info.messageId);
    return info;
  } catch (err) {
    console.error("❌ Erro ao enviar email:", err);
    throw err;
  }
}

module.exports = { enviarEmail };
