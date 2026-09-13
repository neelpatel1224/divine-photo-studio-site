import os
import re
from html.parser import HTMLParser

class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.h1_count = 0
        self.h1_text = ""
        self.h2_list = []
        self.current_tag = None
        self.images = []
        self.ids = []
        self.nav_active = None
        self.drop_active = None

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
            if "main-nav__link--active" in classes:
                self.nav_active = attr_dict
            if "dropdown-menu__link--active" in classes:
                self.drop_active = attr_dict

    def handle_endtag(self, tag):
        self.current_tag = None

    def handle_data(self, data):
        data_clean = data.strip()
        if not data_clean:
            return
        if self.current_tag == "h1":
            self.h1_text += (" " if self.h1_text else "") + data_clean
        elif self.current_tag == "h2":
            self.h2_list.append(data_clean)

def verify():
    errors = []
    warnings = []
    
    corp_path = "corporate.html"
    if not os.path.exists(corp_path):
        errors.append("corporate.html does not exist!")
        return errors, warnings
        
    with open(corp_path, "r", encoding="utf-8") as f:
        html = f.read()
        
    parser = PageParser()
    parser.feed(html)
    
    # 1. H1
    if parser.h1_count != 1:
        errors.append(f"Expected 1 H1, found {parser.h1_count}")
    else:
        print(f"[OK] Single H1: '{parser.h1_text}'")
        
    # 2. H2s
    print(f"[OK] Found H2 elements: {parser.h2_list}")
    
    # 3. Images
    print(f"[OK] Total images in corporate.html: {len(parser.images)}")
    missing_imgs = 0
    for img in parser.images:
        src = img.get("src", "")
        if not src:
            classes = img.get("class", "")
            if "archive-lightbox__image" not in classes:
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
        if alt is None and "archive-lightbox__image" not in classes:
            warnings.append(f"Image missing alt attribute: {src}")
            
    if missing_imgs == 0:
        print("[OK] All image sources and srcset variants exist on disk!")
        
    # 4. IDs
    duplicates = [i for i in parser.ids if parser.ids.count(i) > 1]
    if duplicates:
        errors.append(f"Duplicate IDs: {set(duplicates)}")
    else:
        print(f"[OK] All {len(parser.ids)} IDs are unique.")
        
    # 5. Nav active
    if not parser.nav_active:
        errors.append("No active link found in navbar!")
    else:
        print(f"[OK] Active navbar item href: {parser.nav_active.get('href')}")
        
    if not parser.drop_active:
        errors.append("No active link found in dropdown!")
    else:
        print(f"[OK] Active dropdown item href: {parser.drop_active.get('href')}")
        
    # 6. Check photography.html link and CTA
    with open("photography.html", "r", encoding="utf-8") as f:
        photo_html = f.read()
    if 'href="corporate.html"' not in photo_html:
        errors.append("photography.html does not link to corporate.html!")
    if 'VIEW ALL CORPORATE' not in photo_html:
        errors.append("photography.html does not contain 'VIEW ALL CORPORATE' CTA!")
    else:
        print("[OK] photography.html contains VIEW ALL CORPORATE CTA pointing to corporate.html.")
        
    # 7. Check services.html link and CTA
    with open("services.html", "r", encoding="utf-8") as f:
        serv_html = f.read()
    if 'href="corporate.html"' not in serv_html:
        errors.append("services.html does not link to corporate.html!")
    if 'EXPLORE CORPORATE' not in serv_html:
        errors.append("services.html does not contain 'EXPLORE CORPORATE' CTA!")
    else:
        print("[OK] services.html contains EXPLORE CORPORATE CTA pointing to corporate.html.")
        
    # 8. Check other HTML files
    html_files = [f for f in os.listdir(".") if f.endswith(".html")]
    for f in html_files:
        with open(f, "r", encoding="utf-8") as fp:
            c = fp.read()
        if 'class="dropdown-menu"' in c and 'href="corporate.html"' not in c:
            warnings.append(f"{f} dropdown does not point to corporate.html")
            
    return errors, warnings

if __name__ == "__main__":
    errs, warns = verify()
    print("\n--- SUMMARY ---")
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
