import sqlite3
import os
import subprocess
import requests
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
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            path TEXT,
            description TEXT,
            stack TEXT,
            status TEXT DEFAULT 'active',
            github_repo TEXT,
            last_active TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

def scan_folder(base_path: str) -> list:
    projects = []
    if not os.path.exists(base_path):
        return projects
    for folder in os.listdir(base_path):
        full_path = os.path.join(base_path, folder)
        if os.path.isdir(full_path):
            is_git = os.path.exists(os.path.join(full_path, '.git'))
            has_py = any(f.endswith('.py') for f in os.listdir(full_path))
            has_js = any(f.endswith('.js') or f.endswith('.jsx') for f in os.listdir(full_path))
            stack = 'Python' if has_py else 'JavaScript' if has_js else 'Unknown'
            projects.append({
                "name": folder,
                "path": full_path,
                "is_git": is_git,
                "stack": stack,
                "last_modified": datetime.fromtimestamp(os.path.getmtime(full_path)).strftime('%Y-%m-%d')
            })
    return projects

def get_git_log(project_path: str) -> list:
    try:
        result = subprocess.run(
            ['git', 'log', '--oneline', '-10'],
            cwd=project_path,
            capture_output=True, text=True, timeout=5
        )
        return result.stdout.strip().split('\n') if result.stdout.strip() else []
    except:
        return []

def add_project(name: str, path: str = "", description: str = "", stack: str = "", github_repo: str = ""):
    conn = get_conn()
    conn.execute(
        "INSERT INTO projects (name, path, description, stack, github_repo, last_active) VALUES (?, ?, ?, ?, ?, ?)",
        (name, path, description, stack, github_repo, datetime.now().strftime('%Y-%m-%d'))
    )
    conn.commit()
    conn.close()
    return {"status": "created"}

def get_projects():
    conn = get_conn()
    rows = conn.execute("SELECT * FROM projects ORDER BY last_active DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]

def update_project_status(project_id: int, status: str):
    conn = get_conn()
    conn.execute("UPDATE projects SET status = ? WHERE id = ?", (status, project_id))
    conn.commit()
    conn.close()
    return {"status": "updated"}

def delete_project(project_id: int):
    conn = get_conn()
    conn.execute("DELETE FROM projects WHERE id = ?", (project_id,))
    conn.commit()
    conn.close()
    return {"status": "deleted"}

def get_github_repos(username: str):
    try:
        res = requests.get(f"https://api.github.com/users/{username}/repos?sort=updated&per_page=10")
        if res.status_code == 200:
            repos = res.json()
            return [{
                "name": r["name"],
                "description": r["description"],
                "language": r["language"],
                "stars": r["stargazers_count"],
                "updated_at": r["updated_at"][:10],
                "url": r["html_url"],
                "open_issues": r["open_issues_count"]
            } for r in repos]
    except:
        pass
    return []

init_db()