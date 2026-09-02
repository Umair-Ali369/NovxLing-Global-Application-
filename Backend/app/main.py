from fastapi import FastAPI, Depends, HTTPException, Response, Cookie
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database import getDB, engine, Base
from app.models import LearningMessagesDB, LearningSessionDB, UserDB, ConversationDB, MessageDB
from app.schemas import AskTutorRequest, ConversationCreate, LearningSessionCreate, MessageCreate, RegisterUser, UserReponse
from app.auth import (
    hashPassword, verifyPassword, createAccessToken,getCurrentUser
)
from app.Services.translator import TranslateText
from app.Services.ai import AskTutor

# Creates tables if they don't exist yet - safe to run every startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="NovxLing API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# HOME
@app.get("/")
def home():
    return {"Message": "NovxLing API is running...", "Version": "0.2.0"}


# HEALTH CHECK
@app.get("/health")
def healthCheck(db: Session = Depends(getDB)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

# REGISTER 
@app.post("/register")
def register(data: RegisterUser, db: Session = Depends(getDB)):
    existing = db.query(UserDB).filter(UserDB.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered!.")

    newUser = UserDB(
        name=data.name,
        email=data.email,
        passwordHash=hashPassword(data.password),
        language=data.language,
        age=data.age
    )

    db.add(newUser)
    db.commit()
    db.refresh(newUser)

    return {
        "name": newUser.name,
        "email": newUser.email,
        "language": newUser.language,
        "age": newUser.age
    }


# LOGIN
@app.post("/login")
def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(getDB)
):
    user = db.query(UserDB).filter(UserDB.email == form_data.username).first()

    if not user or not verifyPassword(form_data.password, user.passwordHash):
        raise HTTPException(status_code=401, detail="Incorrect email or password!.")

    accessToken = createAccessToken({"user_id": user.id})

    return {
        "access_token": accessToken,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "language": user.language
        }
    }


# REFRESH
# @app.post("/refresh")
# def refreshAccessToken(
#     refresh_token: str | None = Cookie(default=None, alias="refresh_token"),
#     db: Session = Depends(getDB)
# ):
#     if refresh_token is None:
#         raise HTTPException(status_code=401, detail="No refresh token found")

#     payLoad = decodeRefreshToken(refresh_token)
#     userId = payLoad.get("user_id")

#     user = db.query(UserDB).filter(UserDB.id == userId).first()
#     if not user:
#         raise HTTPException(status_code=401, detail="User no longer exists")
#     newAccessToken = createAccessToken({"user_id": user.id})
#     print("refresh_token from cookie:", refresh_token)

#     return {
#         "access_token": newAccessToken,
#         "token_type": "bearer",
#         "user": {
#             "id": user.id,
#             "name": user.name,
#             "language": user.language
#         }
#     }


# lOGOUT
@app.post("/logout")
def logout(response: Response):
 
    return {"message": "Logged out"}


# CURRENT USER
@app.get("/profile", response_model=UserReponse)
def profile(currentUser: UserDB = Depends(getCurrentUser)):
    return currentUser

# CREATE CONVERSATION
@app.post("/conversations")
def createConversations(
    data : ConversationCreate,
    db : Session = Depends(getDB),
    currentUser : UserDB = Depends(getCurrentUser)
):
    otherUser = db.query(UserDB).filter(UserDB.id == data.participant_id).first()
    if not otherUser:
        raise HTTPException(status_code = 404, detail = "User not found.")

    if otherUser.id == currentUser.id:
        raise HTTPException(status_code = 400, detail = "Cannot start conversation with yourself.")

    # CHECK IF A CONVERSATION B/W THEM ALREADY EXIST OR NOT
    exist = db.query(ConversationDB).filter(
        ((ConversationDB.participant_one_id == currentUser.id) & (ConversationDB.participant_two_id == otherUser.id) ) |
        ((ConversationDB.participant_one_id == otherUser.id) & (ConversationDB.participant_two_id == currentUser.id))
    ).first()

    if exist:
        return {
            "id" : exist.id,
            "participant_one_id" : exist.participant_one_id,
            "participant_two_id" : exist.participant_two_id,
            "created_at" : exist.created_at
        }

    newConversation = ConversationDB(
        participant_one_id = currentUser.id,
        participant_two_id = otherUser.id
    )

    db.add(newConversation)
    db.commit()
    db.refresh(newConversation)

    return {
        "id" : newConversation.id,
        "participant_one_id" : newConversation.participant_one_id,
        "participant_two_id" : newConversation.participant_two_id,
        "created_at" : newConversation.created_at
    }

# GET YOUR CONVERSATIONS LIST
@app.get("/conversations")
def getConversations(
    db : Session = Depends(getDB),
    currentUser : UserDB = Depends(getCurrentUser)
):
    conversations = db.query(ConversationDB).filter(
        (ConversationDB.participant_one_id == currentUser.id) |
        (ConversationDB.participant_two_id == currentUser.id)
    ).all()
    
    result = []
    for conv in conversations:
        otherUserId = conv.participant_two_id if conv.participant_one_id == currentUser.id else conv.participant_one_id
        otherUser = db.query(UserDB).filter(UserDB.id == otherUserId).first()

        result.append({
            "id" : conv.id,
            "with_User" : { "id" : otherUser.id, "name" : otherUser.name} if otherUser else None,
            "created_at" : conv.created_at
        })

    return { "Conversations" : result}    


