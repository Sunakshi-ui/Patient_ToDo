from urllib.parse import quote_plus
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

user = "root"
password = "12345"             # keep secret — use env vars in real projects
password_enc = quote_plus(password)
host = "localhost"
port = 3306
db = "blog_app"

URL = f"mysql+pymysql://{user}:{password_enc}@{host}:{port}/{db}"

engine = create_engine(URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()