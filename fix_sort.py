import os
import re
from datetime import datetime

base_dir = r"c:\xampp\htdocs\grafik-main\grafik-main"
folders = ["csv kcp", "csv konsol", "csv mikro", "csv ritel"]
csv_files = ["tabungan.csv", "giro.csv", "depo.csv", "dpk.csv", "casa.csv"]

DATE_ROW_RE = re.compile(r"^\d{1,2}-[A-Za-z]{3};")

def date_key_from_line(line: str) -> datetime:
    label = line.split(";", 1)[0].strip()
    day_str, mon_str = label.split("-", 1)
    year = 2025 if mon_str.lower() == "dec" else 2026
    return datetime.strptime(f"{day_str}-{mon_str}-{year}", "%d-%b-%Y")

def keep_non_date_row(line: str) -> bool:
    stripped = line.strip()
    if not stripped:
        return False
    if stripped.startswith("NAMA UKER;"):
        return False
    if set(stripped) <= {";"}:
        return False
    return True

# Fix CSV sorting
for folder in folders:
    for filename in csv_files:
        csv_path = os.path.join(base_dir, folder, filename)
        if not os.path.exists(csv_path):
            continue
        
        with open(csv_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
        
        if not lines:
            continue
        
        header_line = lines[0]
        body = lines[1:]
        
        date_rows = [ln for ln in body if DATE_ROW_RE.match(ln)]
        non_date_rows = [ln for ln in body if not DATE_ROW_RE.match(ln) and keep_non_date_row(ln)]
        
        date_rows.sort(key=date_key_from_line)
        
        with open(csv_path, "w", encoding="utf-8") as f:
            f.write(header_line)
            for row in date_rows:
                f.write(row)
            for row in non_date_rows:
                f.write(row)
                
# Fix python scripts regex
for folder in folders:
    folder_path = os.path.join(base_dir, folder)
    if not os.path.exists(folder_path):
        continue
    for filename in os.listdir(folder_path):
        if filename.endswith(".py") and filename.startswith("update_"):
            script_path = os.path.join(folder_path, filename)
            with open(script_path, "r", encoding="utf-8") as f:
                content = f.read()
            
            new_content = content.replace(r'^\d{2}-[A-Za-z]{3};', r'^\d{1,2}-[A-Za-z]{3};')
            if new_content != content:
                with open(script_path, "w", encoding="utf-8") as f:
                    f.write(new_content)

print("Done fixing CSVs and Python scripts.")
