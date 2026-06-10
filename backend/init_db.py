from db import engine
from sql_models import Base


def init_database():
    Base.metadata.create_all(
        bind=engine
    )

    print("SQLite database created successfully.")


if __name__ == "__main__":
    init_database()