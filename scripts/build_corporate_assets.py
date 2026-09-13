import os
from PIL import Image, ImageOps

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_CORP = os.path.join(BASE_DIR, "assets", "images", "02 Corporate")
SRC_PHOTO = os.path.join(BASE_DIR, "assets", "images", "photography")
OUT_DIR = os.path.join(BASE_DIR, "assets", "images", "corporate")

os.makedirs(OUT_DIR, exist_ok=True)

# Image mapping configuration
# Format: (output_name, source_path, crop_ratio (w, h) or None)
IMAGES_CONFIG = [
    # Hero (16:10 or 3:2)
    ("hero", os.path.join(SRC_CORP, "DPS00823.JPG"), (16, 10)),
    
    # Featured Story (16:10)
    ("featured", os.path.join(SRC_CORP, "DPS01465.JPG"), (16, 10)),
    
    # Curated Gallery (12 frames)
    # Row 1: large landscape + portrait
    ("gallery-01", os.path.join(SRC_CORP, "DPS00913.JPG"), (16, 10)),
    ("gallery-02", os.path.join(SRC_CORP, "DPS00841.JPG"), (4, 5)),
    # Row 2: two balanced frames (3:2)
    ("gallery-03", os.path.join(SRC_CORP, "DPS01074.JPG"), (3, 2)),
    ("gallery-04", os.path.join(SRC_CORP, "DPS01174.JPG"), (3, 2)),
    # Row 3: full width event / workplace image (16:9)
    ("gallery-05", os.path.join(SRC_CORP, "DJI_0080.JPG"), (16, 9)),
    # Row 4: portrait + detail + interaction
    ("gallery-06", os.path.join(SRC_CORP, "DPS00927.JPG"), (4, 5)),
    ("gallery-07", os.path.join(SRC_CORP, "DPS00846.JPG"), (1, 1)),
    ("gallery-08", os.path.join(SRC_CORP, "DPS01095.JPG"), (3, 2)),
    # Row 5: two balanced frames
    ("gallery-09", os.path.join(SRC_CORP, "DPS00833.JPG"), (3, 2)),
    ("gallery-10", os.path.join(SRC_CORP, "DPS01007.JPG"), (3, 2)),
    # Row 6: closing landscape & vertical
    ("gallery-11", os.path.join(SRC_CORP, "DPS01512.JPG"), (16, 10)),
    ("gallery-12", os.path.join(SRC_CORP, "DPS00925.JPG"), (4, 5)),
    
    # People & Leadership (5 frames)
    ("people-01", os.path.join(SRC_CORP, "DPS00835.JPG"), (4, 5)),
    ("people-02", os.path.join(SRC_CORP, "DPS00843.JPG"), (4, 5)),
    ("people-03", os.path.join(SRC_CORP, "DPS01019.JPG"), (4, 5)),
    ("people-04", os.path.join(SRC_CORP, "DPS00922.JPG"), (4, 5)),
    ("people-05", os.path.join(SRC_CORP, "DPS01171.JPG"), (16, 9)),
    
    # Events & Environments (5 frames)
    ("event-01", os.path.join(SRC_CORP, "DPS01250.JPG"), (16, 9)),
    ("event-02", os.path.join(SRC_CORP, "DJI_0058.JPG"), (16, 10)),
    ("event-03", os.path.join(SRC_CORP, "DPS01523.JPG"), (3, 2)),
    ("event-04", os.path.join(SRC_CORP, "DPS01499.JPG"), (16, 10)),
    ("event-05", os.path.join(SRC_CORP, "DJI_0054.JPG"), (3, 2)),
    
    # More Corporate Stories (3 cards: 16:10 or 3:2)
    ("story-01", os.path.join(SRC_PHOTO, "corporate-01.jpg"), (16, 10)),
    ("story-02", os.path.join(SRC_CORP, "DJI_0070.JPG"), (16, 10)),
    ("story-03", os.path.join(SRC_PHOTO, "corporate-04.jpg"), (16, 10)),
]

def center_crop_to_ratio(img, target_w_ratio, target_h_ratio):
    orig_w, orig_h = img.size
    target_ratio = target_w_ratio / target_h_ratio
    orig_ratio = orig_w / orig_h
    
    if abs(target_ratio - orig_ratio) < 0.01:
        return img
        
    if orig_ratio > target_ratio:
        # Too wide, crop width
        new_w = int(orig_h * target_ratio)
        left = (orig_w - new_w) // 2
        return img.crop((left, 0, left + new_w, orig_h))
    else:
        # Too tall, crop height (slightly biased towards top 40% for portraits/speeches)
        new_h = int(orig_w / target_ratio)
        top = int((orig_h - new_h) * 0.35)
        return img.crop((0, top, orig_w, top + new_h))

def process_images():
    print(f"Processing {len(IMAGES_CONFIG)} image sets...")
    for name, src_path, ratio in IMAGES_CONFIG:
        if not os.path.exists(src_path):
            print(f"WARNING: Source missing: {src_path}")
            continue
            
        with Image.open(src_path) as im:
            im = ImageOps.exif_transpose(im)
            if im.mode in ("RGBA", "P"):
                im = im.convert("RGB")
                
            if ratio:
                im = center_crop_to_ratio(im, ratio[0], ratio[1])
                
            # Large variant: 1800w (or orig if smaller)
            large_w = min(1800, im.width)
            large_h = int(im.height * (large_w / im.width))
            im_large = im.resize((large_w, large_h), Image.Resampling.LANCZOS)
            out_large = os.path.join(OUT_DIR, f"{name}.webp")
            im_large.save(out_large, "WEBP", quality=84, method=6)
            
            # Small variant: 900w
            small_w = min(900, im.width)
            small_h = int(im.height * (small_w / im.width))
            im_small = im.resize((small_w, small_h), Image.Resampling.LANCZOS)
            out_small = os.path.join(OUT_DIR, f"{name}-900.webp")
            im_small.save(out_small, "WEBP", quality=82, method=6)
            
            print(f"[OK] Saved {name}.webp ({large_w}x{large_h}) & -900.webp ({small_w}x{small_h})")

if __name__ == "__main__":
    process_images()
