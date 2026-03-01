import csv

# Mapping: kode_cabang -> nama_singkat_csv
branch_mapping = {
    5: "KC Bandung AA",
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

def parse_number(val):
    """Parse number dari SSA format (e.g. '1.234' -> 1234)"""
    if not val:
        return 0
    val = str(val).strip()
    val = val.replace('.', '').replace(',', '.')
    try:
        return int(round(float(val)))
    except:
        return 0

def format_number(val):
    """Format bilangan bulat dengan titik ribuan"""
    if val >= 1000:
        return f"{val:,}".replace(',', '.')
    return str(val)

def parse_ssa_file(filename):
    """Parse SSA file and return data dict by branch name"""
    data = {}
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            reader = csv.reader(f, delimiter=';')
            header = next(reader)  # Skip header
            
            for row in reader:
                if len(row) < 5:
                    continue
                if 'Grand Total' in row[0]:
                    continue
                try:
                    kode = int(row[0].strip())
                except:
                    continue
                
                if kode not in branch_mapping:
                    continue
                    
                branch_name = branch_mapping[kode]
                depo = parse_number(row[2])
                giro = parse_number(row[3])
                tabungan = parse_number(row[4])
                
                data[branch_name] = {
                    'depo': depo,
                    'giro': giro,
                    'tabungan': tabungan,
                    'dpk': depo + giro + tabungan,
                    'casa': giro + tabungan
                }
    except Exception as e:
        print(f"  ERROR parsing {filename}: {e}")
    return data

def update_csv(filename, label, data_type, branch_data):
    """Update CSV file dengan data baru"""
    with open(filename, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Parse header to get column order
    header = lines[0].strip().split(';')
    
    # tabungan.csv has 1 header column (UKER;KC...), others have 2 (UKER;;KC...)
    if header[1].strip() == '':
        # Format: UKER;;KC Purwakarta;... (depo, giro, dpk, casa)
        kc_names = [name.strip() for name in header[2:]]
        row = [label, data_type.upper()]
    else:
        # Format: UKER;KC Purwakarta;... (tabungan)
        kc_names = [name.strip() for name in header[1:]]
        row = [label]
    
    for kc in kc_names:
        if kc in branch_data:
            value = branch_data[kc][data_type]
            row.append(f" {format_number(value)} ")
        else:
            row.append(" 0 ")
    
    new_line = ';'.join(row) + '\n'
    lines.append(new_line)
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    
    print(f"  ✓ {filename} updated with {label}")

def process_date(ssa_file, date_label):
    print(f"\nProcessing {date_label} from {ssa_file}...")
    data = parse_ssa_file(ssa_file)
    print(f"   Found {len(data)} branches")
    
    if not data:
        print(f"   ERROR: No data parsed! Skipping.")
        return False
    
    update_csv('depo.csv', date_label, 'depo', data)
    update_csv('giro.csv', date_label, 'giro', data)
    update_csv('tabungan.csv', date_label, 'tabungan', data)
    update_csv('dpk.csv', date_label, 'dpk', data)
    update_csv('casa.csv', date_label, 'casa', data)
    return True

if __name__ == "__main__":
    print("=" * 60)
    print("Updating CSV KONSOL files with 28 Feb data...")
    print("=" * 60)
    
    # Process 28 Feb
    process_date('SSA SIMPANAN 28 FEBR 2026.csv', '28-Feb')
    
    print("\n" + "=" * 60)
    print("Done! All CSV KONSOL updated for 28 Feb.")
    print("=" * 60)
