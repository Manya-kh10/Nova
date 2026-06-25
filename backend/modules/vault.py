import os
import sqlite3
from datetime import datetime
import ollama
from config import OLLAMA_BASE_URL, DEFAULT_MODEL

client = ollama.Client(host=OLLAMA_BASE_URL)
DB_PATH = "E:/Nova/data/nova.db"

def get_conn():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_conn()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS summaries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT,
            filetype TEXT,
            content_preview TEXT,
            summary TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

def extract_text(file_path: str, filename: str) -> str:
    ext = filename.lower().split('.')[-1]

    if ext in ['txt', 'md']:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read()

    elif ext == 'pdf':
        from pypdf import PdfReader
        reader = PdfReader(file_path)
        return '\n'.join(page.extract_text() or '' for page in reader.pages)

    elif ext == 'docx':
        from docx import Document
        doc = Document(file_path)
        return '\n'.join(p.text for p in doc.paragraphs)

    return ""

def summarize_with_llm(text: str) -> str:
    prompt = f"""Summarize the following document clearly and concisely.
Extract the key points, main ideas, and any important details.
Format your response with bullet points for key points.

Document:
{text[:4000]}

Summary:"""

    response = client.chat(
        model=DEFAULT_MODEL,
        messages=[{"role": "user", "content": prompt}]
    )
    return response["message"]["content"]

def save_summary(filename: str, filetype: str, preview: str, summary: str):
    conn = get_conn()
    conn.execute(
        "INSERT INTO summaries (filename, filetype, content_preview, summary) VALUES (?, ?, ?, ?)",
        (filename, filetype, preview[:300], summary)
    )
    conn.commit()
    conn.close()

def get_summaries():
    conn = get_conn()
    rows = conn.execute("SELECT * FROM summaries ORDER BY created_at DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]

def delete_summary(summary_id: int):
    conn = get_conn()
    conn.execute("DELETE FROM summaries WHERE id = ?", (summary_id,))
    conn.commit()
    conn.close()
    return {"status": "deleted"}

init_db()