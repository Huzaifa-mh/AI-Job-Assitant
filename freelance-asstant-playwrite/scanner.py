from playwright.async_api import async_playwright
import asyncio

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
            
async def fill_form_fields(url: str, mapped_fields: list) -> dict:
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=False,   # MUST be visible so user can review and submit
            slow_mo=500,      # slowed down so user can see each field being filled
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
            await page.wait_for_timeout(2000)  # let JS render fully

            filled  = []
            skipped = []

            for field in mapped_fields:
                name            = field.get("name", "")
                value           = field.get("suggested_value", "")
                confidence      = field.get("confidence", "low")
                label           = field.get("label", "")
                field_type      = field.get("type", "text")

                # Skip fields with no value or marked as skip
                if not value or confidence == "skip":
                    skipped.append({"name": name, "label": label, "reason": "No value or marked skip"})
                    continue

                # Build selector — try name first, then id
                selector = f'[name="{name}"]'

                try:
                    # Wait for field to exist on page
                    await page.wait_for_selector(selector, timeout=3000)
                    element = page.locator(selector).first

                    if field_type == "textarea":
                        await element.click()
                        await element.fill(value)

                    elif field_type == "select":
                        await element.select_option(label=value)

                    elif field_type in ("text", "email", "tel", "number", "url"):
                        await element.click()
                        await element.fill("")        # clear existing value first
                        await element.type(value, delay=50)  # type like a human

                    # Highlight filled field so user can see it clearly
                    await page.evaluate(
                        """(sel) => {
                            const el = document.querySelector(`[name="${sel}"]`);
                            if (el) {
                                el.style.backgroundColor = '#d4edda';
                                el.style.border = '2px solid #28a745';
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

                except Exception as field_error:
                    skipped.append({
                        "name":   name,
                        "label":  label,
                        "reason": f"Field not found on page: {str(field_error)[:80]}",
                    })

            # Scroll to top so user sees the filled form
            await page.evaluate("window.scrollTo(0, 0)")

            # Keep browser open — user must manually submit
            # We pause here and wait for the browser to be closed by the user
            print(f"\n✅ Form filled. Browser is open for review.")
            print(f"   Filled:  {len(filled)} fields")
            print(f"   Skipped: {len(skipped)} fields")
            print(f"   Please review and submit manually.\n")

            # Wait until user closes the browser (up to 10 minutes)
            await page.wait_for_event("close", timeout=600000)

            return {
                "success":       True,
                "filled_count":  len(filled),
                "skipped_count": len(skipped),
                "filled":        filled,
                "skipped":       skipped,
            }

        except Exception as e:
            # Don't close browser on error either — let user see what happened
            error_msg = str(e)
            if "Timeout" in error_msg and "close" in error_msg:
                # User closed the browser — this is normal
                return {
                    "success":      True,
                    "filled_count": len(filled) if 'filled' in locals() else 0,
                    "skipped_count":len(skipped) if 'skipped' in locals() else 0,
                    "filled":       filled  if 'filled'  in locals() else [],
                    "skipped":      skipped if 'skipped' in locals() else [],
                    "note":         "Browser closed by user",
                }
            await browser.close()
            return {
                "success": False,
                "error":   error_msg,
                "filled":  [],
                "skipped": [],
            }