from PIL import Image
import os
import sys

def compress_image(input_path, output_path=None, quality=70, max_width=180):
    """
    Compress an image while preserving transparency when possible.
    Works for PNGs (with alpha) and JPEGs.
    """
    if output_path is None:
        name, ext = os.path.splitext(input_path)
        output_path = f"{name}_compressed{ext}"

    with Image.open(input_path) as img:
        # Resize if larger than max_width
        if img.width > max_width:
            ratio = max_width / float(img.width)
            new_height = int(img.height * ratio)
            img = img.resize((max_width, new_height), Image.LANCZOS)

        # Handle PNGs with transparency
        if img.mode in ("RGBA", "LA"):
            # Preserve transparency
            img.save(output_path, optimize=True)
        else:
            # For JPEG or others, convert to RGB
            if img.mode != "RGB":
                img = img.convert("RGB")
            img.save(output_path, optimize=True, quality=quality)

        print(f"✅ Compressed image saved to: {output_path}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 compress_image.py <image_path> [quality]")
    else:
        image_path = sys.argv[1]
        quality = int(sys.argv[2]) if len(sys.argv) > 2 else 70
        compress_image(image_path, quality=quality)
