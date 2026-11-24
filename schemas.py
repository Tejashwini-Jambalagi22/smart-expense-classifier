from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str
    email: str
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True


class ExpenseCreate(BaseModel):
    description: str
    amount: float
    category: str


class ExpenseOut(BaseModel):
    id: int
    description: str
    amount: float
    category: str
    user_id: int

    class Config:
        from_attributes = True


class ExpenseResponse(BaseModel):
    id: int
    description: str
    amount: float
    category: str
    date: str