# SEND MESSAGE
@app.post("/messages")
def sendMessage(
    data : MessageCreate,
    db : Session = Depends(getDB),
    currentUser : UserDB = Depends(getCurrentUser)
):
    conversation = db.query(ConversationDB).filter(ConversationDB.id == data.conversation_id).first()
    if not conversation:
        raise HTTPException(status_code = 404, detail = "Conversation Not found")

    if currentUser.id not in (conversation.participant_one_id, conversation.participant_two_id):
        raise HTTPException(status_code = 403, detail = "You are not part of this Conversation.")

    recipientID = conversation.participant_two_id if conversation.participant_one_id == currentUser.id else conversation.participant_one_id    
    recipient = db.query(UserDB).filter(UserDB.id == recipientID).first()

    translatedText = TranslateText(data.content, targetLang = recipient.language, sourceLang = "auto")

    newMessage = MessageDB(
        conversation_id = conversation.id,
        sender_id = currentUser.id,
        content = data.content,
        translated = translatedText,
        source_lang = currentUser.language,
        target_lang = recipient.language,   
    )
    db.add(newMessage)
    db.commit()
    db.refresh(newMessage)

    return {
        "id" : newMessage.id,
        "sender_id" : newMessage.sender_id,
        "content" : newMessage.content,
        "translated" : newMessage.translated,
        "created_at" : newMessage.created_at
    }
    

# GET MESSAGE HISTORY
@app.get("/conversation/{conversation_id}/messages")
def getMessages(
    conversation_id : int,
    db : Session = Depends(getDB),
    currentUser : UserDB = Depends(getCurrentUser)
): 
    conversation = db.query(ConversationDB).filter(ConversationDB.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code = 404 , detail = "Conversation not found")

    if currentUser.id not in (conversation.participant_one_id, conversation.participant_two_id):
        raise HTTPException(status_code = 403, detail = "You are not part of this Conversation.")

    messages = db.query(MessageDB).filter(
        MessageDB.conversation_id == conversation_id
    ).order_by(MessageDB.created_at.asc()).all()

    return {
        "messages" : [
            {
                "id" : m.id,
                "sender_id" : m.sender_id,
                "content" : m.content,
                "translated" : m.translated,
                "created_at" : m.created_at
            }
            for m in messages
        ]
    }

## SEARCH USERES
@app.get("/users/search")
def searchUser(
   query : str = "",
   db : Session = Depends(getDB),
   currentUser : UserDB = Depends(getCurrentUser)
):
   results = db.query(UserDB).filter(
       UserDB.name.ilike(f"%{query}%"),
       UserDB.id != currentUser.id
    ).limit(20).all()

   return {
       "Users" : [
           {"id" : u.id, "name" : u.name, "language" : u.language}
           for u in results 
       ]
    }

## CREATE LEARNING SESSION
@app.post("/learn/session")
def createSession(
    data : LearningSessionCreate,
    db : Session = Depends(getDB),
    currentUser : UserDB = Depends(getCurrentUser)
):
    newSession = LearningSessionDB(
        user_id = currentUser.id,
        title = data.title
    )
    db.add(newSession)
    db.commit()
    db.refresh(newSession)

    return{ 
        "id" : newSession.id,
        "title" : newSession.title,
        "created_at" : newSession.created_at
    }

# LIST OF LEARNING SESSION
@app.get("/learn/sessions")
def getLearningSessions(
    db : Session = Depends(getDB),
    currentUser : UserDB = Depends(getCurrentUser)
):
    Sessions = db.query(LearningSessionDB).filter(
        LearningSessionDB.user_id == currentUser.id
    ).order_by(LearningSessionDB.created_at.desc(1)).all()

    return {
        "sessions" : [
            {"id" : s.id, "title" : s.title, "created_at" : s.created_at}
            for s in Sessions
        ]
    }

# ASK QUESTION FROM TUTOR
@app.post("/learn/sessions/{session_id}/ask")
def askTutor(
    session_id : int,
    data : AskTutorRequest,
    db : Session = Depends(getDB),
    currentUser : UserDB = Depends(getCurrentUser)
):
    session = db.query(LearningSessionDB).filter(LearningSessionDB.id == session_id).first()
    if not session:
        raise HTTPException(status_code = 404, detail = "Session not found.")

    if session.user_id != currentUser.id:
        raise HTTPException(status_code = 403 , detail = "This is not your Session.")

    userMessage = LearningMessagesDB(
        session_id = session_id,
        role = "user",
        content = data.question,
        translated = data.question
    )

    db.add(userMessage)
    db.commit()

    result = AskTutor(data.question, depth = data.depth, userLanguage = currentUser.language)

    if not result["success"]:
        raise HTTPException(status_code = 500, detail = result["error"])

    assistantMessage = LearningMessagesDB(
        session_id = session_id,
        role = "assistant",
        content = result["answer"],
        translated = result["translated_answer"]
    )

    db.add(assistantMessage)
    db.commit()
    db.refresh(assistantMessage)

    return { 
        "answer" : assistantMessage.content,
        "translated" : assistantMessage.translated,
        "created_at" : assistantMessage.created_at
    }

# GET SESSION HISTORY
@app.get("/learn/sessions/{session_id}/messages")
def getSessionHistory(
    session_id : int,
    db : Session = Depends(getDB),
    currentUser : UserDB = Depends(getCurrentUser) 
): 
    session = db.query(LearningSessionDB).filter(LearningSessionDB.id == session_id).first()
    if not session:
        raise HTTPException(status_code = 404, detail = "Session not found.")

    if session.user_id != currentUser.id:
        raise HTTPException(status_code = 403 , detail = "This is not your Session.")

    messages = db.query(LearningMessagesDB).filter(
        LearningMessagesDB.session_id == session_id
    ).order_by(LearningMessagesDB.created_at.asc()).all()

    return {
        "messages" : [
            { "id": m.id,
                "role": m.role,
                "content": m.content,
                "translated": m.translated,
                "created_at": m.created_at
            }
            for m in messages
        ]
    }
    
