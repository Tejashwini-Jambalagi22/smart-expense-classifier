from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from . import models, schemas
from .database import get_db
from .auth_utils import get_current_user, User

router = APIRouter()

@router.post("/expenses", response_model=schemas.ExpenseOut)
def create_expense(
    expense: schemas.ExpenseCreate,  # Pydantic model for input
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_expense = models.Expense(**expense.model_dump(), user_id=current_user.id)
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return new_expense
