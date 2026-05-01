const axios = require("axios");

async function sendEmail({ email, subject, html }) {
  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { email: process.env.SMTP_MAIL },
        to: [{ email }],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}

module.exports = { sendEmail };