from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database import getDB, engine, Base
from app.models import UserDB
from app.schemas import RegisterUser, UserReponse
from app.auth import hashPassword, verifyPassword, createAccessToken, getCurrentUser

# Creates tables if they don't exist yet — safe to run every startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title = "NovxLing API ", version = "0.1.0")

# Allows the React frontend (different port) to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"], # frontend URL here
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"]
)


# HOME
@app.get("/")
def home():
    return { "Message" : "NovxLing API is running...", "Version" : "0.1.0"}


# HEALTH CHECK
@app.get("/health")
def healthCheck(db : Session = Depends(getDB)):
    try:
        db.execute(text("SELECT 1"))
        return { "status" : "healthy", "database" : "connected"}
    except Exception as e:
        return {"status" : "unhealthy", "error" : str(e)}

# REGISTER
@app.post("/register")
def register(data : RegisterUser, db : Session = Depends(getDB)):
    existing = db.query(UserDB).filter(UserDB.email == data.email).first()
    if existing:
        raise HTTPException(status_code = 400, detail = "Email already registered!.")

    newUser = UserDB(
        name = data.name,
        email = data.email,
        passwordHash = hashPassword(data.password),
        language = data.language,
        age = data.age
    )

    db.add(newUser)
    db.commit()
    db.refresh(newUser)

    return {
        "name" : newUser.name,
        "email" : newUser.email,
        "language" : newUser.language,
        "age" : newUser.age
    }


# LOGIN
@app.post("/login")
def login(form_data : OAuth2PasswordRequestForm = Depends(), db : Session = Depends(getDB)):
    user = db.query(UserDB).filter(UserDB.email == form_data.username).filter().first()

    if not user or not verifyPassword(form_data.password, user.passwordHash):
        raise HTTPException(status_code = 401, detail = "Incorrect email or password!.")
    
    token = createAccessToken({"user_id" : user.id})

    return {
        "access_token" : token,
        "token_type" : "bearer",
        "user" : {
            "id" : user.id,
            "name" : user.name,
            "language" : user.language
        }
    }


# CURRENT USER
@app.get("/profile", response_model = UserReponse)
def profile(currentUser : UserDB = Depends(getCurrentUser)):
    return currentUser