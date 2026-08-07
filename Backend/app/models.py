from enum import unique
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from datetime import datetime
from app.database import Base

## USRE MODEL
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


## CONVERSATION MODEL
class ConversationDB(Base):
    __tablename__ = "Conversations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    participant_one_id = Column(Integer, ForeignKey("Users.id"), nullable = False )
    participant_two_id = Column(Integer, ForeignKey("Users.id"), nullable = False )
    created_at = Column(DateTime, default = datetime.utcnow)

## MESSAGES MODEL
class MessageDB(Base):
    __tablename__ = "Messages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    conversation_id = Column(Integer, ForeignKey("Conversations.id"), nullable = False )
    sender_id = Column(Integer, ForeignKey("Users.id"), nullable = False )
    content = Column(String, nullable = False)
    translated = Column(String, nullable = False )
    source_lang = Column(String, nullable = False )
    target_lang = Column(String, nullable = False )
    created_at = Column(DateTime, default = datetime.utcnow)