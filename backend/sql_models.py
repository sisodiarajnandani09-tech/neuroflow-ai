from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from sql_database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    email = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )

    password = Column(
        String,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


class ResearchHistory(Base):
    __tablename__ = "research_history"

    id = Column(String, primary_key=True, index=True)

    user_email = Column(
        String,
        index=True,
        nullable=False
    )

    topic = Column(
        String,
        nullable=False
    )

    report = Column(
        Text,
        nullable=False
    )

    logs = Column(
        Text,
        default=""
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


class UploadedDocument(Base):
    __tablename__ = "uploaded_documents"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, nullable=False, index=True)
    filename = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
class GeneratedAgent(Base):
    __tablename__ = "generated_agents"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, index=True)
    agent_name = Column(String)
    agent_type = Column(String)
    role = Column(Text)
    goal = Column(Text)
    prompt = Column(Text)
    code = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
class MarketplaceAgent(Base):
    __tablename__ = "marketplace_agents"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    category = Column(String)
    description = Column(Text)
    icon = Column(String)
    system_prompt = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)