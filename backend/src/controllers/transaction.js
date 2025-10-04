import TransactionModel from "../models/TransactionModel.js";
import { categorizeTransaction } from "../utils/categorization.js";
import { sendEmailNotification } from "../utils/emailNotification.js";

function quickCategorize(amount, merchant = "", description = "") {
      const text = `${merchant} ${description}`.toLowerCase();
      if (amount < 0) {
            if (/\b(zomato|swiggy|restaurant|food|cafe|domino|pizza|burger)\b/.test(text)) return { category: "Food", confidence: 70 };
            if (/\b(uber|ola|fuel|petrol|diesel|flight|train|hotel|travel|bus|cab)\b/.test(text)) return { category: "Travel", confidence: 70 };
            if (/\b(amazon|flipkart|myntra|shopping|store|mall|purchase)\b/.test(text)) return { category: "Shopping", confidence: 65 };
            if (/\b(bill|electricity|water|dth|recharge|rent|emi)\b/.test(text)) return { category: "Bills", confidence: 65 };
      } else {
            if (/\b(salary|credit|refund|payout|reimbursement|income)\b/.test(text)) return { category: "Income", confidence: 70 };
            if (/\b(dividend|interest|investment)\b/.test(text)) return { category: "Investments", confidence: 60 };
      }
      return { category: "Uncategorized", confidence: 50 };
}

export const createTransaction = async (req, res) => {
      try {
            const { amount, merchant, description, mode, email } = req.body;
            const skipAI = String(req.query.skipAI || "").toLowerCase() === "true";

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

            let category, confidence;
            if (skipAI) {
                  ({ category, confidence } = quickCategorize(Number(amount), merchant, description));
            } else {
                  ({ category, confidence } = await categorizeTransaction(merchant, description));
            }

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

            return res.json({
                  success: true,
                  transaction,
                  emailSent: !!email
            });
      } catch (err) {
            console.error('Transaction creation error:', err);
            return res.status(500).json({
                  success: false,
                  error: err.message
            });
      }
};


