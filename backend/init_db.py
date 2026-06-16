from sql_database import engine, Base
import sql_models

Base.metadata.create_all(bind=engine)

print("Database created successfully")