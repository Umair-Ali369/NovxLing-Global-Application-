from enum import unique
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime
from app.database import Base

class UserDB(Base):
    __tablename__ = "Users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable = False)
    email = Column(String, nullable = False, unique = True , index = True)
    passwordHash = Column(String, nullable = False)
    language = Column(String, nullable = False, default = "en")
    age = Column(Integer, nullable = True)
    is_premium = Column(Boolean, nullable = False , default = False)
    created_at = Column(DateTime, default = datetime.utcnow)