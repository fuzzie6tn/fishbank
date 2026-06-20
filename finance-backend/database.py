import json
import os

import pandas as pd

CSV_PATH = "data/expenses.csv"
BUDGET_PATH = "data/budget.json"


# ── Create CSV if it doesn't exist ──
def init_db():  # Set up the file once, and never touch it again if it's already there. we will use this further
    if not os.path.exists(CSV_PATH):
        df = pd.DataFrame(
            columns=["id", "name", "category", "amount", "date"]
        )  # makes an empty table with cols id name etc
        df.to_csv(
            CSV_PATH, index=False
        )  # converts it into csv file - index=False says dont add extra column into that ok because we have our own id col


# ── Get all expenses ──
def get_all_expenses():  # hand back the data as a clean list of expenses.
    init_db()  # make sure the file exists beforing reading it
    df = pd.read_csv(CSV_PATH)
    return df.to_dict(
        orient="records"
    )  # shape of the dict is oreint AKA - each row becomes one dictionary.


# ── Add new expense ──
def add_expense(
    expense: dict,
):  # whatever passing to this function will always be a dict
    init_db()
    df = pd.read_csv(CSV_PATH)

    # Auto generate ID - instead of max+1 we find the highest existing id
    # and add 1 to it. if file is empty we start from 1.
    # why not max+1 directly? because if you delete row 3 from [1,2,3,4]
    # max is now 4, so next id is 5. no duplicates ever. ✅
    if not df.empty and "id" in df.columns:
        existing_ids = df["id"].dropna().astype(int).tolist()
        new_id = max(existing_ids) + 1
    else:
        new_id = 1

    expense["id"] = new_id  # every expenses has their own id
    new_row = pd.DataFrame([expense])
    df = pd.concat(
        [df, new_row], ignore_index=True
    )  # ignore_index=True - forget the old row numbers, just count fresh from 0.
    df.to_csv(CSV_PATH, index=False)
    return expense


# ── Delete expense by ID ──
def delete_expense(expense_id: int):
    init_db()
    df = pd.read_csv(CSV_PATH)
    df = df[df["id"] != expense_id]
    df.to_csv(CSV_PATH, index=False)
    return {"message": "Deleted successfully"}


# ── Get category totals ──
def get_category_totals():
    init_db()
    df = pd.read_csv(CSV_PATH)
    if df.empty:  # if no expense then return nothing means dont do any math
        return {}
    totals = df.groupby(
        "category"
    )[
        "amount"
    ].sum()  # group it by category - then check their amount - sum their total like food = 900, transport = 1000
    return totals.to_dict()


# ── Get monthly totals ──
def get_monthly_totals():
    init_db()
    df = pd.read_csv(CSV_PATH)
    if df.empty:
        return []
    df["date"] = pd.to_datetime(df["date"])
    df["year"] = df["date"].dt.year  # extract year as number 2025, 2026
    df["month_num"] = df["date"].dt.month  # 1, 2, 3... for sorting
    df["month"] = df["date"].dt.strftime("%b")  # Jan Feb Mar short names

    totals = df.groupby(["year", "month", "month_num"])["amount"].sum().reset_index()
    totals = totals.sort_values(["year", "month_num"])  # sort by year then month
    totals = totals.drop(columns=["month_num"])  # remove helper col
    totals.columns = ["year", "month", "amount"]

    return totals.to_dict(orient="records")


# ── Get budget ──
def get_budget():
    # if no budget file exists yet, return default $2500
    # its like saying "if you never set a budget, start with 2500"
    if not os.path.exists(BUDGET_PATH):
        return {"budget": 2500}
    with open(BUDGET_PATH, "r") as f:
        return json.load(f)  # read the json file and return it as a dict


# ── Save budget ──
def save_budget(amount: float):
    # json.dump converts python dict → json text and writes it to the file
    # opposite of json.load which reads json → python dict
    with open(BUDGET_PATH, "w") as f:
        json.dump({"budget": amount}, f)
    return {"budget": amount}
