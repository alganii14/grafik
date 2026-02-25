import csv

# Mapping: kode_cabang -> nama KC di CSV header
branch_mapping = {
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
    """Parse number dari SSA format (dot=ribuan, comma=desimal)"""
    if not val or not val.strip():
        return 0.0
    val = str(val).strip()
    val = val.replace('.', '').replace(',', '.')
    try:
        return float(val)
    except:
        return 0.0

def format_value(value):
    """Format float ke European format (dot ribuan, comma desimal, 2 decimal places)"""
    formatted = f"{value:,.2f}"
    formatted = formatted.replace(',', 'X').replace('.', ',').replace('X', '.')
    return formatted

def format_integer(value):
    """Format integer dengan dot ribuan (tanpa desimal)"""
    val = int(round(value))
    if val >= 1000:
        return f"{val:,}".replace(',', '.')
    return str(val)

def parse_ssa_file(filepath):
    """Parse SSA CSV file, return dict {kc_name: {depo, giro, tabungan}}"""
    data = {}
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            reader = csv.reader(f, delimiter=';')
            header = next(reader)  # Skip header
            for row in reader:
                if len(row) < 5:
                    continue
                if 'Grand Total' in row[0] or 'Total' in row[0]:
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
                }
    except Exception as e:
        print(f"  ERROR parsing {filepath}: {e}")
    return data

def update_csv_file(filename, data, data_type, date_label):
    """Update CSV file with new data row (depo, giro, tabungan)"""
    with open(filename, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    header = lines[0].strip().split(';')
    
    # tabungan.csv has 1 header column (UKER;KC...), others have 2 (UKER;;KC...)
    if header[1].strip() == '':
        kc_names = [name.strip() for name in header[2:]]
        new_row = [date_label, data_type.upper()]
        fmt = format_value
    else:
        kc_names = [name.strip() for name in header[1:]]
        new_row = [date_label]
        fmt = format_integer
    
    for kc in kc_names:
        if not kc:
            continue
        if kc in data:
            new_row.append(f" {fmt(data[kc][data_type])} ")
        else:
            new_row.append(' 0 ')
    
    new_row_line = ';'.join(new_row) + '\n'
    lines.append(new_row_line)
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    
    print(f"  ✓ {filename} updated")

def update_dpk_file(data, date_label):
    """Update DPK CSV file (DPK = Deposito + Giro + Tabungan)"""
    with open('dpk.csv', 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    header = lines[0].strip().split(';')
    kc_names = [name.strip() for name in header[2:]]
    
    new_row = [date_label, 'DPK']
    for kc in kc_names:
        if not kc:
            continue
        if kc in data:
            d = data[kc]
            dpk = d['depo'] + d['giro'] + d['tabungan']
            new_row.append(f" {format_value(dpk)} ")
        else:
            new_row.append(' 0,00 ')
    
    new_row_line = ';'.join(new_row) + '\n'
    lines.append(new_row_line)
    
    with open('dpk.csv', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    
    print(f"  ✓ dpk.csv updated")

def update_casa_file(data, date_label):
    """Update CASA CSV file (CASA = Giro + Tabungan)"""
    with open('casa.csv', 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    header = lines[0].strip().split(';')
    kc_names = [name.strip() for name in header[2:]]
    
    new_row = [date_label, 'CASA']
    for kc in kc_names:
        if not kc:
            continue
        if kc in data:
            d = data[kc]
            casa = d['giro'] + d['tabungan']
            new_row.append(f" {format_value(casa)} ")
        else:
            new_row.append(' 0,00 ')
    
    new_row_line = ';'.join(new_row) + '\n'
    lines.append(new_row_line)
    
    with open('casa.csv', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    
    print(f"  ✓ casa.csv updated")

def process_date(ssa_file, date_label):
    print(f"\nProcessing {date_label} from {ssa_file}...")
    data = parse_ssa_file(ssa_file)
    print(f"   Found {len(data)} branches")
    
    if not data:
        print(f"   ERROR: No data parsed!")
        return False
    
    update_csv_file('depo.csv', data, 'depo', date_label)
    update_csv_file('giro.csv', data, 'giro', date_label)
    update_csv_file('tabungan.csv', data, 'tabungan', date_label)
    update_dpk_file(data, date_label)
    update_casa_file(data, date_label)
    return True

if __name__ == "__main__":
    print("=" * 60)
    print("Updating CSV MIKRO files with 23 & 24 Feb data...")
    print("=" * 60)
    
    # Process 23 Feb
    process_date('SSA Simpanan_Full Data_data 23 Feb 2026.csv', '23-Feb')
    
    # Process 24 Feb
    process_date('SSA Simpanan_data 24 Feb.csv', '24-Feb')
    
    print("\n" + "=" * 60)
    print("Done! CSV MIKRO updated for 23 & 24 Feb.")
    print("=" * 60)
