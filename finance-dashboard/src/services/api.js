// bridge between react front end and fastapi backend

import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000",
});

// ── Expenses ──
export const getExpenses = () => API.get("/expenses");
export const addExpense = (expense) => API.post("/expenses", expense);
export const deleteExpense = (id) => API.delete(`/expenses/${id}`);

// ── Charts data ──
export const getCategoryTotals = () => API.get("/expenses/categories");
export const getMonthlyTotals = () => API.get("/expenses/monthly");

// ── AI ──
export const getPrediction = () => API.get("/predict");
export const getInsights = () => API.get("/insights");

// ── Budget ──
export const getBudget = () => API.get("/budget");
export const updateBudget = (amount) => API.post("/budget", { budget: amount });
