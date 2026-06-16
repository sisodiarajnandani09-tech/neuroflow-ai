# #pdf_service.py
# from pypdf import PdfReader

# from services.llm_router import ask_llm
# from sql_database import get_user_pdf_context


# def extract_pdf_text(
#     file_path: str
# ):

#     reader = PdfReader(file_path)

#     text = []

#     for page in reader.pages:

#         page_text = page.extract_text()

#         if page_text:
#             text.append(page_text)

#     return "\n".join(text)

# def clean_pdf_text(
#     text: str
# ):

#     text = text.replace(
#         "\n\n",
#         "\n"
#     )

#     text = text.replace(
#         "\t",
#         " "
#     )

#     text = " ".join(
#         text.split()
#     )

#     return text

# def process_pdf(
#     file_path: str
# ):

#     raw_text = extract_pdf_text(
#         file_path
#     )

#     return clean_pdf_text(
#         raw_text
#     )
    
# async def ask_question_from_pdf(user_email: str, question: str):

#     pdf_text = get_user_pdf_context(user_email)

#     prompt = f"""
# Answer ONLY from the PDF.

# PDF Content:
# {pdf_text}

# Question:
# {question}

# Rules:
# - Give direct answer.
# - Do not create report.
# - Do not create executive summary.
# - Do not create markdown headings.
# - If answer not present say:
#   "Information not found in uploaded PDF."
# """

#     response = await ask_llm(prompt)

#     return response