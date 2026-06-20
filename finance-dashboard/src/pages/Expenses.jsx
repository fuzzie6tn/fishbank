import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { categoryColors } from "../data/expenses";
import { getExpenses, addExpense, deleteExpense } from "../services/api";
import {
  FiTrash2,
  FiPlus,
  FiX,
  FiCoffee,
  FiTruck,
  FiShoppingBag,
  FiHeart,
  FiMoreHorizontal,
} from "react-icons/fi";

const categoryIcons = {
  Food: <FiCoffee size={17} />,
  Transport: <FiTruck size={17} />,
  Shopping: <FiShoppingBag size={17} />,
  Health: <FiHeart size={17} />,
  Other: <FiMoreHorizontal size={17} />,
};

function Expenses() {
  const { darkMode } = useTheme();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [filterCat, setFilterCat] = useState("All");
  const [searchText, setSearchText] = useState("");

  const card = {
    background: darkMode ? "#1a1d27" : "#ffffff",
    border: darkMode ? "1px solid #2a2d3a" : "1px solid #e8ecf0",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "20px",
    transition: "background 0.3s",
  };

  const inputStyle = {
    padding: "10px 14px",
    borderRadius: "8px",
    border: darkMode ? "1px solid #2a2d3a" : "1px solid #e8ecf0",
    background: darkMode ? "#0f1117" : "#f4f6f9",
    color: darkMode ? "#e8eaf0" : "#1a1a2e",
    fontSize: "14px",
    fontFamily: "DM Sans, sans-serif",
    outline: "none",
    width: "100%",
  };

  const labelStyle = {
    fontSize: "13px",
    color: "#6b7280",
    marginBottom: "6px",
    display: "block",
  };

  const textPrimary = darkMode ? "#e8eaf0" : "#1a1a2e";

  // ── Fetch expenses from FastAPI on load ──
  useEffect(() => {
    fetchExpenses();
  }, []);

  async function fetchExpenses() {
    try {
      setLoading(true);
      const res = await getExpenses();
      setExpenses(res.data);
    } catch (err) {
      console.error("Error fetching expenses:", err);
    } finally {
      setLoading(false);
    }
  }

  // ── Add expense to FastAPI ──
  async function handleAdd() {
    if (!name || !amount || !date) {
      alert("Please fill in all fields!");
      return;
    }
    try {
      const newExpense = { name, category, amount: parseFloat(amount), date };
      const res = await addExpense(newExpense);
      setExpenses([res.data, ...expenses]);
      setName("");
      setAmount("");
      setDate("");
      setCategory("Food");
      setShowForm(false);
    } catch (err) {
      console.error("Error adding expense:", err);
    }
  }

  // ── Delete expense from FastAPI ──
  async function handleDelete(id) {
    try {
      await deleteExpense(id);
      setExpenses(expenses.filter((e) => e.id !== id));
    } catch (err) {
      console.error("Error deleting expense:", err);
    }
  }

  // ── Filter + Search ──
  const filtered = expenses
    .filter((e) => filterCat === "All" || e.category === filterCat)
    .filter((e) => e.name.toLowerCase().includes(searchText.toLowerCase()));

  const total = filtered.reduce((sum, e) => sum + e.amount, 0);

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
          Expenses
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: "10px 20px",
            background: "#1D9E75",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
            fontFamily: "DM Sans, sans-serif",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          {showForm ? (
            <>
              <FiX size={15} /> Cancel
            </>
          ) : (
            <>
              <FiPlus size={15} /> Add Expense
            </>
          )}
        </button>
      </div>

      {/* ── Add Expense Form ── */}
      {showForm && (
        <div style={card}>
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "600",
              marginBottom: "20px",
              color: textPrimary,
            }}
          >
            New Expense
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              marginBottom: "16px",
            }}
          >
            <div>
              <label style={labelStyle}>Description</label>
              <input
                style={inputStyle}
                placeholder="e.g. Grocery run"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>Amount ($)</label>
              <input
                style={inputStyle}
                type="number"
                placeholder="e.g. 50"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select
                style={inputStyle}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option>Food</option>
                <option>Transport</option>
                <option>Shopping</option>
                <option>Health</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Date</label>
              <input
                style={inputStyle}
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
          <button
            onClick={handleAdd}
            style={{
              padding: "10px 24px",
              background: "#1D9E75",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            Save Expense
          </button>
        </div>
      )}

      {/* ── Search + Filter ── */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <input
          style={{ ...inputStyle, width: "250px" }}
          placeholder="Search expenses..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        {["All", "Food", "Transport", "Shopping", "Health", "Other"].map(
          (cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                border: "1px solid",
                borderColor:
                  filterCat === cat
                    ? "#1D9E75"
                    : darkMode
                      ? "#2a2d3a"
                      : "#e8ecf0",
                background: filterCat === cat ? "#1D9E75" : "transparent",
                color:
                  filterCat === cat ? "#fff" : darkMode ? "#9ca3af" : "#6b7280",
                fontSize: "13px",
                cursor: "pointer",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              {cat}
            </button>
          ),
        )}
      </div>

      {/* ── Expense List ── */}
      <div style={card}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h3
            style={{ fontSize: "15px", fontWeight: "600", color: textPrimary }}
          >
            {loading
              ? "Loading..."
              : `${filtered.length} transaction${filtered.length !== 1 ? "s" : ""}`}
          </h3>
          <span
            style={{ fontSize: "15px", fontWeight: "600", color: "#1D9E75" }}
          >
            Total: ${total.toFixed(2)}
          </span>
        </div>

        {/* Loading state */}
        {loading && (
          <p
            style={{
              color: "#6b7280",
              fontSize: "14px",
              textAlign: "center",
              padding: "32px 0",
            }}
          >
            Loading expenses...
          </p>
        )}

        {/* No results */}
        {!loading && filtered.length === 0 && (
          <p
            style={{
              color: "#6b7280",
              fontSize: "14px",
              textAlign: "center",
              padding: "32px 0",
            }}
          >
            No expenses found.
          </p>
        )}

        {/* Expense rows */}
        {!loading &&
          filtered.map((e, index) => (
            <div
              key={e.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "14px 0",
                borderBottom:
                  index < filtered.length - 1
                    ? darkMode
                      ? "1px solid #2a2d3a"
                      : "1px solid #f0f0f0"
                    : "none",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                  background: darkMode ? "#0f1117" : "#f4f6f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: categoryColors[e.category],
                  flexShrink: 0,
                }}
              >
                {categoryIcons[e.category]}
              </div>
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    color: textPrimary,
                  }}
                >
                  {e.name}
                </p>
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: "20px",
                    fontSize: "11px",
                    background: categoryColors[e.category] + "22",
                    color: categoryColors[e.category],
                    fontWeight: "500",
                  }}
                >
                  {e.category}
                </span>
              </div>
              <p style={{ fontSize: "13px", color: "#6b7280" }}>{e.date}</p>
              <p
                style={{
                  fontSize: "15px",
                  fontWeight: "600",
                  color: textPrimary,
                  minWidth: "60px",
                  textAlign: "right",
                }}
              >
                -${e.amount}
              </p>
              <button
                onClick={() => handleDelete(e.id)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#A32D2D",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Expenses;
