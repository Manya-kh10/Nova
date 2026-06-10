import ollama
from config import OLLAMA_BASE_URL, DEFAULT_MODEL

client = ollama.Client(host=OLLAMA_BASE_URL)

conversation_history = []

def chat(message: str, model: str = DEFAULT_MODEL) -> str:
    global conversation_history

    conversation_history.append({
        "role": "user",
        "content": message
    })

    response = client.chat(
        model=model,
        messages=[
            {
                "role": "system",
                "content": """You are Nova, a personal AI assistant running locally on the user's machine.
You are smart, concise, and helpful. You know about the user's projects, tasks, and work context.
You never mention being an AI unless asked. You respond naturally like a highly capable personal assistant.
Keep responses focused and practical."""
            },
            *conversation_history
        ]
    )

    assistant_message = response["message"]["content"]
    conversation_history.append({
        "role": "assistant",
        "content": assistant_message
    })

    return assistant_message


def clear_history():
    global conversation_history
    conversation_history = []
    return {"status": "cleared"}


def get_history():
    return conversation_history
