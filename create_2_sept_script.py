import os
import re

new_sources = '''DATE_SOURCES = [
    ("2-Sep", "1788402584_SSA Simpanan 2 September 2026.csv"),
]'''

base_dir = r"c:\xampp\htdocs\grafik-main\grafik-main"
folders = ["csv kcp", "csv konsol", "csv mikro", "csv ritel"]

for folder in folders:
    src = os.path.join(base_dir, folder, "update_28_30juni.py")
    dst = os.path.join(base_dir, folder, "update_2_sept.py")
    
    with open(src, "r", encoding="utf-8") as f:
        content = f.read()
    
    content = re.sub(r"DATE_SOURCES\s*=\s*\[.*?\]", new_sources, content, flags=re.DOTALL)
    
    content = content.replace('28 - 30 Juni', '2 September')
    content = content.replace('# Process June 28 to 30', '# Process September 2')
    
    with open(dst, "w", encoding="utf-8") as f:
        f.write(content)
    
    print(f"Created {dst}")
