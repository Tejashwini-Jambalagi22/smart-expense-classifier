from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from .database import get_db
from . import models

# SECRET KEY (change to anything you want)
SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing method
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 token login URL
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


# HASH PASSWORD
def get_password_hash(password):
    return pwd_context.hash(password)


# VERIFY PASSWORD
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


# CHECK USER + PASSWORD
def authenticate_user(db: Session, username_or_email: str, password: str):
    user = db.query(models.User).filter(
        (models.User.username == username_or_email) |
        (models.User.email == username_or_email)
    ).first()

    if not user:
        return None

    if not verify_password(password, user.password):
        return None

    return user


# CREATE JWT TOKEN
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()

    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    to_encode.update({"exp": expire})

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# GET USER FROM TOKEN
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")

        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    # Find user in DB
    user = db.query(models.User).filter(models.User.username == username).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user
