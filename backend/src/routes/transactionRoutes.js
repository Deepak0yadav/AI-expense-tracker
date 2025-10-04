import express from "express";
import { createTransaction } from "../controllers/transaction.js";
import { getSummary } from "../controllers/summary.js";

const route = express.Router();

route.post("/transaction", createTransaction);

route.get("/summary", getSummary);

// route.get("/transactions", getTransactions);
// route.get("/transactions", getTransactions);


export default route;
