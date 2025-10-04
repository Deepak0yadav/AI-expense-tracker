import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const categorizeTransaction = async (merchant, description) => {
  try {
    // Gemini AI categorization
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
        Classify the following transaction into one of the categories:
        Food, Travel, Shopping, Bills, Investments, Other.

        Transaction: ${description}
        Merchant: ${merchant}
        Only return the category name, nothing else.
        `;

    const result = await model.generateContent(prompt);
    const category = result.response.text().trim();

    return { category, confidence: 80 };
  } catch (err) {
    console.error(err);
    return { category: "Uncategorized", confidence: 50 };
  }
};

