import json
from datetime import datetime

from db import SessionLocal
from auth import hash_password, verify_password
from sql_models import User, ResearchHistory, UploadedDocument


def create_user(
    email: str,
    password: str
):
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
            password=hash_password(password)
        )

        db.add(user)
        db.commit()

        return True

    finally:
        db.close()


def authenticate_user(
    email: str,
    password: str
):
    db = SessionLocal()

    try:
        user = (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

        if not user:
            return None

        if not verify_password(
            password,
            user.password
        ):
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
    db = SessionLocal()

    try:
        record = ResearchHistory(
            user_email=user_email,
            topic=topic,
            report=report,
            logs=json.dumps(logs or []),
            created_at=datetime.utcnow()
        )

        db.add(record)
        db.commit()
        db.refresh(record)

        return {
            "id": record.id,
            "user_email": record.user_email,
            "topic": record.topic,
            "report": record.report,
            "logs": json.loads(record.logs or "[]"),
            "created_at": record.created_at.isoformat()
        }

    finally:
        db.close()


def get_user_history(
    user_email: str
):
    db = SessionLocal()

    try:
        records = (
            db.query(ResearchHistory)
            .filter(ResearchHistory.user_email == user_email)
            .order_by(ResearchHistory.created_at.desc())
            .all()
        )

        return [
            {
                "id": record.id,
                "user_email": record.user_email,
                "topic": record.topic,
                "report": record.report,
                "logs": json.loads(record.logs or "[]"),
                "created_at": record.created_at.isoformat()
            }
            for record in records
        ]

    finally:
        db.close()


def delete_research(
    research_id,
    user_email: str
):
    db = SessionLocal()

    try:
        record = (
            db.query(ResearchHistory)
            .filter(
                ResearchHistory.id == int(research_id),
                ResearchHistory.user_email == user_email
            )
            .first()
        )

        if not record:
            return False

        db.delete(record)
        db.commit()

        return True

    finally:
        db.close()


def save_pdf_context(
    user_email: str,
    filename: str,
    text: str
):
    db = SessionLocal()

    try:
        record = UploadedDocument(
            user_email=user_email,
            filename=filename,
            content=text,
            created_at=datetime.utcnow()
        )

        db.add(record)
        db.commit()

        return True

    finally:
        db.close()


def get_user_pdf_context(
    user_email: str
):
    db = SessionLocal()

    try:
        records = (
            db.query(UploadedDocument)
            .filter(UploadedDocument.user_email == user_email)
            .order_by(UploadedDocument.created_at.desc())
            .all()
        )

        return "\n\n".join(
            record.content for record in records
        )

    finally:
        db.close()