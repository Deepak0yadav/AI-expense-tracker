import TransactionModel from "../models/TransactionModel.js";
import { categorizeTransaction } from "../utils/categorization.js";
import { sendEmailNotification } from "../utils/emailNotification.js";

export const createTransaction = async (req, res) => {
      try {
            const { amount, merchant, description, mode, email } = req.body;
            const { category, confidence } = await categorizeTransaction(merchant, description);

            const transaction = new TransactionModel({
                  amount,
                  merchant,
                  description,
                  mode,
                  category,
                  confidence,
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
            `;

                  await sendEmailNotification(email, subject, null, html);
            }

            res.json({ success: true, transaction });
      } catch (err) {
            res.status(500).json({ error: err.message });
      }
};


