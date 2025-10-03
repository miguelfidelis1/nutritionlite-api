const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function enviarEmail(to, subject, text, html) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"NutritionLite" <no-reply@nutritionlite.com>',
      to,
      subject,
      text,
      html,
    });

    console.log("✅ Email enviado:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Erro ao enviar email:", error);
    throw new Error("Erro ao enviar email");
  }
}

module.exports = { enviarEmail };