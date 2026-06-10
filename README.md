# NeuroFlow AI – Multi-Agent Autonomous Research Assistant

# Project Overview

NeuroFlow AI is a Multi-Agent Autonomous Research Assistant developed as a student project. The system performs intelligent research, generates reports, analyzes PDFs, supports voice input, and provides a ChatGPT-like conversational interface.

The project uses multiple AI models and agents working together to produce high-quality research results.


# Objective

The main goal of NeuroFlow AI is to:

* Automate research workflows
* Analyze user-uploaded PDFs
* Generate structured reports
* Provide conversational AI support
* Demonstrate Multi-Agent AI architecture
* Build an internship-ready full-stack AI application


# Features

* Multi-Agent Workflow

NeuroFlow AI contains four AI agents:

1. *Research Agent*
   - Collects information
   - Processes user queries

2. *Analyst Agent*
   - Analyzes collected information
   - Filters relevant content

3. *Writer Agent*
   - Generates research reports
   - Creates structured responses

4. *Manager Agent*
   - Coordinates all agents
   - Verifies final output


# Chat System
* ChatGPT-style conversation UI
* Multi-turn conversation support
* Research mode
* Casual chat mode
* Intent classification


# PDF Analysis
Users can:
* Upload PDF files
* Ask questions about PDFs
* Generate summaries
* Extract relevant information


# Voice Assistant
* Speech-to-text support
* Voice query input
* Hands-free interaction


# Export Reports
Generated reports can be downloaded as:
* PDF
* DOCX


# Authentication
* User Registration
* User Login
* JWT Authentication
* Protected API Routes


# Research History
Users can:
* View previous research
* Pin important chats
* Delete history
* Download previous reports


# Tech Stack
* Frontend
    - Next.js
    - React
    - Tailwind CSS
    - Axios

* Backend
    - FastAPI
    - Python

* AI Services
    - Ollama
    - Groq
    - Gemini
    - Tavily Search

* Database
     - SQLite
     - SQLAlchemy ORM
     - User-wise research history
     - PDF context storage
     - Persistent data storage


# Project Structure

```text
NeuroFlow-AI
│
├── backend
│   │
│   ├── agents
│   │   ├── analyst_agent.py
│   │   ├── manager_agent.py
│   │   ├── research_agent.py
│   │   ├── writer_agent.py
│   │   ├── pipeline.py
│   │   └── state.py
│   │
│   ├── services
│   │   ├── gemini_service.py
│   │   ├── groq_service.py
│   │   ├── ollama_service.py
│   │   ├── llm_router.py
│   │   ├── smart_router.py
│   │   ├── pdf_service.py
│   │   ├── tavily_service.py
│   │   └── fallback_service.py
│   │
│   ├── utils
│   │   ├── report_validator.py
│   │   ├── source_cleaner.py
│   │   └── state_storage.py
│   │
│   ├── uploads
│   │   └── (uploaded PDFs)
│   │
│   ├── downloads
│   │   └── (generated PDF/DOCX reports)
│   │
│   ├── data
│   │   └── (legacy JSON files - optional)
│   │
│   ├── db.py
│   ├── sql_models.py
│   ├── sql_database.py
│   ├── init_db.py
│   ├── neuroflow.db
│   │
│   ├── auth.py
│   ├── database.py
│   ├── models.py
│   ├── main.py
│   ├── requirements.txt
│   └── .env
│
├── frontend
│   │
│   ├── public
│   │   ├── logo.png
│   │   └── assets
│   │
│   ├── src
│   │   │
│   │   ├── app
│   │   │   ├── dashboard
│   │   │   │   └── page.jsx
│   │   │   │
│   │   │   ├── settings
│   │   │   │   └── page.jsx
│   │   │   │
│   │   │   ├── globals.css
│   │   │   ├── layout.jsx
│   │   │   └── page.jsx
│   │   │
│   │   ├── components
│   │   │   ├── AgentStatus.jsx
│   │   │   ├── DashboardMain.jsx
│   │   │   ├── LoginScreen.jsx
│   │   │   ├── SettingsPage.jsx
│   │   │   └── Sidebar.jsx
│   │   │
│   │   └── services
│   │       └── api.js
│   │
│   ├── package.json
│   ├── package-lock.json
│   ├── next.config.mjs
│   ├── postcss.config.mjs
│   └── jsconfig.json
│
├── README.md
├── .gitignore
├── structure.txt
└── LICENSE
```

# Database Design

NeuroFlow AI uses *SQLite Database* for persistent data storage. SQLite is lightweight, serverless, and ideal for academic projects and local deployment.

* Database Technology
- SQLite
- SQLAlchemy ORM
- Python

Database File:
backend/neuroflow.db


# Database Tables

* 1. Users Table

