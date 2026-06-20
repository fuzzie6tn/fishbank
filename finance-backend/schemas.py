from typing import Optional

from pydantic import (
    BaseModel,  # define and validate data structure - auto data validation, auto checks cleans data - shape of your data
)

# rules for your data are schemas


class Expense(BaseModel):  # base model will auto check the data type of the variale
    id: Optional[int] = None
    name: str
    category: str
    amount: float
    date: str


class ExpenseUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    amount: Optional[float] = None
    date: Optional[str] = None
