# FishBank - Full Stack Personal Finance Dashboard with Predictive Analytics



FishBank is a local, full-stack personal finance application. It combines a React frontend with a Python FastAPI backend to help users log their expenses, track their spending against a set budget, view breakdowns, and get predictive insights about future spending.

This project is structured as a dual-component repository containing:
1. A Python backend (`finance-backend`) that uses Pandas for flat-file persistence and Scikit-Learn for linear regression analysis.
2. A React frontend (`finance-dashboard`) that handles user interaction and displays interactive SVG charts using Recharts.

---

## System Architecture

The project operates under a client-server model running entirely on the user's local machine:

```
[React Frontend] (Port 3000)
       │
       ▼ (HTTP REST API / CORS)
[FastAPI Backend] (Port 8000)
   ├── [database.py] ──> Read/Write ──> [data/expenses.csv] & [data/budget.json]
   └── [model.py]    ──> Analytics  ──> [Scikit-Learn Linear Regression & Tips]
```

### Component Details
* **Frontend**: Built using React, React Router for page-level navigation, Axios for HTTP requests, and Recharts for data visualization.
* **Backend**: Powered by FastAPI. It handles JSON serialization, request validation using Pydantic schemas, database operations using Pandas, and analytics modeling using Scikit-Learn.
* **Data Storage**: Uses local flat-files rather than an SQL server. Transactions are stored in a CSV file (`data/expenses.csv`), and the monthly budget is stored in a JSON file (`data/budget.json`).

---

## Features

* **Transaction Logging**: Full CRUD operations to log description, category, amount, and date.
* **Global Budget Tracking**: Set a target monthly budget and see remaining funds.
* **Interactive Charts**: Responsive line, bar, and donut charts showing monthly spending trends and category distributions.
* **AI-Powered Predictions**: Uses a machine learning model to project next month's total spending based on historical data.
* **Savings Recommendations**: Evaluates spending per category against healthy threshold limits and provides actionable advice.
* **Responsive Styling**: Supports light and dark mode toggling, handled via React Context.

---

## Installation and Local Setup

Follow these steps to run the application on your local machine.

### 1. Prerequisites
* Python 3.8 or higher
* Node.js (v16 or higher recommended) and npm

### 2. Backend Setup
Navigate to the backend directory and set up a virtual environment:

```bash
cd finance-backend
```

Create a virtual environment:
```bash
python -m venv venv
```

Activate the virtual environment:
* **Linux/macOS**:
  ```bash
  source venv/bin/activate
  ```
* **Windows**:
  ```bash
  venv\Scripts\activate
  ```

Install the backend dependencies:
```bash
pip install -r requirements.txt
```

**Important Setup Step**: Create a directory named `data` inside the `finance-backend` folder. This is required because the backend writes to `data/expenses.csv` and will crash on startup if the directory does not exist:
```bash
mkdir data
```

Start the FastAPI backend server:
```bash
uvicorn main:app --reload
```
The backend API will now be running at `http://localhost:8000`. You can view the automatically generated interactive API documentation at `http://localhost:8000/docs`.

### 3. Frontend Setup
Open a new terminal window or tab, navigate to the frontend directory, and install dependencies:

```bash
cd finance-dashboard
npm install
```

Start the React development server:
```bash
npm start
```
The React frontend will compile and launch in your default web browser at `http://localhost:3000`.

---

## Data Layer and Storage Files

FishBank uses flat-file storage to keep setup simple and avoid the overhead of setting up a SQL server.

### Expenses Database (`data/expenses.csv`)
This file is generated automatically when you save your first transaction. It contains the following columns:
* `id`: A unique, auto-incrementing integer identifier.
* `name`: The description of the expense.
* `category`: The category (Food, Transport, Shopping, Health, Other).
* `amount`: The spending amount as a float.
* `date`: The transaction date in `YYYY-MM-DD` format.

