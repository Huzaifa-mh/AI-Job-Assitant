
import asyncio
import random
import asyncio
from playwright.async_api import async_playwright

async def scan_form_fields(url: str) -> dict:
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=False,      # show browser so user sees what's happening
            slow_mo=300,         # slight delay so it looks intentional
        )

        context = await browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            ),
            viewport={"width": 1280, "height": 800},
        )

        page = await context.new_page()

        try:
            await page.goto(url, wait_until="domcontentloaded", timeout=30000)
            await page.wait_for_timeout(2000)  # let JS render

            # Extract all form fields
            fields = await page.evaluate("""
                () => {
                    const fields = [];
                    const seen   = new Set();

                    // Helper: get label for a field
                    function getLabel(el) {
                        // Try aria-label
                        if (el.getAttribute('aria-label'))
                            return el.getAttribute('aria-label').trim();

                        // Try associated <label> by id
                        if (el.id) {
                            const label = document.querySelector(`label[for="${el.id}"]`);
                            if (label) return label.innerText.trim();
                        }

                        // Try parent label
                        const parentLabel = el.closest('label');
                        if (parentLabel) return parentLabel.innerText.trim();

                        // Try previous sibling text
                        const prev = el.previousElementSibling;
                        if (prev && prev.tagName === 'LABEL')
                            return prev.innerText.trim();

                        // Try placeholder
                        if (el.placeholder) return el.placeholder.trim();

                        // Try name attribute
                        if (el.name) return el.name.trim();

                        return '';
                    }

                    // Scan input fields
                    document.querySelectorAll('input').forEach(el => {
                        const type = el.type?.toLowerCase();
                        if (['hidden', 'submit', 'button', 'image', 'reset'].includes(type)) return;
                        const key = el.name || el.id || el.placeholder;
                        if (!key || seen.has(key)) return;
                        seen.add(key);
                        fields.push({
                            tag:         'input',
                            type:        type || 'text',
                            name:        el.name        || '',
                            id:          el.id          || '',
                            placeholder: el.placeholder || '',
                            label:       getLabel(el),
                            required:    el.required,
                            value:       el.value       || '',
                        });
                    });

                    // Scan textareas
                    document.querySelectorAll('textarea').forEach(el => {
                        const key = el.name || el.id || el.placeholder;
                        if (!key || seen.has(key)) return;
                        seen.add(key);
                        fields.push({
                            tag:         'textarea',
                            type:        'textarea',
                            name:        el.name        || '',
                            id:          el.id          || '',
                            placeholder: el.placeholder || '',
                            label:       getLabel(el),
                            required:    el.required,
                            value:       '',
                        });
                    });

                    // Scan select dropdowns
                    document.querySelectorAll('select').forEach(el => {
                        const key = el.name || el.id;
                        if (!key || seen.has(key)) return;
                        seen.add(key);
                        const options = Array.from(el.options).map(o => ({
                            value: o.value,
                            text:  o.text.trim(),
                        }));
                        fields.push({
                            tag:      'select',
                            type:     'select',
                            name:     el.name || '',
                            id:       el.id   || '',
                            label:    getLabel(el),
                            required: el.required,
                            options,
                            value:    '',
                        });
                    });

                    // Scan file upload fields
                    document.querySelectorAll('input[type="file"]').forEach(el => {
                        const key = el.name || el.id;
                        if (!key || seen.has(key)) return;
                        seen.add(key);
                        fields.push({
                            tag:      'input',
                            type:     'file',
                            name:     el.name  || '',
                            id:       el.id    || '',
                            label:    getLabel(el),
                            required: el.required,
                            accept:   el.accept || '',
                        });
                    });

                    return fields;
                }
            """)

            # Get page title for context
            title = await page.title()

            await browser.close()

            return {
                "success":     True,
                "page_title":  title,
                "url":         url,
                "field_count": len(fields),
                "fields":      fields,
            }

        except Exception as e:
            await browser.close()
            return {
                "success": False,
                "error":   str(e),
                "url":     url,
                "fields":  [],
            }


async def human_delay(min_ms=80, max_ms=200):
    """Random delay to simulate human reaction time"""
    await asyncio.sleep(random.uniform(min_ms, max_ms) / 1000)

async def move_mouse_naturally(page, target_x, target_y):
    """Move mouse in a curved path instead of teleporting"""
    current   = await page.evaluate("() => ({ x: window.innerWidth/2, y: window.innerHeight/2 })")
    steps     = random.randint(8, 15)
    start_x   = current["x"]
    start_y   = current["y"]

    for i in range(steps):
        progress = (i + 1) / steps
        # Add slight curve/wobble to the path
        wobble_x = random.uniform(-5, 5)
        wobble_y = random.uniform(-5, 5)
        mid_x    = start_x + (target_x - start_x) * progress + wobble_x
        mid_y    = start_y + (target_y - start_y) * progress + wobble_y
        await page.mouse.move(mid_x, mid_y)
        await asyncio.sleep(random.uniform(0.01, 0.03))

async def human_type(page, selector, text):
    """Type text with human-like variable speed and occasional pauses"""
    element = page.locator(selector).first
    await element.click()
    await human_delay(100, 300)

    # Clear existing value like a human (select all + delete)
    await page.keyboard.press("Control+a")
    await human_delay(50, 100)
    await page.keyboard.press("Backspace")
    await human_delay(80, 150)

    for char in text:
        await page.keyboard.type(char)

        # Variable typing speed — humans don't type at constant speed
        if char in (" ", ",", ".", "@"):
            # Slight pause after punctuation/spaces
            await asyncio.sleep(random.uniform(0.1, 0.25))
        elif random.random() < 0.08:
            # Occasional longer pause (thinking, distraction)
            await asyncio.sleep(random.uniform(0.2, 0.5))
        else:
            await asyncio.sleep(random.uniform(0.04, 0.12))

    # Blur the field after typing (humans tab away or click elsewhere)
    await element.blur()
    await human_delay(100, 250)

