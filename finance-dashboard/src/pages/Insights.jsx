import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import {
  getInsights,
  getPrediction,
  getMonthlyTotals,
  getCategoryTotals,
} from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import {
  FiAlertTriangle,
  FiTrendingUp,
  FiDollarSign,
  FiCpu,
  FiCheckCircle,
} from "react-icons/fi";

function Insights() {
  const { darkMode } = useTheme();
  const [tips, setTips] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);

  const textPrimary = darkMode ? "#e8eaf0" : "#1a1a2e";
  const textSecondary = "#6b7280";
  const gridColor = darkMode ? "#2a2d3a" : "#f0f0f0";

  const card = {
    background: darkMode ? "#1a1d27" : "#ffffff",
    border: darkMode ? "1px solid #2a2d3a" : "1px solid #e8ecf0",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "20px",
    transition: "background 0.3s",
  };
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [insightsRes, predictionRes, monthlyRes, categoriesRes] =
        await Promise.all([
          getInsights(),
          getPrediction(),
          getMonthlyTotals(),
          getCategoryTotals(),
        ]);

      setTips(insightsRes.data.tips);
      setPrediction(predictionRes.data);
      // ── Monthly data ──
      const allMonthly = monthlyRes.data;
      setMonthlyData(allMonthly);

      // ── Extract unique years ──
      const years = [...new Set(allMonthly.map((d) => d.year))].sort();
      setAvailableYears(years);

      // ── Default to most recent year ──
      if (years.length > 0) {
        setSelectedYear(years[years.length - 1]);
      }

      const catData = Object.entries(categoriesRes.data).map(
        ([name, value]) => ({
          name,
          amount: parseFloat(value.toFixed(2)),
        }),
      );
      setCategoryData(catData);

      const total = catData.reduce((sum, c) => sum + c.amount, 0);
      setTotalSpent(total);
    } catch (err) {
      console.error("Error fetching insights:", err);
    } finally {
      setLoading(false);
    }
  }

  const avgDaily = totalSpent > 0 ? (totalSpent / 30).toFixed(2) : 0;

  if (loading) {
    return (
      <p
        style={{ color: textSecondary, textAlign: "center", padding: "60px 0" }}
      >
        Loading insights...
      </p>
    );
  }
  // ── Filter by selected year ──
  const filteredMonthlyData = monthlyData.filter(
    (d) => d.year === selectedYear,
  );
  return (
    <div>
      {/* ── Page Title ── */}
      <h2
        style={{
          fontSize: "22px",
          fontWeight: "600",
          color: textPrimary,
          marginBottom: "24px",
        }}
      >
        Insights
      </h2>

      {/* ── Metric Cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {[
          {
            icon: <FiDollarSign size={18} />,
            label: "Avg daily spend",
            value: `$${avgDaily}`,
            sub: "based on all data",
            subColor: textSecondary,
            color: "#1D9E75",
          },
          {
            icon: <FiTrendingUp size={18} />,
            label: "Total expenses",
            value: `$${totalSpent.toFixed(2)}`,
            sub: "all time",
            subColor: textSecondary,
            color: "#378ADD",
          },
          {
            icon: <FiAlertTriangle size={18} />,
            label: "Next month (AI)",
            value: prediction ? `$${prediction.predicted_amount}` : "N/A",
            sub: "predicted spending",
            subColor: "#854F0B",
            color: "#BA7517",
          },
          {
            icon: <FiCpu size={18} />,
            label: "AI confidence",
            value: prediction?.confidence || "N/A",
            sub: "prediction accuracy",
            subColor: textSecondary,
            color: "#7F77DD",
          },
        ].map((m, i) => (
          <div
            key={i}
            style={{
              background: darkMode ? "#1a1d27" : "#ffffff",
              border: darkMode ? "1px solid #2a2d3a" : "1px solid #e8ecf0",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "10px",
              }}
            >
              <span style={{ color: m.color }}>{m.icon}</span>
              <p style={{ fontSize: "13px", color: textSecondary }}>
                {m.label}
              </p>
            </div>
            <p
              style={{
                fontSize: "24px",
                fontWeight: "600",
                color: textPrimary,
              }}
            >
              {m.value}
            </p>
            <p
              style={{ fontSize: "12px", marginTop: "6px", color: m.subColor }}
            >
              {m.sub}
            </p>
          </div>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        {/* Monthly Trend */}
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
        {/* Category Chart */}
        <div style={card}>
          <h3
            style={{
              fontSize: "15px",
              fontWeight: "600",
              color: textPrimary,
              marginBottom: "20px",
            }}
          >
            Spending by Category
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12 }}
                width={70}
              />
              <Tooltip formatter={(v) => [`$${v}`, "Spent"]} />
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <Bar dataKey="amount" fill="#1D9E75" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── AI Tips ── */}
      <div style={card}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "20px",
          }}
        >
          <FiCpu size={18} color="#7F77DD" />
          <h3
            style={{ fontSize: "15px", fontWeight: "600", color: textPrimary }}
          >
            AI Savings Recommendations
          </h3>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}
        >
          {tips.map((tip, i) => {
            const borderColor = !tip.overspent
              ? "#1D9E75"
              : tip.percentage <= 30
                ? "#BA7517"
                : tip.percentage <= 100
                  ? "#A32D2D"
                  : "#7B1515";

            const iconColor = !tip.overspent
              ? "#1D9E75"
              : tip.percentage <= 30
                ? "#BA7517"
                : "#A32D2D";

            return (
              <div
                key={i}
                style={{
                  background: darkMode ? "#0f1117" : "#f4f6f9",
                  borderRadius: "10px",
                  padding: "14px 16px",
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                  border: `1px solid ${borderColor}33`,
                  borderLeft: `3px solid ${borderColor}`,
                }}
              >
                <span
                  style={{ color: iconColor, marginTop: "2px", flexShrink: 0 }}
                >
                  {!tip.overspent ? (
                    <FiCheckCircle size={16} />
                  ) : (
                    <FiAlertTriangle size={16} />
                  )}
                </span>

                <div style={{ flex: 1 }}>
                  {/* ── Top row: category + badges ── */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      marginBottom: "6px",
                      flexWrap: "wrap",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: textPrimary,
                      }}
                    >
                      {tip.category}
                    </p>
                    <span
                      style={{
                        fontSize: "11px",
                        padding: "2px 7px",
                        borderRadius: "20px",
                        background: borderColor + "18",
                        color: borderColor,
                        fontWeight: "500",
                      }}
                    >
                      ${tip.total} spent
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        padding: "2px 7px",
                        borderRadius: "20px",
                        background: tip.overspent ? "#A32D2D18" : "#1D9E7518",
                        color: tip.overspent ? "#A32D2D" : "#1D9E75",
                        fontWeight: "500",
                      }}
                    >
                      {tip.overspent
                        ? `↑ $${tip.difference} over`
                        : `↓ $${Math.abs(tip.difference).toFixed(0)} under`}
                    </span>
                  </div>

                  {/* ── Short message ── */}
                  <p
                    style={{
                      fontSize: "12px",
                      color: textSecondary,
                      lineHeight: "1.5",
                      marginBottom: tip.overspent ? "8px" : "0",
                    }}
                  >
                    {tip.message}
                  </p>

                  {/* ── Yearly projection — only for overspent ── */}
                  {tip.overspent && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          height: "3px",
                          background: darkMode ? "#2a2d3a" : "#e8ecf0",
                          borderRadius: "4px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min(tip.percentage, 100)}%`,
                            height: "100%",
                            background: borderColor,
                            borderRadius: "4px",
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: "11px",
                          color: borderColor,
                          fontWeight: "600",
                          whiteSpace: "nowrap",
                        }}
                      >
                        ${tip.yearly_projection}/yr
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Insights;
