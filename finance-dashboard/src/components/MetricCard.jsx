import React from "react";
import { useTheme } from "../context/ThemeContext";

function MetricCard({ label, value, sub, subColor }) {
  const { darkMode } = useTheme();

  // Detect if this card is showing bad/good status
  const isNegative = typeof value === "string" && value.startsWith("-$");

  return (
    <div
      style={{
        background: darkMode ? "#1a1d27" : "#ffffff",
        borderRadius: "12px",
        padding: "20px",
        border: darkMode ? "1px solid #2a2d3a" : "1px solid #e8ecf0",
        borderLeft: isNegative ? "4px solid #A32D2D" : "4px solid #1D9E75",
        flex: 1,
        transition: "background 0.3s",
      }}
    >
      <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "8px" }}>
        {label}
      </p>
      <p
        style={{
          fontSize: "24px",
          fontWeight: "600",
          color: darkMode ? "#e8eaf0" : "#1a1a2e",
        }}
      >
        {value}
      </p>
      <p
        style={{
          fontSize: "12px",
          marginTop: "6px",
          color: subColor || "#6b7280",
        }}
      >
        {sub}
      </p>
    </div>
  );
}

export default MetricCard;
