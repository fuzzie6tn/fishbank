import pytest
from fastapi.testclient import TestClient

from main import app

# Fake broweser that sends req to our api without needing a real server
client = TestClient(app)


# root test
def test_root():
    # checkin if server is alive and responding
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Finwise API is running!"}


# expense test
def test_get_expenses():
    # checking if we can fetch all expenses without crashing
    response = client.get("/expenses")
    assert response.status_code == 200
    assert isinstance(response.json(), list)  # return karega list


def test_add_expense():
    # check if adding a new expense works correctly
    new_expense = {
        "name": "Test Coffee",
        "category": "Food",
        "amount": 5.99,
        "date": "2025-06-01",
    }
    response = client.post("/expenses", json=new_expense)
    assert response.status_code == 200

    data = response.json()
    assert data["name"] == "Test Coffee"
    assert data["category"] == "Food"
    assert data["amount"] == 5.99
    assert data["date"] == "2025-06-01"
    assert "id" in data


def test_add_expense_missing_fields():
    bad_expense = {"name": "Missing Amount", "category": "Food", "date": "2025-06-01"}

    response = client.post("/expenses", json=bad_expense)
    assert response.status_code == 422  # validation error


def test_delete_expense():
    # first add expense then delete it
    # to make sure it is actually gone

    # 1. add test expense
    new_expense = {
        "name": "Expense to delete",
        "category": "Other",
        "amount": 10.00,
        "date": "2025-06-01",
    }

    add_response = client.post("/expenses", json=new_expense)
    expense_id = add_response.json()["id"]

    # 2. delete it
    del_response = client.delete(f"/expenses/{expense_id}")
    assert del_response.status_code == 200
    assert del_response.json() == {"message": "Deleted successfully"}

    # 3. check it if it is acutally deleted
    all_expenses = client.get(f"/expenses").json()
    ids = [e["id"] for e in all_expenses]
    assert expense_id not in ids


# cateogry test
def test_get_category_totals():
    # check if category totals return correctly
    response = client.get("/expenses/categories")
    assert response.status_code == 200
    assert isinstance(response.json(), dict)  # should be a dict like {Food: 500}


def test_category_totals_are_positive():
    # all category totals should be positive numbers
    # you can't spend negative money!
    response = client.get("/expenses/categories")
    totals = response.json()
    for category, amount in totals.items():
        assert amount >= 0  # no negative spending


# montly test


def test_get_monthly_totals():
    # check if monthly totals return correctly
    response = client.get("/expenses/monthly")
    assert response.status_code == 200
    assert isinstance(response.json(), list)  # should be a list


def test_monthly_totals_have_correct_keys():
    # each monthly record should have year, month and amount
    response = client.get("/expenses/monthly")
    data = response.json()
    if len(data) > 0:  # only check if we have data
        first = data[0]
        assert "year" in first  # has year
        assert "month" in first  # has month name
        assert "amount" in first  # has amount


# budget test
def test_get_budget():
    # check if we can read the budget
    response = client.get("/budget")
    assert response.status_code == 200
    assert "budget" in response.json()  # should have budget key


def test_update_budget():
    # check if setting a new budget works
    response = client.post("/budget", json={"budget": 3000.00})
    assert response.status_code == 200
    assert response.json()["budget"] == 3000.00  # saved correctly


def test_budget_is_positive():
    # budget should always be a positive number
    response = client.get("/budget")
    budget = response.json()["budget"]
    assert budget > 0  # budget must be


# ai prediction test
def test_predict():
    # check if prediction endpoint responds
    response = client.get("/predict")
    assert response.status_code == 200
    data = response.json()
    assert "predicted_amount" in data  # has a prediction value
    assert "message" in data  # has a message
    assert "confidence" in data  # has confidence level


def test_prediction_is_not_negative():
    # predicted spending can never be negative
    response = client.get("/predict")
    amount = response.json()["predicted_amount"]
    assert amount >= 0  # prediction must be 0 or positive


# insight test
def test_get_insights():
    # check if insights endpoint responds
    response = client.get("/insights")
    assert response.status_code == 200
    assert "tips" in response.json()  # should have tips key


def test_insights_tips_structure():
    # each tip should have the right fields
    response = client.get("/insights")
    tips = response.json()["tips"]
    if len(tips) > 0:  # only check if we have tips
        tip = tips[0]
        assert "category" in tip
        assert "total" in tip
        assert "message" in tip
        assert "overspent" in tip
        assert "yearly_projection" in tip
        assert "potential_savings" in tip
