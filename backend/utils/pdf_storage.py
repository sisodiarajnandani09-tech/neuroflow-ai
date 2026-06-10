import json
from pathlib import Path

PDF_FILE = Path(
    "data/uploaded_docs.json"
)

# folder automatically create
PDF_FILE.parent.mkdir(
    parents=True,
    exist_ok=True
)


def load_docs():

    if not PDF_FILE.exists():
        return []

    try:

        with open(
            PDF_FILE,
            "r",
            encoding="utf-8"
        ) as file:

            content = file.read().strip()

            if not content:
                return []

            return json.loads(content)

    except Exception as e:

        print(
            f"PDF Storage Error: {e}"
        )

        return []


def save_docs(docs):

    try:

        with open(
            PDF_FILE,
            "w",
            encoding="utf-8"
        ) as file:

            json.dump(
                docs,
                file,
                indent=4,
                ensure_ascii=False
            )

    except Exception as e:

        print(
            f"Save Docs Error: {e}"
        )


def save_pdf_context(
    user_email: str,
    filename: str,
    text: str
):

    docs = load_docs()

    docs.append(
        {
            "user_email": user_email,
            "filename": filename,
            "text": text
        }
    )

    save_docs(docs)


def get_user_pdf_context(
    user_email: str
):

    docs = load_docs()

    texts = []

    for doc in docs:

        if doc.get(
            "user_email"
        ) == user_email:

            texts.append(
                doc.get(
                    "text",
                    ""
                )
            )

    return "\n\n".join(texts)