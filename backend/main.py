import os
import uuid

from fastapi import (
    FastAPI,
    HTTPException,
    Depends,
    UploadFile,
    File
)

from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from docx import Document

from reportlab.platypus import (SimpleDocTemplate,Paragraph,Spacer)
from reportlab.lib.styles import (getSampleStyleSheet)
from auth import (get_current_user,create_access_token)
from models import (ResearchRequest,UserRegister,UserLogin)
from agents.pipeline import ResearchPipeline
from services.pdf_service import process_pdf
from services.llm_router import ask_llm
from services.smart_router import (classify_intent,generate_chat_answer)
from sql_database import (
    save_research,
    get_user_history,
    delete_research,
    create_user,
    authenticate_user,
    save_pdf_context,
    get_user_pdf_context
)

app = FastAPI(
    title="NeuroFlow AI",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


UPLOAD_DIR = "uploads"
DOWNLOAD_DIR = "downloads"

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)

os.makedirs(
    DOWNLOAD_DIR,
    exist_ok=True
)


@app.get("/")
async def root():
    return {
        "message": "NeuroFlow AI Backend Running"
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "NeuroFlow AI"
    }


@app.post("/register")
async def register(
    user: UserRegister
):

    success = create_user(
        user.email,
        user.password
    )

    if not success:
        raise HTTPException(
            status_code=400,
            detail="User already exists"
        )

    return {
        "message": "Registration successful"
    }


@app.post("/login")
async def login(
    user: UserLogin
):

    db_user = authenticate_user(
        user.email,
        user.password
    )

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    token = create_access_token(
        {
            "sub": db_user["email"]
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@app.get("/me")
async def me(
    user=Depends(get_current_user)
):

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized"
        )

    return {
        "email": user
    }


@app.post("/research")
async def research(
    request: ResearchRequest,
    user=Depends(get_current_user)
):

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized"
        )

    topic = request.topic.strip()

    if not topic:
        raise HTTPException(
            status_code=400,
            detail="Topic is required"
        )

    print("REQUEST RECEIVED")
    print("USER =", user)
    print("TOPIC =", topic)

    pdf_context = get_user_pdf_context(
        user
    )

    intent = await classify_intent(
        topic
    )

    print("INTENT =", intent)

    if intent == "CHAT":

        answer = await generate_chat_answer(
            topic
        )

        saved = save_research(
            user_email=user,
            topic=topic,
            report=answer,
            logs=[
                "Chat Mode Activated",
                "LLM Router Used"
            ]
        )

        return {
            "id": saved["id"],
            "topic": topic,
            "report": answer,
            "logs": [
                "Chat Mode Activated",
                "LLM Router Used"
            ]
        }

    pipeline = ResearchPipeline()

    state = await pipeline.run(
        topic=topic,
        pdf_context=pdf_context
    )

    final_report = (
        state.final_verified_report
        or state.draft_report
        or state.analysis_brief
        or "No report generated."
    )

    saved = save_research(
        user_email=user,
        topic=topic,
        report=final_report,
        logs=state.logs
    )

    return {
        "id": saved["id"],
        "topic": topic,
        "report": final_report,
        "logs": state.logs
    }


@app.get("/history")
async def history(
    user=Depends(get_current_user)
):

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized"
        )

    return get_user_history(
        user
    )


@app.delete("/history/{research_id}")
async def delete_history(
    research_id: str,
    user=Depends(get_current_user)
):

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized"
        )

    success = delete_research(
        research_id,
        user
    )

    if not success:
        raise HTTPException(
            status_code=404,
            detail="Research not found"
        )

    return {
        "message": "Deleted successfully"
    }


@app.post("/upload-pdf")
async def upload_pdf(
    file: UploadFile = File(...),
    user=Depends(get_current_user)
):

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized"
        )

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files allowed"
        )

    safe_filename = file.filename.replace(
        " ",
        "_"
    )

    file_path = os.path.join(
        UPLOAD_DIR,
        safe_filename
    )

    with open(
        file_path,
        "wb"
    ) as buffer:
        buffer.write(
            await file.read()
        )

    text = process_pdf(
        file_path
    )

    save_pdf_context(
        user_email=user,
        filename=file.filename,
        text=text
    )

    return {
        "message": "PDF uploaded successfully",
        "filename": file.filename,
        "characters": len(text),
        "preview": text[:500]
    }


@app.post("/download-docx")
async def download_docx(
    data: dict
):

    report = data.get(
        "report",
        ""
    )

    if not report:
        raise HTTPException(
            status_code=400,
            detail="Report is required"
        )

    filename = f"{uuid.uuid4()}.docx"

    file_path = os.path.join(
        DOWNLOAD_DIR,
        filename
    )

    doc = Document()

    doc.add_heading(
        "NeuroFlow AI Research Report",
        level=1
    )

    for line in report.split("\n"):

        clean_line = line.strip()

        if not clean_line:
            continue

        if clean_line.startswith("# "):
            doc.add_heading(
                clean_line.replace("# ", ""),
                level=1
            )

        elif clean_line.startswith("## "):
            doc.add_heading(
                clean_line.replace("## ", ""),
                level=2
            )

        elif clean_line.startswith("### "):
            doc.add_heading(
                clean_line.replace("### ", ""),
                level=3
            )

        elif clean_line.startswith("- "):
            doc.add_paragraph(
                clean_line.replace("- ", ""),
                style="List Bullet"
            )

        else:
            doc.add_paragraph(
                clean_line
            )

    doc.save(
        file_path
    )

    return FileResponse(
        file_path,
        filename="neuroflow_research_report.docx",
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )


@app.post("/download-pdf")
async def download_pdf(
    data: dict
):

    report = data.get(
        "report",
        ""
    )

    if not report:
        raise HTTPException(
            status_code=400,
            detail="Report is required"
        )

    filename = f"{uuid.uuid4()}.pdf"

    file_path = os.path.join(
        DOWNLOAD_DIR,
        filename
    )

    pdf = SimpleDocTemplate(
        file_path
    )

    styles = getSampleStyleSheet()

    story = []

    story.append(
        Paragraph(
            "NeuroFlow AI Research Report",
            styles["Title"]
        )
    )

    story.append(
        Spacer(
            1,
            12
        )
    )

    for line in report.split("\n"):

        clean_line = line.strip()

        if not clean_line:
            story.append(
                Spacer(
                    1,
                    8
                )
            )
            continue

        clean_line = (
            clean_line
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
        )

        if clean_line.startswith("# "):
            story.append(
                Paragraph(
                    clean_line.replace("# ", ""),
                    styles["Heading1"]
                )
            )

        elif clean_line.startswith("## "):
            story.append(
                Paragraph(
                    clean_line.replace("## ", ""),
                    styles["Heading2"]
                )
            )

        elif clean_line.startswith("### "):
            story.append(
                Paragraph(
                    clean_line.replace("### ", ""),
                    styles["Heading3"]
                )
            )

        elif clean_line.startswith("- "):
            story.append(
                Paragraph(
                    "• " + clean_line.replace("- ", ""),
                    styles["BodyText"]
                )
            )

        else:
            story.append(
                Paragraph(
                    clean_line,
                    styles["BodyText"]
                )
            )

        story.append(
            Spacer(
                1,
                6
            )
        )

    pdf.build(
        story
    )

    return FileResponse(
        file_path,
        filename="neuroflow_research_report.pdf",
        media_type="application/pdf"
    )


@app.get("/test-llm")
async def test_llm():

    result = await ask_llm(
        "Reply in one line: NeuroFlow AI is working."
    )

    return {
        "result": result
    }
    
