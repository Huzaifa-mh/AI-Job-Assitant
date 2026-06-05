import sys
import asyncio
if sys.platform == "win32":
    asyncio.set_event_loop_policy(
        asyncio.WindowsProactorEventLoopPolicy()
    )

from fastapi import FastAPI
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
            "success": False,
            "blocked": True,
            "domain":  domain,
            "message": f"Automated form filling is not supported for {domain} due to their bot protection policies.",
            "fields":  [],
        }

    if not data.url.startswith("http"):
        raise HTTPException(status_code=400, detail="Invalid URL")

    # 2. Scan the page
    result = await scan_form_fields(data.url)

    if not result["success"]:
        return {
            "success": False,
            "blocked": False,
            "message": f"Could not load page: {result.get('error', 'Unknown error')}",
            "fields":  [],
        }

    # 3. Filter out skippable fields (reCAPTCHA, file uploads, hidden tokens)
    all_fields      = result.get("fields", [])
    fillable_fields = [f for f in all_fields if not should_skip_field(f)]
    skipped_fields  = [f for f in all_fields if should_skip_field(f)]

    if not fillable_fields:
        return {
            "success": False,
            "blocked": False,
            "message": "No fillable form fields found on this page.",
            "fields":  [],
        }

    return {
        "success":        True,
        "page_title":     result["page_title"],
        "url":            result["url"],
        "field_count":    len(fillable_fields),
        "skipped_count":  len(skipped_fields),
        "skipped_reason": "reCAPTCHA and file upload fields require manual input",
        "fields":         fillable_fields,
    }

# debugging
@app.get("/loop")
async def loop_info():
    loop = asyncio.get_running_loop()

    return {
        "loop_type": str(type(loop)),
    }

@app.on_event("startup")
async def startup():
    loop = asyncio.get_running_loop()
    print("LOOP TYPE:", type(loop))

@app.get("/health")
async def health():
    return {"status": "Playwright service running on port 8001"}