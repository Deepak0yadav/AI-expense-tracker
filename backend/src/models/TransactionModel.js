import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  amount: Number,
  merchant: String,
  category: { type: String, default: "Uncategorized" },
  date: { type: Date, default: Date.now },
  mode: String,
  confidence: Number,
});

export default mongoose.model("Transaction", transactionSchema);