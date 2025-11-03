import { sendEmailNotification } from '../utils/emailNotification.js';

export const sendEmail = async (req, res) => {
      try {
            const { to, subject, text, html } = req.body;

            if (!to || !subject || (!text && !html)) {
                  return res.status(400).json({
                        success: false,
                        error: 'Email recipient, subject, and content are required'
                  });
            }

            const result = await sendEmailNotification(to, subject, text, html);

            if (result.success) {
                  res.status(200).json(result);
            } else {
                  res.status(500).json(result);
            }
      } catch (error) {
            res.status(500).json({
                  success: false,
                  error: error.message
            });
      }
};