from pydantic import BaseModel, EmailStr

class RegisterUser(BaseModel):
    name : str
    email : EmailStr
    password : str
    language : str = "en"
    age : int | None = None

class UserReponse(BaseModel):
    id : int
    name : str
    email : str
    language : str
    is_premium : bool
    
    class Confiq:
        from_attributes = True
