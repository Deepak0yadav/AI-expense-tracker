import Transaction from "../models/TransactionModel.js";

export const getSummary = async (req, res) => {
  try {
    const transactions = await Transaction.find();
    const summary = {};
    transactions.forEach((t) => {
      summary[t.category] = (summary[t.category] || 0) + t.amount;
    });
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};