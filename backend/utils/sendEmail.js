const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  let transporter;
  let isTest = false;

  if (!process.env.SMTP_HOST || process.env.SMTP_HOST === 'smtp.example.com') {
    isTest = true;
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
  } else {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@greenloop.com',
    to,
    subject,
    html,
  });

  const previewUrl = isTest ? nodemailer.getTestMessageUrl(info) : null;
  if (previewUrl) {
    console.log('--- TEST EMAIL SENT ---');
    console.log('Preview URL:', previewUrl);
  }

  return { info, previewUrl };
};

module.exports = sendEmail;
