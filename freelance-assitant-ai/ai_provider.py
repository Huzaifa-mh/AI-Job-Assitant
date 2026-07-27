import os
import time
import logging
import requests

logger = logging.getLogger(__name__)

OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
DEFAULT_AI_MODEL    = os.getenv("DEFAULT_AI_MODEL", "deepseek/deepseek-r1:free")


class AIProviderError(Exception):
    """Raised when OpenRouter (or every fallback model) fails to produce a response."""
    def __init__(self, message, status_code=502):
        super().__init__(message)
        self.status_code = status_code


def _fallback_models():
    raw = os.getenv("AI_MODEL_FALLBACKS", "")
    return [m.strip() for m in raw.split(",") if m.strip()]


def _call_model(model: str, prompt: str, api_key: str, messages: list = None,
                temperature: float = 0.7, top_p: float = None, max_tokens: int = None) -> str:
    start = time.time()
    payload = {
        "model":       model,
        "messages":    messages or [{"role": "user", "content": prompt}],
        "temperature": temperature,
    }
    if top_p is not None:
        payload["top_p"] = top_p
    if max_tokens is not None:
        payload["max_tokens"] = max_tokens

    try:
        response = requests.post(
            f"{OPENROUTER_BASE_URL}/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type":  "application/json",
                "HTTP-Referer":  os.getenv("APP_URL", "http://localhost:5173"),
                "X-Title":       os.getenv("APP_NAME", "AI Job Assistant"),
            },
            json=payload,
            timeout=60,
        )
    except requests.exceptions.Timeout:
        logger.error(f"AI provider timeout — model={model} time={time.time()-start:.2f}s")
        raise AIProviderError(f"Model '{model}' timed out.", status_code=504)
    except requests.exceptions.RequestException as e:
        logger.error(f"AI provider network error — model={model}: {str(e)}")
        raise AIProviderError("Network error contacting AI provider.", status_code=502)

    elapsed = time.time() - start

    if response.status_code == 200:
        data = response.json()
        logger.info(f"AI provider success — model={model} time={elapsed:.2f}s")
        return data["choices"][0]["message"]["content"].strip()

    logger.warning(f"AI provider error — model={model} status={response.status_code} time={elapsed:.2f}s")

    if response.status_code == 401:
        raise AIProviderError("AI provider authentication failed. Check OPENROUTER_API_KEY.", status_code=401)
    if response.status_code == 402:
        raise AIProviderError(f"Model '{model}' requires payment/credits.", status_code=402)
    if response.status_code == 429:
        raise AIProviderError(f"Model '{model}' is rate limited.", status_code=429)
    if response.status_code in (404, 400, 503):
        raise AIProviderError(f"Model '{model}' is unavailable.", status_code=response.status_code)

    raise AIProviderError(f"AI provider returned status {response.status_code}.", status_code=response.status_code)


def generate_content(prompt: str = None, model: str = None, messages: list = None,
                      temperature: float = 0.7, top_p: float = None, max_tokens: int = None) -> str:
    """
    Reusable entry point for every AI feature (cover letters, proposals, resume
    feedback, negotiation, career advice, ...). Tries DEFAULT_AI_MODEL first,
    then falls through AI_MODEL_FALLBACKS in order until one succeeds.

    Pass `prompt` for a single-turn completion, or `messages` (a full
    role/content list, e.g. system + conversation history + latest user turn)
    for multi-turn chat — `messages` takes precedence when both are given.
    """
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise AIProviderError("OPENROUTER_API_KEY is not set.", status_code=500)

    candidates = [model or DEFAULT_AI_MODEL] + _fallback_models()
    seen, models_to_try = set(), []
    for m in candidates:
        if m and m not in seen:
            seen.add(m)
            models_to_try.append(m)

    last_error = None
    for m in models_to_try:
        try:
            return _call_model(m, prompt, api_key, messages=messages,
                                temperature=temperature, top_p=top_p, max_tokens=max_tokens)
        except AIProviderError as e:
            last_error = e
            if e.status_code == 401:
                # Same key for every model — retrying won't help.
                raise
            continue

    raise last_error or AIProviderError("All AI models failed.", status_code=502)
