from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from database import (
    add_expense,
    delete_expense,
    get_all_expenses,
    get_budget,
    get_category_totals,
    get_monthly_totals,
    save_budget,
)
from model import get_savings_tips, predict_next_month
from schemas import Expense, ExpenseUpdate

app = FastAPI(title="FishBank API", version="1.0.0")  # creates actual server

# ── Allow React to talk to FastAPI ──
app.add_middleware(
    CORSMiddleware,  # CORS allows react to talk to front end since they both are running on different ports they an communicate but if CORS is allowing them they can communicate
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Budget input model ──
class BudgetInput(BaseModel):
    budget: float  # expects a number like 2500.0


# ── Root ──
@app.get("/")  # checks if server is running
def root():
    return {"message": "Finwise API is running!"}


# HTTP methods (get, post, delete)


# ── Get all expenses ──
@app.get("/expenses")  # get - fetch data
def read_expenses():
    return get_all_expenses()


# ── Add new expense ──
@app.post("/expenses")  # post send new data
def create_expense(expense: Expense):
    return add_expense(expense.model_dump())


# ── Delete expense ──
@app.delete("/expenses/{expense_id}")  # removes something
def remove_expense(expense_id: int):
    return delete_expense(expense_id)


# ── Get category totals ──
@app.get("/expenses/categories")
def category_totals():
    return get_category_totals()


# ── Get monthly totals ──
@app.get("/expenses/monthly")
def monthly_totals():
    return get_monthly_totals()


# ── AI prediction ──
@app.get("/predict")
def predict():
    return predict_next_month()


# ── AI savings tips ──
@app.get("/insights")
def insights():
    totals = get_category_totals()
    tips = get_savings_tips(totals)
    return {"tips": tips}


# ── Get current budget ──
@app.get("/budget")  # get - fetch saved budget
def read_budget():
    return get_budget()


# ── Save new budget ──
@app.post("/budget")  # post - user sets a new budget amount
def update_budget(data: BudgetInput):
    return save_budget(data.budget)
