import os
import re

html_files = [f for f in os.listdir(".") if f.endswith(".html")]
print(f"Checking {len(html_files)} HTML files for corporate links...")

for f in html_files:
    with open(f, "r", encoding="utf-8") as fp:
        content = fp.read()

    orig = content

    # 1. Update dropdown links
    content = content.replace('href="photography.html#corporate"', 'href="corporate.html"')

    # In photography.html
    if f == "photography.html":
        # Dropdown link
        content = re.sub(
            r'(<li class="dropdown-menu__item"><a href=)"#corporate"( class="dropdown-menu__link">CORPORATE</a></li>)',
            r'\1"corporate.html"\2',
            content
        )
        # CTA update: Rule 52
        content = re.sub(
            r'<a href="contact\.html" class="chapter-cta">\s*ENQUIRE ABOUT CORPORATE\s*<span class="cta-arrow" aria-hidden="true">→</span>\s*</a>',
            '<a href="corporate.html" class="chapter-cta">\n                        VIEW ALL CORPORATE <span class="cta-arrow" aria-hidden="true">→</span>\n                    </a>',
            content
        )

    # In services.html: Rule 53
    if f == "services.html":
        content = content.replace(
            'href="photography.html#corporate" class="service-chapter__cta"',
            'href="corporate.html" class="service-chapter__cta"'
        )
        # Also check if it was already updated by the replace above
        content = re.sub(
            r'<a href="[^"]*" class="service-chapter__cta">\s*EXPLORE CORPORATE\s*<span class="cta-arrow" aria-hidden="true">→</span>\s*</a>',
            '<a href="corporate.html" class="service-chapter__cta">\n                                EXPLORE CORPORATE <span class="cta-arrow" aria-hidden="true">→</span>\n                            </a>',
            content
        )

    if content != orig:
        with open(f, "w", encoding="utf-8") as fp:
            fp.write(content)
        print(f"Updated {f}")
    else:
        print(f"No changes needed in {f}")