### Budget Store (`data/budget.json`)
Saves your monthly budget target. If this file does not exist, the system defaults to a budget of 2500.0.
* Format: `{"budget": 2500.0}`

---

## Analytics and Machine Learning Details

### Spending Prediction Model
The next-month forecast is generated inside `model.py` using Scikit-Learn's `LinearRegression` model:
1. The backend reads the transaction CSV and extracts the date column.
2. It groups expenses by their month number (e.g. 1 for January, 12 for December) and calculates the sum of spending for each month.
3. The model is trained using the month number as the independent feature ($X$) and the total monthly spending as the target variable ($y$).
4. The model predicts the spending for the next month index ($max\_month + 1$). If the index exceeds 12, it wraps back to 1.

### Savings Recommendations
Category insights compare the user's monthly spending totals against hardcoded target thresholds:
* **Food**: 400
* **Transport**: 250
* **Shopping**: 300
* **Health**: 200
* **Other**: 150

If category spending exceeds the threshold, the backend generates an warning status indicating how much the user overspent, projects the annual cost at the current rate (monthly spending multiplied by 12), and suggests category-specific advice (e.g. meal prepping for Food, capping shopping budgets). If the user is under the threshold, it displays a success message showing their potential yearly savings.

---

## API Documentation

The backend exposes the following REST endpoints:

### Expenses Endpoints
* **`GET /expenses`**: Returns all recorded expenses.
* **`POST /expenses`**: Adds a new expense. Expects a JSON body matching the `Expense` schema.
* **`DELETE /expenses/{expense_id}`**: Deletes an expense by its ID.
* **`GET /expenses/categories`**: Returns total spending aggregated by category.
* **`GET /expenses/monthly`**: Returns monthly spending totals sorted by year and month.

### Budget Endpoints
* **`GET /budget`**: Fetches the currently set monthly budget.
* **`POST /budget`**: Updates the monthly budget. Expects a JSON body with the updated amount.

### Analytics Endpoints
* **`GET /predict`**: Runs the linear regression model and returns the forecast amount and confidence score.
* **`GET /insights`**: Generates savings recommendations and comparisons against budget thresholds.

---

## Running Tests

The backend includes integration tests written with Pytest.

To run the backend tests:
1. Ensure your virtual environment is active in the `finance-backend` folder.
2. Ensure you have pytest installed (you can install it via `pip install pytest`).
3. Run the following command:
   ```bash
   pytest
   ```
This will run the test cases in `test_main.py` which validate endpoint responses, data formats, schema validation, and calculations.

---

## Project Structure

```
fishbank/
├── finance-backend/             # Python FastAPI backend
│   ├── data/                    # Generated data files (CSV & JSON)
│   ├── services/src/api.js      # Duplicate API service file (safe to ignore)
│   ├── database.py              # CRUD functions and database initialization
│   ├── main.py                  # API endpoints and CORS configuration
│   ├── model.py                 # Linear regression model and advice logic
│   ├── requirements.txt         # Backend Python dependencies
│   ├── schemas.py               # Pydantic schemas for data validation
│   └── test_main.py             # Integration test suite
│
├── finance-dashboard/           # React frontend
│   ├── public/                  # Static assets and index.html
│   ├── src/                     # React application source code
│   │   ├── components/          # Reusable UI components (MetricCard.jsx)
│   │   ├── context/             # React Context for theme management (dark mode)
│   │   ├── data/                # Configuration and static styling defaults
│   │   ├── pages/               # Main pages (Overview, Expenses, Insights)
│   │   ├── services/            # Axios API helper (api.js)
│   │   ├── App.css              # Main layout stylesheet
│   │   ├── App.js               # Route configuration and navigation layouts
│   │   └── index.js             # Renders application to DOM
│   ├── package.json             # Frontend dependencies and scripts
│   └── README.md                # Create React App boilerplate instructions
└── README.md                    # Root project documentation (this file)
```
