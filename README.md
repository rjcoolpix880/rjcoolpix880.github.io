# Image Resizing Utility

This script automatically finds all `.jpg`, `.jpeg`, and `.png` images inside your `content` folder, creates `small` subfolders next to them, and saves lightning-fast `_small.webp` versions to display on your web pages.

### Initial Setup (For Windows)
You only need to do this once. Python requires a library called `Pillow` to interact with images.

1. Open your computer's terminal (Command Prompt or PowerShell) and make sure you are in the project folder.
2. Install the image library by pasting and running this command:
   ```cmd
   pip install Pillow
   ```

### How to use the script

1. Open `resize_images.py` in your code editor.
2. At the very top, you will see a setting: `OVERWRITE_EXISTING = False`. 
   - Leave it as `False` if you just added a few new photos and want the script to finish instantly by skipping older photos that it has already processed.
   - Change it to `True` if you changed the width parameter and want to forcefully regenerate everything.
3. Run the script! You can do this by running this command in your terminal while inside this project folder:
   ```cmd
   python resize_images.py
   ```
