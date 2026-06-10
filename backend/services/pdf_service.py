#pdf_service.py
from pypdf import PdfReader


def extract_pdf_text(
    file_path: str
):

    reader = PdfReader(file_path)

    text = []

    for page in reader.pages:

        page_text = page.extract_text()

        if page_text:
            text.append(page_text)

    return "\n".join(text)

def clean_pdf_text(
    text: str
):

    text = text.replace(
        "\n\n",
        "\n"
    )

    text = text.replace(
        "\t",
        " "
    )

    text = " ".join(
        text.split()
    )

    return text

def process_pdf(
    file_path: str
):

    raw_text = extract_pdf_text(
        file_path
    )

    return clean_pdf_text(
        raw_text
    )