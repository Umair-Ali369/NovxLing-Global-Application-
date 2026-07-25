import os
from datetime import datetime, timedelta
import bcrypt
from warnings import deprecated
from dotenv import load_dotenv
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import getDB
from app.models import UserDB

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTS = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTS", 30))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 7))

# Handles bcrypt hashing so we never store plain text passwords
pwd_context = CryptContext(schemes = ["bcrypt"], deprecated = "auto")

# Tells FastAPI's docs page where to send login requests for the "Authorize" button
oauth2_scheme = OAuth2PasswordBearer(tokenUrl = "/login")

def hashPassword(password : str) -> str:
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_bytes = bcrypt.hashpw(password_bytes, salt)
    return hashed_bytes.decode('utf-8')


## verify password 
def verifyPassword(plain : str, hashed : str) -> bool:
     return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))

# CREATE ACCESS TOKEN
def createAccessToken(data : dict) -> str:
    toEncode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes = ACCESS_TOKEN_EXPIRE_MINUTS)
    toEncode.update({"exp" : expire})
    return jwt.encode(toEncode, SECRET_KEY, algorithm = ALGORITHM)

# CREATE REFRESH TOKEN
def createRefrehToken(data : dict) -> str:
    toEncode = data.copy()
    expire = datetime.utcnow()  + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    toEncode.update({"exp" : expire, "type" : "refresh"})
    return jwt.encode(toEncode, SECRET_KEY, algorithm=ALGORITHM)

# VERIFY REFRESH TOKEN
def verifyRefreshToken(token : str) -> dict:
    credentialsException = HTTPException(
        status_code = status.HTTP_401_UNAUTHORIZED,
        detail = "Invalid Or Expire Tokne",
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") !=  "refresh":
            raise credentialsException
        return payload
    except JWTError:
        raise credentialsException

# GET CURRENT USER
def getCurrentUser(
    token : str = Depends(oauth2_scheme),
    db : Session = Depends(getDB)
) -> UserDB:
    credentialsException = HTTPException(
        status_code = status.HTTP_401_UNAUTHORIZED,
        detail = "Invalid Or Expire Tokne",
        headers = {"WWW-Authenticate" : "Bearer"}
    )
    try:
        payLoad = jwt.decode(token, SECRET_KEY , algorithms = [ALGORITHM])
        userId = payLoad.get("user_id")
        if userId is None:
            raise credentialsException
    except JWTError:
        raise credentialsException
    
    user = db.query(UserDB).filter(UserDB.id == userId).first()
    if user is None:
        raise credentialsException
    return user




