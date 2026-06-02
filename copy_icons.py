import shutil
import os

src = r"C:\Users\Hp\.gemini\antigravity\brain\c03c8c06-87b2-46f2-8781-c87a89837be6\remindly_logo_1779629559613.png"
dest_dir = r"C:\Users\Hp\Desktop\SafariStack\Remindly\Remindly\remindly-\public\icons"

if not os.path.exists(dest_dir):
    os.makedirs(dest_dir)

shutil.copy(src, os.path.join(dest_dir, "icon-192x192.png"))
shutil.copy(src, os.path.join(dest_dir, "icon-512x512.png"))
shutil.copy(src, os.path.join(dest_dir, "icon-72x72.png"))
shutil.copy(src, os.path.join(dest_dir, "icon.jpeg"))

print("Icons copied successfully")
