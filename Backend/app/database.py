import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Load variables from .env into the environment
load_dotenv()

DATABASEurl = os.getenv("DATABASE_URL")

# engine = the actual connection to PostgreSQL
engine = create_engine(DATABASEurl)

# SessionLocal = a factory that creates new "conversations" with the DB
# Each API request gets its own session, used, then closed
SessionLocal = sessionmaker(autocommit = False, autoflush = False, bind = engine)

# Base = the parent class every table model will inherit from
Base = declarative_base()

def getDB():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()