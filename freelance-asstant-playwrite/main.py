import asyncio
import sys

# Fix for Windows + Python 3.13 — must be set BEFORE any asyncio usage
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from scanner import scan_form_fields, fill_form_fields
from blocker import is_blocked, should_skip_field

app = FastAPI()

class ScanRequest(BaseModel):
    url: str

class FillRequest(BaseModel):
    url:           str
    mapped_fields: list

@app.post("/scan-form")
async def scan_form(data: ScanRequest):
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

    result = await scan_form_fields(data.url)

    if not result["success"]:
        return {
            "success": False,
            "blocked": False,
            "message": f"Could not load page: {result.get('error', 'Unknown error')}",
            "fields":  [],
        }

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

@app.post("/fill-form")
async def fill_form(data: FillRequest):
    blocked, domain = is_blocked(data.url)
    if blocked:
        return {
            "success": False,
            "blocked": True,
            "message": f"Form filling not supported for {domain}",
        }

    if not data.url.startswith("http"):
        raise HTTPException(status_code=400, detail="Invalid URL")

    fillable = [
        f for f in data.mapped_fields
        if f.get("suggested_value") and f.get("confidence") != "skip"
    ]

    if not fillable:
        return {
            "success": False,
            "message": "No fillable fields with values to fill",
        }

    result = await fill_form_fields(data.url, fillable)
    return result

@app.get("/health")
async def health():
    return {"status": "Playwright service running on port 8001"}