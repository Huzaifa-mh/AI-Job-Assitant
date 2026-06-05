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