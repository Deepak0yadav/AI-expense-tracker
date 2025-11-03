import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
const allowed = ["Food", "Travel", "Shopping", "Bills", "Investments", "Other"];

function normalizeCategory(raw = "") {
  const c = String(raw).trim().toLowerCase();
  if (!c) return "Other";
  if (/food|restaurant|dining|eat|cafe/.test(c)) return "Food";
  if (/travel|transport|uber|ola|flight|train|bus|hotel|taxi|fuel|petrol|diesel/.test(c)) return "Travel";
  if (/shop|shopping|purchase|store|mall|amazon|flipkart|myntra/.test(c)) return "Shopping";
  if (/bill|bills|electricity|water|dth|recharge|rent|emi|utility/.test(c)) return "Bills";
  if (/invest|investment|investments|mutual|sip|stock|equity|dividend|interest/.test(c)) return "Investments";
  if (/other|misc|general/.test(c)) return "Other";
  return "Other";
}

function heuristicCategorize(merchant = "", description = "") {
  const text = `${merchant} ${description}`.toLowerCase();
  if (/(zomato|swiggy|restaurant|food|cafe|domino|pizza|burger)/.test(text)) return { category: "Food", confidence: 70 };
  if (/(uber|ola|fuel|petrol|diesel|flight|train|hotel|travel|bus|cab|taxi)/.test(text)) return { category: "Travel", confidence: 70 };
  if (/(amazon|flipkart|myntra|shopping|store|mall|purchase)/.test(text)) return { category: "Shopping", confidence: 65 };
  if (/(bill|electricity|water|dth|recharge|rent|emi)/.test(text)) return { category: "Bills", confidence: 65 };
  if (/(dividend|interest|investment|mutual fund|sip|stocks?)/.test(text)) return { category: "Investments", confidence: 60 };
  return { category: "Other", confidence: 50 };
}

export const categorizeTransaction = async (merchant, description) => {
  // 1) Heuristic first
  const heuristic = heuristicCategorize(merchant, description);
  try {
    console.log('categorize: heuristic', { category: heuristic.category, confidence: heuristic.confidence });
  } catch {}
  if (heuristic.category !== "Other") return heuristic;

  // 2) If heuristic is Other and AI is available, try AI
  if (!genAI) return heuristic;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
        Classify the following transaction into one of the categories:
        Food, Travel, Shopping, Bills, Investments, Other.

        Transaction: ${description}
        Merchant: ${merchant}
        Only return the category name, nothing else.
        `;

    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();
    const category = normalizeCategory(raw);
    try {
      console.log('categorize: ai', { raw, category });
    } catch {}
    return { category, confidence: 80 };
  } catch (err) {
    try {
      console.log('categorize: ai_error', { message: err?.message || String(err) });
    } catch {}
    return heuristic;
  }
};

