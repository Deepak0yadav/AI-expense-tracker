import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  amount: Number,
  merchant: String,
  category: { type: String, default: "Uncategorized" },
  date: { type: Date, default: Date.now },
  mode: String,
  confidence: Number,
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  description: String
});

export default mongoose.model("Transaction", transactionSchema);