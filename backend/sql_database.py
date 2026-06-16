import uuid
from datetime import datetime

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from auth import hash_password, verify_password


DATABASE_URL = "sqlite:///./neuroflow.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def create_user(email: str, password: str):
    from sql_models import User

    db = SessionLocal()

    try:
        existing_user = (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

        if existing_user:
            return False

        user = User(
            email=email,
            password=hash_password(password),
            created_at=datetime.utcnow()
        )

        db.add(user)
        db.commit()

        return True

    finally:
        db.close()


def authenticate_user(email: str, password: str):
    from sql_models import User

    db = SessionLocal()

    try:
        user = (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

        if not user:
            return None

        if not verify_password(password, user.password):
            return None

        return {
            "id": user.id,
            "email": user.email
        }

    finally:
        db.close()


def save_research(
    user_email: str,
    topic: str,
    report: str,
    logs=None
):
    from sql_models import ResearchHistory

    db = SessionLocal()

    try:
        research = ResearchHistory(
            id=str(uuid.uuid4()),
            user_email=user_email,
            topic=topic,
            report=report,
            logs="\n".join(logs or []),
            created_at=datetime.utcnow()
        )

        db.add(research)
        db.commit()
        db.refresh(research)

        return {
            "id": research.id,
            "topic": research.topic,
            "report": research.report,
            "logs": research.logs,
            "created_at": str(research.created_at)
        }

    finally:
        db.close()


def get_user_history(user_email: str):
    from sql_models import ResearchHistory

    db = SessionLocal()

    try:
        history = (
            db.query(ResearchHistory)
            .filter(ResearchHistory.user_email == user_email)
            .order_by(ResearchHistory.created_at.desc())
            .all()
        )

        return [
            {
                "id": item.id,
                "topic": item.topic,
                "report": item.report,
                "logs": item.logs,
                "created_at": str(item.created_at)
            }
            for item in history
        ]

    finally:
        db.close()


def delete_research(research_id: str, user_email: str):
    from sql_models import ResearchHistory

    db = SessionLocal()

    try:
        item = (
            db.query(ResearchHistory)
            .filter(
                ResearchHistory.id == research_id,
                ResearchHistory.user_email == user_email
            )
            .first()
        )

        if not item:
            return False

        db.delete(item)
        db.commit()

        return True

    finally:
        db.close()