import time
import ollama
from config import AVAILABLE_MODELS, BENCHMARK_PROMPTS, TEMPERATURE_SETTINGS, OLLAMA_BASE_URL

client = ollama.Client(host=OLLAMA_BASE_URL)

def benchmark_model(model: str, prompt: str, temperature: float) -> dict:
    start_time = time.time()
    first_token_time = None
    full_response = ""
    token_count = 0

    try:
        stream = client.chat(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            options={"temperature": temperature},
            stream=True
        )

        for chunk in stream:
            if first_token_time is None:
                first_token_time = time.time()
            content = chunk["message"]["content"]
            full_response += content
            token_count += 1

        end_time = time.time()
        total_latency = round(end_time - start_time, 3)
        time_to_first_token = round(first_token_time - start_time, 3) if first_token_time else None
        tokens_per_second = round(token_count / total_latency, 2) if total_latency > 0 else 0

        return {
            "model": model,
            "prompt": prompt,
            "temperature": temperature,
            "response": full_response,
            "token_count": token_count,
            "time_to_first_token_sec": time_to_first_token,
            "total_latency_sec": total_latency,
            "tokens_per_second": tokens_per_second,
            "status": "success"
        }

    except Exception as e:
        return {
            "model": model,
            "prompt": prompt,
            "temperature": temperature,
            "response": "",
            "token_count": 0,
            "time_to_first_token_sec": None,
            "total_latency_sec": None,
            "tokens_per_second": 0,
            "status": f"error: {str(e)}"
        }


def run_full_benchmark() -> list[dict]:
    results = []
    for model in AVAILABLE_MODELS:
        for prompt in BENCHMARK_PROMPTS:
            for temp in TEMPERATURE_SETTINGS:
                print(f"Running: {model} | temp={temp} | prompt='{prompt[:40]}...'")
                result = benchmark_model(model, prompt, temp)
                results.append(result)
    return results


def compare_models(prompt: str, temperature: float = 0.7) -> list[dict]:
    results = []
    for model in AVAILABLE_MODELS:
        result = benchmark_model(model, prompt, temperature)
        results.append(result)
    return results