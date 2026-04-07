import os
from PIL import Image

# ==========================================
# CONFIGURATION
# ==========================================

# Set to True if you want to overwrite existing small webp images.
# Set to False if you want to skip images that have already been processed.
OVERWRITE_EXISTING = False

# The maximum width for the web-ready images.
MAX_WIDTH = 640

# The name of the folder containing all your images.
CONTENT_DIR = "content"
# ==========================================

def process_images(base_dir):
    # Walk through the directory tree
    for root, dirs, files in os.walk(base_dir):
        for filename in files:
            # Check for standard image types (you can add more if needed)
            if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                filepath = os.path.join(root, filename)
                
                # Strip the old extension and add _small.webp
                name, _ = os.path.splitext(filename)
                new_filename = f"{name}_small.webp"
                
                # Save right next to the original
                new_filepath = os.path.join(root, new_filename)
                
                # Check overwrite condition
                if not OVERWRITE_EXISTING and os.path.exists(new_filepath):
                    print(f"Skipped: {new_filename} (Already exists)")
                    continue
                
                # Open and process the image
                try:
                    with Image.open(filepath) as img:
                        # Convert color palettes to truecolor so WebP compression works properly
                        if img.mode in ("RGBA", "P"):
                            img = img.convert("RGBA")
                        elif img.mode != "RGB":
                            img = img.convert("RGB")
                            
                        # Resize if it's larger than the target width
                        if img.width > MAX_WIDTH:
                            ratio = MAX_WIDTH / float(img.width)
                            new_height = int((float(img.height) * float(ratio)))
                            img = img.resize((MAX_WIDTH, new_height), Image.Resampling.LANCZOS)
                        
                        # Save the final file
                        img.save(new_filepath, "WEBP", quality=80)
                        print(f"Created: {new_filepath}")
                except Exception as e:
                    print(f"Error processing {filename}: {e}")

if __name__ == "__main__":
    # Ensure we look in the right place relative to where the script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    target_path = os.path.join(script_dir, CONTENT_DIR)
    
    if os.path.exists(target_path):
        print(f"Scanning for images in: {target_path}")
        process_images(target_path)
        print("Finished processing all images!")
    else:
        print(f"Error: The directory '{CONTENT_DIR}' was not found.")
        print("Please make sure you put this script next to the 'content' folder.")
