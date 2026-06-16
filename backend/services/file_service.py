import os
import fitz
from google import genai
from google.genai import types


client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def extract_pdf_text(file_path):
    text = ""

    pdf = fitz.open(file_path)

    for page in pdf:
        text += page.get_text()

    pdf.close()

    return text.strip()


def extract_image_text(file_path):
    with open(file_path, "rb") as image_file:
        image_bytes = image_file.read()

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[
            "Extract all text from this image and explain the image content clearly.",
            types.Part.from_bytes(
                data=image_bytes,
                mime_type=_get_mime_type(file_path)
            )
        ]
    )

    return response.text.strip()


def _get_mime_type(file_path):
    file_path = file_path.lower()

    if file_path.endswith(".png"):
        return "image/png"

    if file_path.endswith(".jpg") or file_path.endswith(".jpeg"):
        return "image/jpeg"

    return "application/octet-stream"