import React from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Overview from "./pages/Overview";
import Expenses from "./pages/Expenses";
import Insights from "./pages/Insights";
import { useTheme } from "./context/ThemeContext";
import "./App.css";

import {
  FiMoon,
  FiSun,
  FiGrid,
  FiFileText,
  FiTrendingUp,
} from "react-icons/fi";

function App() {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <BrowserRouter>
      <div className={`app-container ${darkMode ? "dark" : ""}`}>
        <nav className="navbar">
          {/* Logo */}
          <div className="nav-logo">FishBank</div>

          {/* Nav Links with icons */}
          <div className="nav-links">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <FiGrid size={15} /> Overview
            </NavLink>
            <NavLink
              to="/expenses"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <FiFileText size={15} /> Expenses
            </NavLink>
            <NavLink
              to="/insights"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <FiTrendingUp size={15} /> Insights
            </NavLink>
          </div>

          <button className="theme-toggle" onClick={toggleDarkMode}>
            {darkMode ? <FiSun size={15} /> : <FiMoon size={15} />}
            {darkMode ? "Light" : "Dark"}
          </button>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/insights" element={<Insights />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
