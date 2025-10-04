import TransactionModel from "../models/TransactionModel.js";
import { categorizeTransaction } from "../utils/categorization.js";
import { sendEmailNotification } from "../utils/emailNotification.js";

export const createTransaction = async (req, res) => {
      try {
            const { amount, merchant, description, mode, email } = req.body;

            // Validate email if provided
            if (email) {
                  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                  if (!emailRegex.test(email)) {
                        return res.status(400).json({
                              success: false,
                              error: 'Invalid email format'
                        });
                  }
            }

            const { category, confidence } = await categorizeTransaction(merchant, description);

            const transaction = new TransactionModel({
                  amount,
                  merchant,
                  description,
                  mode,
                  category,
                  confidence,
                  email // Store email in the transaction
            });

            await transaction.save();

            // Send email notification if email is provided
            if (email) {
                  const subject = 'New Transaction Alert';
                  const html = `
                        <h2>New Transaction Details</h2>
                        <p><strong>Amount:</strong> ₹${amount}</p>
                        <p><strong>Merchant:</strong> ${merchant}</p>
                        <p><strong>Category:</strong> ${category}</p>
                        <p><strong>Mode:</strong> ${mode}</p>
                        <p><strong>Description:</strong> ${description}</p>
                        <p><small>You're receiving this because you opted for transaction notifications.</small></p>
                  `;

                  try {
                        await sendEmailNotification(email, subject, null, html);
                  } catch (emailError) {
                        console.error('Failed to send email notification:', emailError);
                        // Continue execution even if email fails
                  }
            }

            res.json({
                  success: true,
                  transaction,
                  emailSent: !!email
            });
      } catch (err) {
            console.error('Transaction creation error:', err);
            res.status(500).json({
                  success: false,
                  error: err.message
            });
      }
};


