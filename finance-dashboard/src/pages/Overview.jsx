import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import {
  getCategoryTotals,
  getMonthlyTotals,
  getPrediction,
  getExpenses,
  getBudget,
  updateBudget,
} from "../services/api";
import { categoryColors } from "../data/expenses";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";
import MetricCard from "../components/MetricCard";
import { FiEdit2, FiCheck, FiX } from "react-icons/fi";

function Overview() {
  const { darkMode } = useTheme();
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);

  // ── Budget state ──
  const [budget, setBudget] = useState(2500);
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState("");

  const textPrimary = darkMode ? "#e8eaf0" : "#1a1a2e";
  const textSecondary = "#6b7280";
  const gridColor = darkMode ? "#2a2d3a" : "#f0f0f0";

  const card = {
    background: darkMode ? "#1a1d27" : "#ffffff",
    border: darkMode ? "1px solid #2a2d3a" : "1px solid #e8ecf0",
    borderRadius: "12px",
    padding: "24px",
    transition: "background 0.3s",
  };

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  async function fetchAllData() {
    try {
      setLoading(true);
      const [expensesRes, categoriesRes, monthlyRes, predictionRes, budgetRes] =
        await Promise.all([
          getExpenses(),
          getCategoryTotals(),
          getMonthlyTotals(),
          getPrediction(),
          getBudget(),
        ]);

      // ── Monthly data ──
      const allMonthly = monthlyRes.data;
      setMonthlyData(allMonthly);

      // ── Extract unique years from data ──
      const years = [...new Set(allMonthly.map((d) => d.year))].sort();
      setAvailableYears(years);

      // ── Default to most recent year ──
      if (years.length > 0) {
        setSelectedYear(years[years.length - 1]);
      }

      const catData = Object.entries(categoriesRes.data).map(
        ([name, value]) => ({
          name,
          value: parseFloat(value.toFixed(2)),
        }),
      );
      setCategoryData(catData);
      setMonthlyData(monthlyRes.data);
      setPrediction(predictionRes.data);
      setBudget(budgetRes.data.budget);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }

  // ── Budget calculations ──
  const remaining = budget - totalSpent;
  const isOver = remaining < 0;
  const isExact = remaining === 0;
  const percentage = Math.min((totalSpent / budget) * 100, 100).toFixed(0);

  // ── Save new budget ──
  async function handleSaveBudget() {
    const newBudget = parseFloat(budgetInput);
    if (!newBudget || newBudget <= 0) {
      alert("Please enter a valid budget amount!");
      return;
    }
    try {
      await updateBudget(newBudget);
      setBudget(newBudget);
      setEditingBudget(false);
      setBudgetInput("");
    } catch (err) {
      console.error("Error saving budget:", err);
    }
  }

  const largestCat = categoryData.reduce(
    (max, c) => (c.value > (max.value || 0) ? c : max),
    {},
  );

  if (loading) {
    return (
      <p
        style={{ color: textSecondary, textAlign: "center", padding: "60px 0" }}
      >
        Loading overview...
      </p>
    );
  }

  // ── Filter monthly data by selected year ──
  const filteredMonthlyData = monthlyData.filter(
    (d) => d.year === selectedYear,
  );

  return (
    <div>
      {/* ── Page Header ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <h2 style={{ fontSize: "22px", fontWeight: "600", color: textPrimary }}>
          Overview
        </h2>

        {/* ── Set Budget Button ── */}
        {editingBudget ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "13px", color: textSecondary }}>
              New budget ($)
            </span>
            <input
              type="number"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              placeholder={`Current: $${budget}`}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: darkMode ? "1px solid #2a2d3a" : "1px solid #e8ecf0",
                background: darkMode ? "#0f1117" : "#f4f6f9",
                color: textPrimary,
                fontSize: "14px",
                fontFamily: "DM Sans, sans-serif",
                width: "140px",
                outline: "none",
              }}
            />
            <button
              onClick={handleSaveBudget}
              style={{
                padding: "8px 14px",
                background: "#1D9E75",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "13px",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              <FiCheck size={14} /> Save
            </button>
            <button
              onClick={() => setEditingBudget(false)}
              style={{
                padding: "8px 14px",
                background: "transparent",
                color: textSecondary,
                border: darkMode ? "1px solid #2a2d3a" : "1px solid #e8ecf0",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "13px",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              <FiX size={14} /> Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setEditingBudget(true);
              setBudgetInput(budget);
            }}
            style={{
              padding: "8px 16px",
              background: "transparent",
              border: darkMode ? "1px solid #2a2d3a" : "1px solid #e8ecf0",
              borderRadius: "8px",
              cursor: "pointer",
              color: textPrimary,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            <FiEdit2 size={14} /> Set Budget (${budget.toLocaleString()})
          </button>
        )}
      </div>

      {/* ── Metric Cards ── */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        <MetricCard
          label="Total Spent"
          value={`$${totalSpent.toFixed(2)}`}
          sub="all time"
          subColor={textSecondary}
        />
        <MetricCard
          label="Budget Remaining"
          value={
            isOver
              ? `-$${Math.abs(remaining).toFixed(2)}`
              : isExact
                ? "$0.00"
                : `$${remaining.toFixed(2)}`
          }
          sub={
            isOver
              ? `⚠️ Over budget by $${Math.abs(remaining).toFixed(2)}`
              : isExact
                ? "⚠️ Budget fully used!"
                : `of $${budget.toLocaleString()} budget`
          }
          subColor={isOver ? "#A32D2D" : isExact ? "#854F0B" : "#0F6E56"}
        />
        <MetricCard
          label="Largest Category"
          value={largestCat.name || "N/A"}
          sub={largestCat.value ? `$${largestCat.value}` : ""}
          subColor={textSecondary}
        />
        <MetricCard
          label="AI Prediction (Next Month)"
          value={prediction ? `$${prediction.predicted_amount}` : "N/A"}
          sub={prediction?.message || ""}
          subColor="#854F0B"
        />
      </div>

      {/* ── Budget Progress Bar ── */}
      <div style={{ ...card, marginBottom: "16px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <span
            style={{ fontSize: "14px", fontWeight: "500", color: textPrimary }}
          >
            Budget Usage
          </span>
          <span
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: isOver ? "#A32D2D" : "#1D9E75",
            }}
          >
            {percentage}% used
          </span>
        </div>

        {/* Progress track */}
        <div
          style={{
            width: "100%",
            height: "10px",
            background: darkMode ? "#2a2d3a" : "#f0f0f0",
            borderRadius: "999px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${percentage}%`,
              height: "100%",
              borderRadius: "999px",
              background: isOver
                ? "#A32D2D"
                : percentage > 80
                  ? "#BA7517"
                  : percentage > 60
                    ? "#EF9F27"
                    : "#1D9E75",
              transition: "width 0.6s ease",
            }}
          />
        </div>

        {/* Labels below bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "8px",
          }}
        >
          <span style={{ fontSize: "12px", color: textSecondary }}>$0</span>
          <span style={{ fontSize: "12px", color: textSecondary }}>
            Spent: ${totalSpent.toFixed(2)}
          </span>
          <span style={{ fontSize: "12px", color: textSecondary }}>
            Budget: ${budget.toLocaleString()}
          </span>
        </div>
      </div>

      {/* ── Charts Row ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginBottom: "16px",
        }}
      >
        {/* Line Chart */}
        <div style={card}>
          {/* ── Chart header with year selector ── */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h3
              style={{
                fontSize: "15px",
                fontWeight: "600",
                color: textPrimary,
              }}
            >
              Monthly Spending Trend
            </h3>

            {/* Year selector */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {/* Left arrow */}
              <button
                onClick={() => {
                  const idx = availableYears.indexOf(selectedYear);
                  if (idx > 0) setSelectedYear(availableYears[idx - 1]);
                }}
                disabled={availableYears.indexOf(selectedYear) === 0}
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "6px",
                  border: darkMode ? "1px solid #2a2d3a" : "1px solid #e8ecf0",
                  background: "transparent",
                  cursor: "pointer",
                  color: textPrimary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: availableYears.indexOf(selectedYear) === 0 ? 0.3 : 1,
                  fontSize: "14px",
                }}
              >
                ‹
              </button>

              {/* Year display */}
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: textPrimary,
                  padding: "4px 12px",
                  borderRadius: "6px",
                  background: darkMode ? "#0f1117" : "#f4f6f9",
                  border: darkMode ? "1px solid #2a2d3a" : "1px solid #e8ecf0",
                  minWidth: "60px",
                  textAlign: "center",
                }}
              >
                {selectedYear}
              </span>

              {/* Right arrow */}
              <button
                onClick={() => {
                  const idx = availableYears.indexOf(selectedYear);
                  if (idx < availableYears.length - 1)
                    setSelectedYear(availableYears[idx + 1]);
                }}
                disabled={
                  availableYears.indexOf(selectedYear) ===
                  availableYears.length - 1
                }
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "6px",
                  border: darkMode ? "1px solid #2a2d3a" : "1px solid #e8ecf0",
                  background: "transparent",
                  cursor: "pointer",
                  color: textPrimary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity:
                    availableYears.indexOf(selectedYear) ===
                    availableYears.length - 1
                      ? 0.3
                      : 1,
                  fontSize: "14px",
                }}
              >
                ›
              </button>
            </div>
          </div>

          {/* Chart */}
          {filteredMonthlyData.length === 0 ? (
            <p
              style={{
                color: textSecondary,
                fontSize: "14px",
                textAlign: "center",
                padding: "40px 0",
              }}
            >
              No data for {selectedYear}
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={filteredMonthlyData}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => [`$${v}`, "Spent"]} />
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#1D9E75"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#1D9E75" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Donut Chart */}
        <div style={card}>
          <h3
            style={{
              fontSize: "15px",
              fontWeight: "600",
              marginBottom: "20px",
              color: textPrimary,
            }}
          >
            Spending by Category
          </h3>
          {categoryData.length === 0 ? (
            <p
              style={{
                color: textSecondary,
                fontSize: "14px",
                textAlign: "center",
                padding: "40px 0",
              }}
            >
              No category data yet
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={categoryColors[entry.name] || "#888"}
                    />
                  ))}
                </Pie>
                <Legend />
                <Tooltip formatter={(v) => [`$${v}`, ""]} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Category Breakdown ── */}
      <div style={card}>
        <h3
          style={{
            fontSize: "15px",
            fontWeight: "600",
            marginBottom: "16px",
            color: textPrimary,
          }}
        >
          Category Breakdown
        </h3>
        {categoryData.map((c) => (
          <div
            key={c.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "12px",
            }}
          >
            <div
              style={{ width: "80px", fontSize: "13px", color: textSecondary }}
            >
              {c.name}
            </div>
            <div
              style={{
                flex: 1,
                height: "8px",
                background: darkMode ? "#2a2d3a" : "#f0f0f0",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${Math.min((c.value / totalSpent) * 100, 100)}%`,
                  height: "100%",
                  background: categoryColors[c.name] || "#888",
                  borderRadius: "4px",
                  transition: "width 0.6s ease",
                }}
              />
            </div>
            <div
              style={{
                width: "60px",
                textAlign: "right",
                fontSize: "13px",
                color: textSecondary,
              }}
            >
              ${c.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Overview;