Stores registered user information.

| Field      | Type     | Description           |
| ---------- | -------- | --------------------- |
| id         | Integer  | Primary Key           |
| email      | String   | Unique User Email     |
| password   | String   | Hashed Password       |
| created_at | DateTime | Account Creation Time |

* 2. Research History Table

Stores all generated research reports.

| Field      | Type     | Description          |
| ---------- | -------- | -------------------- |
| id         | Integer  | Primary Key          |
| user_email | String   | User Email           |
| topic      | String   | Research Topic       |
| report     | Text     | Generated Report     |
| logs       | Text     | Agent Logs           |
| created_at | DateTime | Report Creation Time |

* 3. Uploaded Documents Table

Stores uploaded PDF content for analysis.

| Field      | Type     | Description        |
| ---------- | -------- | ------------------ |
| id         | Integer  | Primary Key        |
| user_email | String   | User Email         |
| filename   | String   | PDF File Name      |
| content    | Text     | Extracted PDF Text |
| created_at | DateTime | Upload Time        |

* Database Architecture
Frontend (Next.js)
        │
        ▼
FastAPI Backend
        │
        ▼
SQLite Database
(neuroflow.db)
        │
 ┌──────┼────────┐
 ▼      ▼        ▼
Users  Research  Uploaded
Table  History   Documents


# Benefits of SQLite
* Lightweight and fast
* No separate database server required
* Easy integration with FastAPI
* Suitable for academic and internship projects
* Supports structured data storage
* Better than JSON file storage for scalability

# Database Operations
NeuroFlow AI performs the following database operations:
* User Registration
* User Authentication
* Research History Storage
* PDF Context Storage
* Research Retrieval
* Research Deletion
* User-specific Data Management

# Future Improvements
In future versions, SQLite can be upgraded to:
* PostgreSQL
* MySQL
* Supabase
* Cloud SQL Services
for large-scale deployment and production environments.


# Installation

# Backend

* bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

uvicorn main:app --reload



# Frontend
* bash
cd frontend

npm install

npm run dev



# API Endpoints
* Authentication
POST /register
POST /login
GET /me

* Research
POST /research
GET /history
DELETE /history/{id}

* PDF
POST /upload-pdf

* Export
POST /download-pdf
POST /download-docx

* Workflow

User Query(text, pdf upload or voice input)
     │
     ▼
Research Agent
     │
     ▼
Analyst Agent
     │
     ▼
Writer Agent
     │
     ▼
Manager Agent
     │
     ▼
Final Verified Report


# Learning Outcomes

Through this project, I learned:
* FastAPI Backend Development
* Next.js Frontend Development
* JWT Authentication
* Multi-Agent AI Systems
* LLM Integration
* PDF Processing
* REST API Development
* Full Stack Project Architecture
* AI Workflow Design
* PDF Storage
* PDF Retrieval
* Chat Session Storage
* User Profile Management

# Project Team
**NeuroFlow AI – Multi-Agent Autonomous Research Assistant**
This project was developed as a collaborative academic project by:

# Rajnandani Sisodia
Role: Backend Developer

Responsibilities:
- FastAPI Backend Development
- API Design
- Authentication & Authorization
- Multi-Agent Workflow Integration
- AI Service Integration (Gemini, Groq, Ollama)
- Research Pipeline Development

# Monika Ranawat
Role: Frontend Developer

Responsibilities:
- Next.js Development
- React Components
- Dashboard UI Design
- Chat Interface
- Settings Page
- Responsive User Experience

# Sanjana Purohit
Role: Database & Documentation

Responsibilities:
- Database Design
- Data Management
- Research History Storage
- Project Documentation
- README Preparation
- System Documentation


# Academic Project

Project Title: NeuroFlow AI – Multi-Agent Autonomous Research Assistant
Course: Bachelor of Computer Applications (BCA)
Academic Year: 2025–2026


# Acknowledgement

This project was developed as a learning initiative to explore:
- Artificial Intelligence
- Multi-Agent Systems
- Full Stack Development
- Research Automation
- Modern AI Applications
by integrating modern technologies such as FastAPI, Next.js, Gemini, Groq, Ollama, and Tavily Search. This project was developed as part of the Bachelor of Computer Applications (BCA) academic curriculum to explore modern AI-powered research systems and full-stack development.

# Future Enhancements

* RAG (Retrieval Augmented Generation)
* Vector Database Integration
* Multi-PDF Research
* Team Collaboration
* Live Agent Execution Streaming
* RAG with Vector Database
* Multi-User Collaboration
* Research Citation Generation
* AI Memory System
* Cloud Deployment
* Mobile Application
* Research Citations
* Cloud Deployment
* Mobile Application Support

#   n e u r o f l o w - a i  
 