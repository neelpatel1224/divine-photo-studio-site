import os
from html.parser import HTMLParser

class CoupleGalleryParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.h1_count = 0
        self.h1_text = ""
        self.current_tag = None
        self.images = []
        self.ids = []
        self.nav_active = None

    def handle_starttag(self, tag, attrs):
        self.current_tag = tag
        attr_dict = dict(attrs)
        
        if "id" in attr_dict:
            self.ids.append(attr_dict["id"])
            
        if tag == "h1":
            self.h1_count += 1
            
        if tag == "img":
            self.images.append(attr_dict)
            
        if tag == "a":
            classes = attr_dict.get("class", "").split()
            if "cgl-nav__link--back" in classes or "main-nav__link--active" in classes:
                self.nav_active = attr_dict

    def handle_endtag(self, tag):
        self.current_tag = None

    def handle_data(self, data):
        data_clean = data.strip()
        if not data_clean:
            return
        if self.current_tag == "h1":
            self.h1_text += (" " if self.h1_text else "") + data_clean

def verify():
    errors = []
    warnings = []
    
    html_path = "hitanshi-vaidik.html"
    if not os.path.exists(html_path):
        errors.append(f"{html_path} does not exist!")
        return errors, warnings
        
    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()
        
    parser = CoupleGalleryParser()
    parser.feed(html)
    
    # 1. H1
    if parser.h1_count != 1:
        errors.append(f"Expected 1 H1, found {parser.h1_count}")
    else:
        print(f"[OK] Single H1: '{parser.h1_text}'")
        
    # 2. Images
    print(f"[OK] Total images in {html_path}: {len(parser.images)}")
    missing_imgs = 0
    for img in parser.images:
        src = img.get("src", "")
        if not src:
            classes = img.get("class", "")
            if "cgl-viewer__img" not in classes:
                errors.append(f"Image without src: {img}")
            continue
        if not src.startswith("http") and not src.startswith("//"):
            if not os.path.exists(os.path.normpath(src)):
                errors.append(f"Missing image file: {src}")
                missing_imgs += 1
                
        srcset = img.get("srcset", "")
        if srcset:
            parts = [p.strip().split()[0] for p in srcset.split(",")]
            for p in parts:
                if not os.path.exists(os.path.normpath(p)):
                    errors.append(f"Missing srcset file: {p}")
                    missing_imgs += 1
                    
        alt = img.get("alt")
        classes = img.get("class", "")
        if alt is None and "cgl-viewer__img" not in classes:
            warnings.append(f"Image missing alt attribute: {src}")
            
    if missing_imgs == 0:
        print("[OK] All image sources and srcset variants exist on disk!")
        
    # 3. IDs
    duplicates = [i for i in parser.ids if parser.ids.count(i) > 1]
    if duplicates:
        errors.append(f"Duplicate IDs: {set(duplicates)}")
    else:
        print(f"[OK] All {len(parser.ids)} IDs are unique.")
        
    # 4. Nav active
    if not parser.nav_active:
        errors.append("No active link found in navbar!")
    else:
        href = parser.nav_active.get("href")
        if href != "couple-stories.html":
            errors.append(f"Active nav link is not couple-stories.html: {href}")
        else:
            print(f"[OK] Active navbar item correctly set to: {href}")
            
    # 5. Check couple-stories.html link
    with open("couple-stories.html", "r", encoding="utf-8") as f:
        cs_html = f.read()
    if 'href="hitanshi-vaidik.html"' not in cs_html:
        errors.append("couple-stories.html does not link to hitanshi-vaidik.html!")
    else:
        print("[OK] couple-stories.html contains direct tile link to hitanshi-vaidik.html.")
        
    return errors, warnings

if __name__ == "__main__":
    errs, warns = verify()
    print("\n--- AUDIT SUMMARY ---")
    if warns:
        print(f"Warnings ({len(warns)}):")
        for w in warns:
            print(f"  [!] {w}")
    if errs:
        print(f"ERRORS ({len(errs)}):")
        for e in errs:
            print(f"  [X] {e}")
    else:
        print("ALL AUDIT CHECKS PASSED PERFECTLY!")
