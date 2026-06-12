import sys
import os
sys.path.append(os.path.dirname(__file__))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from modules.forge import run_full_benchmark, compare_models, benchmark_model
from modules.pulse import fetch_important_emails, fetch_all_unread
from modules.flux import log_session, get_sessions, get_today_stats
from config import AVAILABLE_MODELS, BENCHMARK_PROMPTS, TEMPERATURE_SETTINGS, DEFAULT_MODEL
app = FastAPI(title="Nova API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Models ---

class CompareRequest(BaseModel):
    prompt: str
    temperature: float = 0.7

class SingleBenchmarkRequest(BaseModel):
    model: str
    prompt: str
    temperature: float = 0.7


# --- Routes ---

@app.get("/")
def root():
    return {"status": "Nova is alive"}


@app.get("/forge/models")
def get_models():
    return {"models": AVAILABLE_MODELS}


@app.get("/forge/prompts")
def get_prompts():
    return {"prompts": BENCHMARK_PROMPTS}


@app.get("/forge/temperatures")
def get_temperatures():
    return {"temperatures": TEMPERATURE_SETTINGS}


@app.get("/forge/benchmark/full")
def full_benchmark():
    results = run_full_benchmark()
    return {"results": results}


@app.post("/forge/benchmark/compare")
def compare(req: CompareRequest):
    results = compare_models(req.prompt, req.temperature)
    return {"results": results}


@app.post("/forge/benchmark/single")
def single(req: SingleBenchmarkRequest):
    result = benchmark_model(req.model, req.prompt, req.temperature)
    return {"result": result}

from modules.chat import chat, clear_history, get_history

class ChatRequest(BaseModel):
    message: str
    model: str = DEFAULT_MODEL

@app.post("/chat")
def chat_endpoint(req: ChatRequest):
    response = chat(req.message, req.model)
    return {"response": response}

@app.delete("/chat/history")
def clear_chat_history():
    return clear_history()

@app.get("/chat/history")
def get_chat_history():
    return {"history": get_history()}

from modules.stack import add_task, get_tasks, update_task_status, delete_task

class TaskRequest(BaseModel):
    title: str
    description: str = ""
    project: str = ""
    priority: str = "medium"
    due_date: str = ""

class StatusUpdate(BaseModel):
    status: str

@app.post("/stack/tasks")
def create_task(req: TaskRequest):
    return add_task(req.title, req.description, req.project, req.priority, req.due_date)

@app.get("/stack/tasks")
def list_tasks(status: str = None, project: str = None):
    return {"tasks": get_tasks(status, project)}

@app.patch("/stack/tasks/{task_id}")
def update_task(task_id: int, req: StatusUpdate):
    return update_task_status(task_id, req.status)

@app.delete("/stack/tasks/{task_id}")
def remove_task(task_id: int):
    return delete_task(task_id)

from modules.orbit import add_project, get_projects, update_project_status, delete_project, scan_folder, get_git_log, get_github_repos

class ProjectRequest(BaseModel):
    name: str
    path: str = ""
    description: str = ""
    stack: str = ""
    github_repo: str = ""

class ProjectStatusUpdate(BaseModel):
    status: str

@app.post("/orbit/projects")
def create_project(req: ProjectRequest):
    return add_project(req.name, req.path, req.description, req.stack, req.github_repo)

@app.get("/orbit/projects")
def list_projects():
    return {"projects": get_projects()}

@app.patch("/orbit/projects/{project_id}")
def update_project(project_id: int, req: ProjectStatusUpdate):
    return update_project_status(project_id, req.status)

@app.delete("/orbit/projects/{project_id}")
def remove_project(project_id: int):
    return delete_project(project_id)

@app.get("/orbit/scan")
def scan_projects(path: str):
    return {"projects": scan_folder(path)}

@app.get("/orbit/git/{project_id}")
def git_log(project_id: int):
    projects = get_projects()
    project = next((p for p in projects if p["id"] == project_id), None)
    if not project:
        return {"commits": []}
    return {"commits": get_git_log(project["path"])}

@app.get("/orbit/github/{username}")
def github_repos(username: str):
    return {"repos": get_github_repos(username)}

@app.get("/pulse/emails")
def get_emails(max_results: int = 20):
    return {"emails": fetch_important_emails(max_results)}

@app.get("/pulse/unread")
def get_unread():
    return fetch_all_unread()


class SessionRequest(BaseModel):
    project: str = ""
    duration_minutes: int = 25
    type: str = "work"
    completed: bool = True

@app.post("/flux/sessions")
def create_session(req: SessionRequest):
    return log_session(req.project, req.duration_minutes, req.type, req.completed)

@app.get("/flux/sessions")
def list_sessions(limit: int = 50):
    return {"sessions": get_sessions(limit)}

@app.get("/flux/today")
def today_stats():
    return get_today_stats()