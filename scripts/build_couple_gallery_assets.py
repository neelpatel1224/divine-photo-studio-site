import os
import json
from PIL import Image, ImageOps

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(BASE_DIR, "assets", "images", "06 Wedding")
OUT_DIR = os.path.join(BASE_DIR, "assets", "images", "couples", "hitanshi-vaidik")

os.makedirs(OUT_DIR, exist_ok=True)

# List all valid image files sorted
files = [
    f for f in sorted(os.listdir(SRC_DIR))
    if os.path.isfile(os.path.join(SRC_DIR, f)) and f.lower().endswith(('.jpg', '.jpeg', '.png'))
]

print(f"Total available photos: {len(files)}")

# Select cover image (DSC00658.JPG is a grand landscape ceremony frame, or DSC00650.JPG)
cover_source = os.path.join(SRC_DIR, "DSC00658.JPG")
if not os.path.exists(cover_source):
    cover_source = os.path.join(SRC_DIR, files[0])

# Process Cover
print("Processing Cover Image...")
with Image.open(cover_source) as im:
    im = ImageOps.exif_transpose(im)
    if im.mode in ("RGBA", "P"):
        im = im.convert("RGB")
    
    # 1920w
    w_cov = min(1920, im.width)
    h_cov = int(im.height * (w_cov / im.width))
    im_cov_large = im.resize((w_cov, h_cov), Image.Resampling.LANCZOS)
    im_cov_large.save(os.path.join(OUT_DIR, "cover.webp"), "WEBP", quality=86, method=6)
    
    # 960w
    w_cov_sm = min(960, im.width)
    h_cov_sm = int(im.height * (w_cov_sm / im.width))
    im_cov_small = im.resize((w_cov_sm, h_cov_sm), Image.Resampling.LANCZOS)
    im_cov_small.save(os.path.join(OUT_DIR, "cover-900.webp"), "WEBP", quality=84, method=6)
    print(f"[OK] Cover saved: {w_cov}x{h_cov} & {w_cov_sm}x{h_cov_sm}")

# We select 64 photos to preserve full ceremony story in original sequence (Rule 46)
selected_gallery_files = files[:64]
manifest = []

print(f"Processing {len(selected_gallery_files)} gallery photos with natural aspect ratios...")

for idx, fname in enumerate(selected_gallery_files):
    num_str = f"{idx + 1:02d}"
    src_path = os.path.join(SRC_DIR, fname)
    
    with Image.open(src_path) as im:
        im = ImageOps.exif_transpose(im)
        if im.mode in ("RGBA", "P"):
            im = im.convert("RGB")
            
        orig_w, orig_h = im.size
        is_landscape = orig_w > orig_h
        
        # Display/Viewer variant (max dimension 1500)
        max_display = 1500
        if is_landscape:
            disp_w = min(max_display, orig_w)
            disp_h = int(orig_h * (disp_w / orig_w))
        else:
            disp_h = min(max_display, orig_h)
            disp_w = int(orig_w * (disp_h / orig_h))
            
        im_display = im.resize((disp_w, disp_h), Image.Resampling.LANCZOS)
        display_name = f"gallery-{num_str}.webp"
        im_display.save(os.path.join(OUT_DIR, display_name), "WEBP", quality=86, method=6)
        
        # Grid thumbnail variant (max dimension 720)
        max_thumb = 720
        if is_landscape:
            thumb_w = min(max_thumb, orig_w)
            thumb_h = int(orig_h * (thumb_w / orig_w))
        else:
            thumb_h = min(max_thumb, orig_h)
            thumb_w = int(orig_w * (thumb_h / orig_h))
            
        im_thumb = im.resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
        thumb_name = f"gallery-{num_str}-thumb.webp"
        im_thumb.save(os.path.join(OUT_DIR, thumb_name), "WEBP", quality=82, method=6)
        
        entry = {
            "index": idx + 1,
            "filename": display_name,
            "thumb": thumb_name,
            "origName": fname,
            "width": disp_w,
            "height": disp_h,
            "aspectRatio": f"{disp_w}/{disp_h}",
            "orientation": "landscape" if is_landscape else "portrait",
            "alt": f"Wedding ceremony photograph {num_str} of Hitanshi and Vaidik - Divine Photo Studio"
        }
        manifest.append(entry)
        
        if (idx + 1) % 10 == 0 or (idx + 1) == len(selected_gallery_files):
            print(f"  Processed {idx + 1}/{len(selected_gallery_files)}: {display_name} ({disp_w}x{disp_h})")

manifest_path = os.path.join(OUT_DIR, "manifest.json")
with open(manifest_path, "w", encoding="utf-8") as fp:
    json.dump(manifest, fp, indent=2)

print(f"[OK] Manifest saved with {len(manifest)} items at {manifest_path}")
