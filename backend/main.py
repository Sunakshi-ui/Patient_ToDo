from fastapi import FastAPI, HTTPException, Depends, status
from typing import Annotated
from sqlalchemy import text
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict
from database import SessionLocal, engine
import models
import logging


#cors import: since fronted and backend are running on different ports
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PostCreate(BaseModel):
    title: str
    content: str
    user_id: int    

class UserBase(BaseModel):
    username: str


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# models.Base.metadata.create_all(bind=engine)

@app.get("/test-db")
def test_db(db: Session = Depends(get_db)):
    result = db.execute(text("SELECT 1")).scalar()
    return {"db_connection": result}

class PostUpdate(BaseModel):
    title: str | None = None
    content: str | None = None

class UserUpdate(BaseModel):
    username: str | None = None

dbdependency = Annotated[Session, Depends(get_db)]

@app.get("/posts/", status_code=status.HTTP_200_OK)
async def list_posts(db: dbdependency):
    # Retrieve all posts from the database
    all_posts = db.query(models.Post).all()
    return all_posts

@app.get("/users/", status_code=status.HTTP_200_OK)
async def list_users(db: dbdependency):
    # Retrieve all users from the database
    all_users = db.query(models.User).all()
    return all_users

@app.post("/posts/", status_code=status.HTTP_201_CREATED)
async def create_post(post: PostCreate, db: dbdependency):
    db_post = models.Post(**post.dict())
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

@app.get("/posts/{post_id}", status_code=status.HTTP_200_OK)
async def get_post(post_id: int, db: dbdependency):
    db_post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    return db_post

@app.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(post_id: int, db: dbdependency):
    db_post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    db.delete(db_post)
    db.commit()
    return

@app.post("/users/", status_code=status.HTTP_201_CREATED)
async def create_user(user: UserBase, db: dbdependency):
    db_user = models.User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/users/{user_id}", status_code=status.HTTP_200_OK)
async def get_user(user_id: int, db: dbdependency):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@app.put("/posts/{post_id}", status_code=status.HTTP_200_OK)
async def update_post(post_id: int, post: PostUpdate, db: dbdependency):
    db_post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    update_data = post.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_post, key, value)
    
    db.commit()
    db.refresh(db_post)
    return db_post

@app.put("/users/{user_id}", status_code=status.HTTP_200_OK)
async def update_user(user_id: int, user: UserUpdate, db: dbdependency):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = user.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

