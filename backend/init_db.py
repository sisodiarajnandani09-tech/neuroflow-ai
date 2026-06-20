from db import engine
from sql_models import Base

Base.metadata.create_all(bind=engine)

print("Database tables created successfully")