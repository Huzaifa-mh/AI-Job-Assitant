from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from scanner import scan_form_fields
from blocker import is_blocked
import asyncio

app = FastAPI()

class ScanRequest(BaseModel):
    url: str

@app.post("/scan-form")
async def scan_form(data: ScanRequest):
    # 1. Check if URL is blocked
    blocked, domain = is_blocked(data.url)
    if blocked:
        return {
            "success":   False,
            "blocked":   True,
            "domain":    domain,
            "message":   f"Automated form filling is not supported for {domain} due to their bot protection policies.",
            "fields":    [],
        }

    # 2. Validate URL
    if not data.url.startswith("http"):
        raise HTTPException(status_code=400, detail="Invalid URL")

    # 3. Scan the form
    result = await scan_form_fields(data.url)

    if not result["success"]:
        return {
            "success": False,
            "blocked": False,
            "message": f"Could not load page: {result.get('error', 'Unknown error')}",
            "fields":  [],
        }

    if not result["fields"]:
        return {
            "success": False,
            "blocked": False,
            "message": "No form fields found on this page. The application form may require login first.",
            "fields":  [],
        }

    return result


@app.get("/health")
async def health():
    return {"status": "Playwright service running on port 8001"}