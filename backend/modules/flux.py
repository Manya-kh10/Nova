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
        CREATE TABLE IF NOT EXISTS pomodoro_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project TEXT,
            duration_minutes INTEGER,
            type TEXT DEFAULT 'work',
            completed INTEGER DEFAULT 1,
            started_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

def log_session(project: str = "", duration_minutes: int = 25, session_type: str = "work", completed: bool = True):
    conn = get_conn()
    conn.execute(
        "INSERT INTO pomodoro_sessions (project, duration_minutes, type, completed) VALUES (?, ?, ?, ?)",
        (project, duration_minutes, session_type, 1 if completed else 0)
    )
    conn.commit()
    conn.close()
    return {"status": "logged"}

def get_sessions(limit: int = 50):
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM pomodoro_sessions ORDER BY started_at DESC LIMIT ?", (limit,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_today_stats():
    conn = get_conn()
    today = datetime.now().strftime('%Y-%m-%d')
    rows = conn.execute(
        "SELECT * FROM pomodoro_sessions WHERE started_at LIKE ? AND type = 'work' AND completed = 1",
        (f"{today}%",)
    ).fetchall()
    conn.close()
    sessions = [dict(r) for r in rows]
    total_minutes = sum(s['duration_minutes'] for s in sessions)
    return {
        "sessions_completed": len(sessions),
        "total_focus_minutes": total_minutes,
        "total_focus_hours": round(total_minutes / 60, 1)
    }

init_db()