async def random_scroll(page):
    """Scroll around naturally like a human reading the page"""
    scroll_amount = random.randint(100, 300)
    await page.evaluate(f"window.scrollBy(0, {scroll_amount})")
    await human_delay(300, 600)
    await page.evaluate(f"window.scrollBy(0, -{scroll_amount // 2})")
    await human_delay(200, 400)

async def fill_form_fields(url: str, mapped_fields: list) -> dict:
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=False,
            slow_mo=0,    # We handle delays manually now — more realistic than slow_mo
            args=[
                # Remove automation fingerprint flags
                "--disable-blink-features=AutomationControlled",
                "--disable-infobars",
                "--start-maximized",
                "--no-sandbox",
                "--disable-web-security",
            ],
        )

        context = await browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            ),
            viewport={"width": 1280, "height": 800},
            # Fake real browser permissions
            permissions=["geolocation"],
            locale="en-US",
            timezone_id="Asia/Karachi",
        )

        # Remove webdriver flag — key fix for reCAPTCHA detection
        await context.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
            Object.defineProperty(navigator, 'plugins',   { get: () => [1, 2, 3] });
            Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
            window.chrome = { runtime: {} };
        """)

        page = await context.new_page()

        try:
            # 1. Navigate to page
            await page.goto(url, wait_until="domcontentloaded", timeout=30000)

            # 2. Simulate human landing on the page
            # — move mouse around randomly, scroll a bit, wait like reading
            await human_delay(1500, 2500)
            await page.mouse.move(
                random.randint(300, 800),
                random.randint(200, 400)
            )
            await human_delay(500, 1000)
            await random_scroll(page)
            await human_delay(800, 1500)

            filled  = []
            skipped = []

            for field in mapped_fields:
                name       = field.get("name", "")
                value      = field.get("suggested_value", "")
                confidence = field.get("confidence", "low")
                label      = field.get("label", "")
                field_type = field.get("type", "text")

                if not value or confidence == "skip":
                    skipped.append({"name": name, "label": label, "reason": "No value or skip"})
                    continue

                selector = f'[name="{name}"]'

                try:
                    await page.wait_for_selector(selector, timeout=4000)

                    # Get element position for natural mouse movement
                    box = await page.locator(selector).first.bounding_box()
                    if box:
                        # Move mouse to field naturally before clicking
                        target_x = box["x"] + box["width"]  / 2 + random.uniform(-5, 5)
                        target_y = box["y"] + box["height"] / 2 + random.uniform(-3, 3)
                        await move_mouse_naturally(page, target_x, target_y)
                        await human_delay(100, 200)

                    # Fill based on field type
                    if field_type == "textarea":
                        await human_type(page, selector, value)

                    elif field_type == "select":
                        await page.locator(selector).first.select_option(label=value)
                        await human_delay(200, 400)

                    else:
                        await human_type(page, selector, value)

                    # Highlight filled field green so user can see it
                    await page.evaluate(
                        """(sel) => {
                            const el = document.querySelector('[name="' + sel + '"]');
                            if (el) {
                                el.style.backgroundColor = '#d4edda';
                                el.style.border          = '2px solid #28a745';
                                el.style.borderRadius    = '4px';
                            }
                        }""",
                        name
                    )

                    filled.append({
                        "name":       name,
                        "label":      label,
                        "value":      value,
                        "confidence": confidence,
                    })

                    # Random pause between fields — humans don't fill forms at robotic speed
                    await human_delay(400, 900)

                    # Occasionally move mouse away between fields (humans look around)
                    if random.random() < 0.4:
                        await page.mouse.move(
                            random.randint(100, 600),
                            random.randint(100, 500)
                        )
                        await human_delay(200, 500)

                except Exception as field_error:
                    skipped.append({
                        "name":   name,
                        "label":  label,
                        "reason": str(field_error)[:80],
                    })

            # 3. After filling — scroll back to top so user sees full form
            await page.evaluate("window.scrollTo({ top: 0, behavior: 'smooth' })")
            await human_delay(500, 800)

            print(f"\n✅ Form filled successfully!")
            print(f"   Filled:  {len(filled)} fields (highlighted green)")
            print(f"   Skipped: {len(skipped)} fields")
            print(f"\n⚠️  Please:")
            print(f"   1. Fill salary fields manually")
            print(f"   2. Solve the reCAPTCHA")
            print(f"   3. Click Submit when ready")
            print(f"   4. Close the browser when done\n")

            # 4. Keep browser open — wait for user to submit and close
            await page.wait_for_event("close", timeout=600000)

            return {
                "success":       True,
                "filled_count":  len(filled),
                "skipped_count": len(skipped),
                "filled":        filled,
                "skipped":       skipped,
                "message":       "Form filled. User completed manual review.",
            }

        except Exception as e:
            error_msg = str(e)
            if "Timeout" in error_msg and "close" in error_msg:
                return {
                    "success":       True,
                    "filled_count":  len(filled)  if "filled"  in locals() else 0,
                    "skipped_count": len(skipped) if "skipped" in locals() else 0,
                    "filled":        filled        if "filled"  in locals() else [],
                    "skipped":       skipped       if "skipped" in locals() else [],
                    "note":          "Browser closed by user",
                }
            await browser.close()
            return {
                "success": False,
                "error":   error_msg,
                "filled":  [],
                "skipped": [],
            }