from fastapi import FastAPI, HTTPException, Depends, status
from pydantic import BaseModel
from typing import List, Annotated
import models
from database import SessionLocal, engine
from sqlalchemy.orm import Session

app = FastAPI()
models.Base.metadata.create_all(bind=engine)

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

class PostUpdate(BaseModel):
    title: str | None = None
    content: str | None = None

class UserUpdate(BaseModel):
    username: str | None = None


dbdependency = Annotated[Session, Depends(get_db)]

@app.post("/posts/", status_code=status.HTTP_201_CREATED)
async def create_post(post: PostCreate, db: dbdependency):
    db_post = models.Post(**post.dict())
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

@app.get("/posts/{post_id}", status_code=status.HTTP_201_CREATED)
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

@app.get("/users/{user_id}", status_code=status.HTTP_201_CREATED)
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
