# models.py

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from pydantic import BaseModel, Field
from typing import List

from pydantic import BaseModel, field_validator

import re
from pydantic import BaseModel, Field, EmailStr, field_validator


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(
        min_length=8,
        max_length=50
    )

    @field_validator("email")
    @classmethod
    def validate_email(cls, value):

        email = value.lower().strip()

        blocked_domains = [
            "tempmail.com",
            "10minutemail.com",
            "guerrillamail.com",
            "mailinator.com",
            "yopmail.com",
            "fakeemail.com"
        ]

        domain = email.split("@")[-1]

        if domain in blocked_domains:
            raise ValueError(
                "Temporary or fake emails are not allowed"
            )

        if domain != "gmail.com":
            raise ValueError(
                "Only Gmail accounts are allowed"
            )

        return email

    @field_validator("password")
    @classmethod
    def validate_password(cls, value):

        if len(value) < 8:
            raise ValueError(
                "Password must be at least 8 characters"
            )

        if not re.search(r"[A-Z]", value):
            raise ValueError(
                "Password must contain at least one uppercase letter"
            )

        if not re.search(r"[a-z]", value):
            raise ValueError(
                "Password must contain at least one lowercase letter"
            )

        if not re.search(r"\d", value):
            raise ValueError(
                "Password must contain at least one number"
            )

        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", value):
            raise ValueError(
                "Password must contain at least one special character"
            )

        return value


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


class MessageResponse(BaseModel):
    message: str
    

class ResearchRequest(BaseModel):
    topic: str = Field(
        min_length=3,
        max_length=500
    )


class ResearchRecord(BaseModel):
    id: str
    user_email: str
    topic: str
    report: str
    created_at: str


class DeleteResponse(BaseModel):
    message: str
    

class ResearchResponse(BaseModel):

    id: str

    topic: str

    report: str

    logs: List[str]
    
class ChatRequest(BaseModel):
    message: str
    provider: str = "groq"
    
class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str
    
class QuestionRequest(BaseModel):
    question: str
    
class AskDocumentRequest(BaseModel):
    document_id: int
    question: str