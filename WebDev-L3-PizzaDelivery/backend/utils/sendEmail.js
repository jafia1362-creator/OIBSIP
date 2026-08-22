const nodemailer = require('nodemailer');

const createTransporter = () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.EMAIL_USER !== 'your_email@gmail.com') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return null;
};

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.log(`\n================ [EMAIL NOTIFICATION MOCK] ================`);
    console.log(`TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`CONTENT:\n${text || html}`);
    console.log(`===========================================================\n`);
    return { mock: true, message: 'Logged to console (SMTP credentials not configured)' };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Pizza Delivery App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Nodemailer error:', error.message);
    console.log(`\n================ [EMAIL FALLBACK LOG] ================`);
    console.log(`TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`====================================================\n`);
    return { error: error.message };
  }
};

module.exports = sendEmail;
