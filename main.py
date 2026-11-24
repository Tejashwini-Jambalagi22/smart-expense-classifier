from fastapi import FastAPI, Depends, HTTPException, Path
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm

from .database import Base, engine, get_db
from . import auth_utils, models, schemas

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5501"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Backend running!"}


# REGISTER
@app.post("/auth/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(
        (models.User.username == user.username) |
        (models.User.email == user.email)
    ).first()

    if db_user:
        raise HTTPException(status_code=400, detail="User already exists")

    hashed_password = auth_utils.get_password_hash(user.password)
    new_user = models.User(
        username=user.username,
        email=user.email,
        password=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


# LOGIN (FIXED)
@app.post("/auth/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = auth_utils.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    access_token = auth_utils.create_access_token(data={"sub": user.username})

    return {"access_token": access_token, "token_type": "bearer"}

# ADD EXPENSE
@app.post("/expenses", response_model=schemas.ExpenseOut)
def add_expense(
    expense: schemas.ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    new_expense = models.Expense(
        **expense.dict(),
        user_id=current_user.id
    )
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return new_expense


# GET EXPENSES
@app.get("/expenses", response_model=list[schemas.ExpenseResponse])
def get_expenses(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    expenses = db.query(models.Expense).filter(
        models.Expense.user_id == current_user.id
    ).all()

    return [
        {
            "id": e.id,
            "description": e.description,
            "amount": e.amount,
            "category": e.category,
            "date": e.date.strftime("%Y-%m-%d")
        }
        for e in expenses
    ]


# SUMMARY
@app.get("/summary")
def summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    expenses = db.query(models.Expense).filter(
        models.Expense.user_id == current_user.id
    ).all()

    total = sum(e.amount for e in expenses)
    count = len(expenses)

    categories = {}
    for e in expenses:
        categories[e.category] = categories.get(e.category, 0) + e.amount

    return {"total": total, "count": count, "categories": categories}


# DELETE EXPENSE
@app.delete("/expenses/{expense_id}")
def delete_expense(
    expense_id: int = Path(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    expense = db.query(models.Expense).filter(
        models.Expense.id == expense_id,
        models.Expense.user_id == current_user.id
    ).first()

    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    db.delete(expense)
    db.commit()
    return {"detail": "Expense deleted"}


# EDIT EXPENSE
@app.put("/expenses/{expense_id}", response_model=schemas.ExpenseOut)
def edit_expense(
    expense_id: int,
    expense: schemas.ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    db_expense = db.query(models.Expense).filter(
        models.Expense.id == expense_id,
        models.Expense.user_id == current_user.id
    ).first()

    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    db_expense.description = expense.description
    db_expense.amount = expense.amount
    db_expense.category = expense.category

    db.commit()
    db.refresh(db_expense)
    return db_expense
