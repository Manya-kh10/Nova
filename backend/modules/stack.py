import sqlite3
import os
from datetime import datetime

DB_PATH = "E:/Nova/data/nova.db"

def get_conn():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_conn()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            project TEXT,
            priority TEXT DEFAULT 'medium',
            status TEXT DEFAULT 'todo',
            due_date TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

def add_task(title: str, description: str = "", project: str = "", priority: str = "medium", due_date: str = ""):
    conn = get_conn()
    conn.execute(
        "INSERT INTO tasks (title, description, project, priority, due_date) VALUES (?, ?, ?, ?, ?)",
        (title, description, project, priority, due_date)
    )
    conn.commit()
    conn.close()
    return {"status": "created"}

def get_tasks(status: str = None, project: str = None):
    conn = get_conn()
    query = "SELECT * FROM tasks WHERE 1=1"
    params = []
    if status:
        query += " AND status = ?"
        params.append(status)
    if project:
        query += " AND project = ?"
        params.append(project)
    query += " ORDER BY created_at DESC"
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def update_task_status(task_id: int, status: str):
    conn = get_conn()
    conn.execute("UPDATE tasks SET status = ? WHERE id = ?", (status, task_id))
    conn.commit()
    conn.close()
    return {"status": "updated"}

def delete_task(task_id: int):
    conn = get_conn()
    conn.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
    conn.commit()
    conn.close()
    return {"status": "deleted"}

init_db()