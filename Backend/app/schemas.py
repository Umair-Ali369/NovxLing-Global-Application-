from pydantic import BaseModel, ConfigDict, EmailStr

## REGISTER USER
class RegisterUser(BaseModel):
    name : str
    email : EmailStr
    password : str
    language : str = "en"
    age : int | None = None

## PROFILE
class UserReponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id : int
    name : str
    email : str
    language : str
    is_premium : bool

## CONVERSATIONS
class ConversationCreate(BaseModel) :
    participant_id : int

## MESSAGES
class MessageCreate(BaseModel):
    conversation_id : int
    content : str

## LEARNING SESSION
class LearningSessionCreate(BaseModel):
    title : str = "New Session"

## TUTOR
class AskTutorRequest(BaseModel):
    question : str
    depth : str = "simple"
