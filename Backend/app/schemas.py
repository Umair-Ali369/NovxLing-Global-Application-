from pydantic import BaseModel, EmailStr

## REGISTER USER
class RegisterUser(BaseModel):
    name : str
    email : EmailStr
    password : str
    language : str = "en"
    age : int | None = None

## PROFILE
class UserReponse(BaseModel):
    id : int
    name : str
    email : str
    language : str
    is_premium : bool
    
    class Confiq:
        from_attributes = True

## CONVERSATIONS
class ConversationCreate(BaseModel) :
    participant_id : int

## MESSAGES
class MessageCreate(BaseModel):
    conversation_id : int
    content : str
