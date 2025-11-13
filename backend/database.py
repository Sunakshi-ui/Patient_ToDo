from urllib.parse import quote_plus
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

user = "root"
password = "12345"  # keep secret — use env vars in real projects
password_enc = quote_plus(password)
host = "localhost"
port = 3306
db = "patient_todo_db"

URL = f"mysql+pymysql://{user}:{password_enc}@{host}:{port}/{db}"

engine = create_engine(URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

try:
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        print("Database connected successfully:", result.scalar())
except Exception as e:
    print("Database connection failed:", e)