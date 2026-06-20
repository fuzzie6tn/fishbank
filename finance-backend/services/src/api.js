// this service file in react will talk to fast api
import axios from "axios"; // js library that makes http request - bridge between web app and server allowing to fetch, send, delete data

const API = axios.create({
  baseURL: 'http"//localhost:8000', // backend url saved once no need to repeat this again and again
});

// Expenses
export const getExpenses = () => API.get("/expenses"); // calls specific backend tools
export const addExpense = (expense) => API.post("/expenses", expense);
export const deleteExpense = (id) => API.delete(`/expenses/${id}`);

// Charts data ──
export const getCategoryTotals = () => API.get("/expenses/categories");
export const getMonthlyTotals = () => API.get("/expenses/monthly");

// AI
export const getPrediction = () => API.get("/predict");
export const getInsights = () => API.get("/insights");
