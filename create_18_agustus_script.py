import os
import re

new_sources = '''DATE_SOURCES = [
    ("18-Aug", "SSA Simpanan 18 Agustus 2026.csv"),
]'''

base_dir = r"c:\xampp\htdocs\grafik-main\grafik-main"
folders = ["csv kcp", "csv konsol", "csv mikro", "csv ritel"]

for folder in folders:
    src = os.path.join(base_dir, folder, "update_28_30juni.py")
    dst = os.path.join(base_dir, folder, "update_18_agustus.py")
    
    with open(src, "r", encoding="utf-8") as f:
        content = f.read()
    
    content = re.sub(r"DATE_SOURCES\s*=\s*\[.*?\]", new_sources, content, flags=re.DOTALL)
    
    content = content.replace('28 - 30 Juni', '18 Agustus')
    content = content.replace('# Process June 28 to 30', '# Process August 18')
    
    with open(dst, "w", encoding="utf-8") as f:
        f.write(content)
    
    print(f"Created {dst}")
