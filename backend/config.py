import os
from dotenv import load_dotenv

load_dotenv()

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "llama3.2:latest")
CODER_MODEL = os.getenv("CODER_MODEL", "qwen2.5-coder:7b")
DB_PATH = os.getenv("DB_PATH", "data/nova.db")

AVAILABLE_MODELS = [
    "llama3.2:latest",
    "qwen2.5-coder:7b",
]

BENCHMARK_PROMPTS = [
    "Explain what a binary search tree is in simple terms.",
    "Write a Python function to reverse a linked list.",
    "What is the difference between TCP and UDP?",
]

TEMPERATURE_SETTINGS = [0.0, 0.5, 1.0]