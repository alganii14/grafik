import csv
from pathlib import Path

# Mapping kode cabang ke nama kolom di CSV mikro
BRANCH_MAPPING = {
    25: "KC Garut",
    28: "KC Indramayu",
    46: "KC Majalengka",
    75: "KC Purwakarta",
    92: "KC Sukabumi",
    94: "KC Sumedang",
    100: "KC Tasikmalaya",
    104: "KC Ciamis",
    105: "KC Cianjur",
    107: "KC Cirebon Kartini",
    123: "KC Subang",
    132: "KC Majalaya",
    133: "KC Kuningan",
    137: "KC Cimahi",
    161: "KC Singaparna",
    162: "KC Banjar",
    165: "KC Jatibarang",
    181: "KC Cibadak",
    286: "KC Bandung Dewi Sartika",
    337: "KC Bandung Naripan",
    354: "KC Bandung A.H. Nasution",
    355: "KC Pamanukan",
    389: "KC Bandung Martadinata",
    401: "KC Bandung Kopo",
    405: "KC Bandung Dago",
    406: "KC Cirebon Gunung Jati",
    407: "KC Bandung Sukarno Hatta",
    408: "KC Bandung Setiabudi",
    544: "KC Soreang",
}

def parse_number(value: str) -> float:
    """Parse number - handles European format (comma=decimal, period=thousands)"""
    if value is None or value.strip() in ('', '-', '- '):
        return 0.0
    
    s = str(value).strip().replace(' ', '')
    # Replace European format
    s = s.replace('.', '').replace(',', '.')
    
    try:
        return float(s)
    except:
        return 0.0

def format_decimal(value: float) -> str:
    """Format as decimal with 2 places (European: comma for decimal, period for thousands)"""
    s = f"{value:,.2f}"
    return s.replace(',', 'X').replace('.', ',').replace('X', '.')

def parse_ssa_file(filepath) -> dict:
    """Parse SSA file and return dict {branch_name: {depo, giro, tabungan, dpk, casa}}"""
    data = {}
    
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.reader(f, delimiter=';')
        next(reader, None)  # Skip header
        
        for row in reader:
            if len(row) < 5:
                continue
            
            first_col = row[0].strip()
            
            # Skip grand total rows
            if 'grand' in first_col.lower() or first_col.lower() == 'grand total':
                continue
            
            try:
                code = int(first_col)
            except:
                continue
            
            if code not in BRANCH_MAPPING:
                continue
            
            branch = BRANCH_MAPPING[code]
            depo = parse_number(row[2])
            giro = parse_number(row[3])
            tabungan = parse_number(row[4])
            
            data[branch] = {
                'depo': depo,
                'giro': giro,
                'tabungan': tabungan,
                'dpk': depo + giro + tabungan,
                'casa': giro + tabungan,
            }
    
    return data

def update_csv_file(filename, data, data_type, date_label):
    """Update CSV file with new row"""
    with open(filename, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    header_line = lines[0]
    header_parts = header_line.rstrip('\n').split(';')
    
    # Check if double header format (depo/giro with label column)
    is_double_header = len(header_parts) > 1 and header_parts[1].strip() == ''
    
    if is_double_header:
        branches = [c.strip() for c in header_parts[2:] if c.strip()]
        row = [date_label, data_type.upper()]
    else:
        branches = [c.strip() for c in header_parts[1:] if c.strip()]
        row = [date_label]
    
    for branch in branches:
        value = data.get(branch, {}).get(data_type, 0.0)
        row.append(f" {format_decimal(value)} ")
    
    new_line = ';'.join(row) + '\n'
    lines.append(new_line)
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    
    print(f"  ✓ {filename} updated")

def process_date(ssa_file, date_label):
    print(f"\nParsing {ssa_file}...")
    data = parse_ssa_file(ssa_file)
    print(f"  Found {len(data)} branches")
    
    if not data:
        print("  ERROR: No data parsed!")
        return False
    
    print(f"Updating CSV files for {date_label}...")
    update_csv_file('depo.csv', data, 'depo', date_label)
    update_csv_file('giro.csv', data, 'giro', date_label)
    update_csv_file('tabungan.csv', data, 'tabungan', date_label)
    update_csv_file('dpk.csv', data, 'dpk', date_label)
    update_csv_file('casa.csv', data, 'casa', date_label)
    return True

if __name__ == "__main__":
    print("=" * 60)
    print("Updating CSV MIKRO files with 30 Mar - 4 Apr data...")
    print("=" * 60)
    
    process_date('SSA SIMPANAN 30 MARET 2026.csv', '30-Mar')
    process_date('SSA SIMPANAN 31 MARET 2026 (1).csv', '31-Mar')
    process_date('SSA SIMPANAN 1 APRIL 2026 (1).csv', '01-Apr')
    process_date('SSA Simpanan 2 April 2026.csv', '02-Apr')
    process_date('SSA Simpanan 3 APRIL 2026.csv', '03-Apr')
    process_date('SSA Simpanan 4 APRIL 2026.csv', '04-Apr')
    
    print("\n" + "=" * 60)
    print("Done! CSV MIKRO updated for 30 Mar - 4 Apr.")
    print("=" * 60)
