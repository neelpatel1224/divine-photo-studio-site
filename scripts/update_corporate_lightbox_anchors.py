import re

with open("corporate.html", "r", encoding="utf-8") as f:
    content = f.read()

# Pattern for featured frame:
# <div class="corp-featured__frame corp-frame corp-frame--16-10 corp-interactive-item" ...>
#    <img ...>
# </div>
featured_old = """                <div class="corp-featured__frame corp-frame corp-frame--16-10 corp-interactive-item"
                     data-reveal
                     data-lightbox-src="assets/images/corporate/featured.webp"
                     data-lightbox-caption="Keynote and leadership forum in session"
                     tabindex="0"
                     role="button"
                     aria-label="View featured story photograph in lightbox">
                    <img class="corp-image"
                         src="assets/images/corporate/featured.webp"
                         srcset="assets/images/corporate/featured-900.webp 900w, assets/images/corporate/featured.webp 1800w"
                         sizes="(max-width: 768px) 100vw, 86vw"
                         alt="Executive auditorium and stage presentation during an annual corporate forum"
                         width="1800" height="1125"
                         loading="lazy"
                         decoding="async">
                </div>"""

featured_new = """                <div class="corp-featured__frame corp-frame corp-frame--16-10" data-reveal>
                    <a href="assets/images/corporate/featured.webp" data-archive-image aria-label="Enlarge photograph: Executive auditorium and stage presentation during an annual corporate forum">
                        <img class="corp-image"
                             src="assets/images/corporate/featured.webp"
                             srcset="assets/images/corporate/featured-900.webp 900w, assets/images/corporate/featured.webp 1800w"
                             sizes="(max-width: 768px) 100vw, 86vw"
                             alt="Executive auditorium and stage presentation during an annual corporate forum"
                             width="1800" height="1125"
                             loading="lazy"
                             decoding="async">
                    </a>
                </div>"""

content = content.replace(featured_old, featured_new)

# Pattern for figures:
# <figure class="corp-frame (RATIO) corp-interactive-item"\s*(data-reveal(?: [^>]*)?)\s*data-lightbox-src="([^"]+)"\s*data-lightbox-caption="([^"]+)"\s*tabindex="0" role="button" aria-label="[^"]*">\s*(<img [^>]+>)\s*</figure>

def repl_figure(match):
    ratio = match.group(1)
    reveal = match.group(2).strip()
    src = match.group(3)
    caption = match.group(4)
    img_tag = match.group(5)
    
    # Extract alt from img_tag
    alt_match = re.search(r'alt="([^"]+)"', img_tag)
    alt = alt_match.group(1) if alt_match else caption
    
    return f"""<figure class="corp-frame {ratio}" {reveal}>
                            <a href="{src}" data-archive-image aria-label="Enlarge photograph: {alt}">
                                {img_tag}
                            </a>
                        </figure>"""

pattern = r'<figure class="corp-frame (corp-frame--[^\s"]+) corp-interactive-item"\s*([^>]*?)data-lightbox-src="([^"]+)"\s*data-lightbox-caption="([^"]+)"\s*tabindex="0" role="button" aria-label="[^"]*">\s*(<img[^>]+>)\s*</figure>'

content = re.sub(pattern, repl_figure, content)

with open("corporate.html", "w", encoding="utf-8") as f:
    f.write(content)

print("[OK] Lightbox anchors updated in corporate.html")
