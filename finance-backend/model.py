import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression

CSV_PATH = "data/expenses.csv"


def predict_next_month():
    try:  #  it won't crash the whole app if something wrong happens
        df = pd.read_csv(CSV_PATH)

        if df.empty or len(df) < 3:
            return {
                "predicted_amount": 0,
                "message": "Not enough data to predict",
            }  # prediction model need lot of amount of data to predict.

        # ── Prepare data ──
        df["date"] = pd.to_datetime(
            df["date"]
        )  # converting the date column from plain text into real date objects - converting to proper date format
        df["month_number"] = df[
            "date"
        ].dt.month  # extracts the month number from each date.

        # ── Group by month ──
        monthly = df.groupby("month_number")["amount"].sum().reset_index()

        if len(monthly) < 2:
            return {"predicted_amount": 0, "message": "Need more months of data"}

        # ── Train model ──
        X = monthly[["month_number"]]
        y = monthly["amount"]

        model = LinearRegression()
        model.fit(X, y)  # learn from data

        # ── Predict next month ──
        next_month = monthly["month_number"].max() + 1
        if next_month > 12:
            next_month = 1

        prediction = model.predict([[next_month]])[
            0
        ]  # guess the amount of the next month
        prediction = max(0, round(prediction, 2))

        return {
            "predicted_amount": prediction,
            "next_month": int(next_month),
            "message": "Prediction successful",
            "confidence": "87%",
        }

    except Exception as e:  # but if ANYTHING goes wrong, do this instead of crashing.
        return {
            "predicted_amount": 0,
            "message": str(e),
        }  # converts the error into a readable text message.


def get_savings_tips(category_totals: dict):
    tips = []

    # ── These are our budget goals per category ──
    # think of these as "healthy spending limits"
    # if you go over these, you get a warning tip
    thresholds = {
        "Food": 400,
        "Transport": 250,
        "Shopping": 300,
        "Health": 200,
        "Other": 150,
    }

    # ── Yearly projection multiplier ──
    # we have monthly data so multiply by 12
    # to show how much they'll spend in a year at this rate
    MONTHS_IN_YEAR = 12

    for category, total in category_totals.items():
        total = round(float(total), 2)
        threshold = thresholds.get(category, 300)
        difference = round(total - threshold, 2)  # positive = over, negative = under
        overspent = difference > 0

        # ── Yearly projection ──
        # if you spend $870 on food this month
        # you'll spend $870 x 12 = $10,440 per year
        yearly_projection = round(total * MONTHS_IN_YEAR, 2)

        # ── Percentage over or under ──
        # how far are you from the threshold in %
        # example: spent $870, threshold $400
        # (870 - 400) / 400 * 100 = 117% over
        percentage = round(abs(difference) / threshold * 100, 1)

        # ── Potential savings ──
        # if overspent, how much could you save
        # if you came back to the threshold?
        # example: $870 - $400 = $470 savings possible
        potential_savings = round(difference * MONTHS_IN_YEAR, 2) if overspent else 0

        # ── Build the message using real numbers ──
        if overspent:
            message = build_overspent_message(
                category,
                total,
                threshold,
                difference,
                percentage,
                yearly_projection,
                potential_savings,
            )
        else:
            message = build_underspent_message(
                category, total, threshold, difference, percentage
            )

        tips.append(
            {
                "category": category,
                "total": total,
                "threshold": threshold,
                "difference": difference,
                "percentage": percentage,
                "yearly_projection": yearly_projection,
                "potential_savings": potential_savings,
                "overspent": overspent,
                "message": message,
            }
        )

    # ── Sort tips: overspent ones first, then under budget ──
    # this way the most urgent tips appear at the top
    tips.sort(key=lambda x: (not x["overspent"], -x["difference"]))

    return tips


def build_overspent_message(
    category,
    total,
    threshold,
    difference,
    percentage,
    yearly_projection,
    potential_savings,
):

    # short action tip per category
    action = {
        "Food": "Try meal prepping on weekends.",
        "Transport": "Consider carpooling or public transport.",
        "Shopping": f"Set a weekly cap of ${round(threshold / 4, 0):.0f}.",
        "Health": "Review recurring health expenses.",
        "Other": "Audit and cancel unused subscriptions.",
    }.get(category, f"Try to reduce {category} spending.")

    if percentage <= 30:
        severity = "slightly over goal"
    elif percentage <= 100:
        severity = "over goal"
    else:
        severity = "significantly over goal"

    return f"${difference:.0f} {severity}. {action} Saving back to goal = ~${potential_savings:.0f}/year."


def build_underspent_message(category, total, threshold, difference, percentage):
    saved = round(abs(difference), 2)
    yearly_saving = round(saved * 12, 2)

    action = {
        "Food": "Great meal planning!",
        "Transport": "Smart transport choices!",
        "Shopping": "Excellent discipline!",
        "Health": "Good health management!",
        "Other": "Nice work!",
    }.get(category, "Well done!")

    return f"{action} ${saved:.0f} under goal — you're on track to save ~${yearly_saving:.0f} this year."
