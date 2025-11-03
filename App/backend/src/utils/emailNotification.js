import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APP_PASSWORD
      }
});

export const sendEmailNotification = async (to, subject, text, html) => {
      try {
            const mailOptions = {
                  from: process.env.EMAIL_USER,
                  to,
                  subject,
                  text,
                  html
            };

            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', info.messageId);
            return {
                  success: true,
                  messageId: info.messageId
            };
      } catch (error) {
            console.error('Error sending email:', error);
            return {
                  success: false,
                  error: error.message
            };
      }
};