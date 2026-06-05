BLOCKED_DOMAINS = [
    "linkedin.com",
    "indeed.com",
    "glassdoor.com",
    "ziprecruiter.com",
    "monster.com",
    "careerbuilder.com",
]

# Fields we should never try to fill
SKIP_FIELD_NAMES = [
    "g-recaptcha-response",
    "recaptcha",
    "captcha",
    "csrf",
    "csrf_token",
    "_token",
    "__RequestVerificationToken",
]

SKIP_FIELD_TYPES = ["file"]  # user uploads resume manually

def is_blocked(url: str) -> tuple[bool, str]:
    url_lower = url.lower()
    for domain in BLOCKED_DOMAINS:
        if domain in url_lower:
            return True, domain
    return False, ""

def should_skip_field(field: dict) -> bool:
    name  = field.get("name",  "").lower()
    label = field.get("label", "").lower()
    ftype = field.get("type",  "").lower()

    if ftype in SKIP_FIELD_TYPES:
        return True

    for skip in SKIP_FIELD_NAMES:
        if skip in name or skip in label:
            return True

    return False