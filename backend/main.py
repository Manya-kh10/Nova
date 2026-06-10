import sys
import os
sys.path.append(os.path.dirname(__file__))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from modules.forge import run_full_benchmark, compare_models, benchmark_model
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