import csv

# Branch code to KC name mapping
branch_mapping = {
    '5': 'KC Bandung AA',
    '25': 'KC Garut',
    '28': 'KC Indramayu',
    '46': 'KC Majalengka',
    '75': 'KC Purwakarta',
    '92': 'KC Sukabumi',
    '94': 'KC Sumedang',
    '100': 'KC Tasikmalaya',
    '104': 'KC Ciamis',
    '105': 'KC Cianjur',
    '107': 'KC Cirebon Kartini',
    '123': 'KC Subang',
    '132': 'KC Majalaya',
    '133': 'KC Kuningan',
    '137': 'KC Cimahi',
    '161': 'KC Singaparna',
    '162': 'KC Banjar',
    '165': 'KC Jatibarang',
    '181': 'KC Cibadak',
    '286': 'KC Bandung Dewi Sartika',
    '337': 'KC Bandung Naripan',
    '354': 'KC Bandung A.H. Nasution',
    '355': 'KC Pamanukan',
    '389': 'KC Bandung Martadinata',
    '401': 'KC Bandung Kopo',
    '405': 'KC Bandung Dago',
    '406': 'KC Cirebon Gunung Jati',
    '407': 'KC Bandung Sukarno Hatta',
    '408': 'KC Bandung Setiabudi',
    '544': 'KC Soreang',
}

def parse_value(val):
    """Parse value - handles both integer (dot=thousands) and decimal (comma=decimal)"""
    val = val.strip()
    if val == '' or val == '0':
        return 0
    if ',' in val:
        return round(float(val.replace('.', '').replace(',', '.')))
    else:
        return int(val.replace('.', ''))

def parse_ssa_file(filename):
    """Parse SSA file and return dict of {kc_name: {deposito, giro, tabungan}}"""
    data = {}
    with open(filename, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    for line in lines[1:]:
        line = line.strip()
        if not line:
            continue
        
        parts = line.split(';')
        if len(parts) < 5:
            continue
        
        branch_code = parts[0].strip()
        uker = parts[1].strip()
        
        if 'KANWIL' in uker or 'Grand Total' in uker:
            continue
        if branch_code == 'Grand Total':
            continue
        
        kc_name = branch_mapping.get(branch_code)
        if kc_name is None:
            continue
        
        try:
            depo = parse_value(parts[2])
            giro = parse_value(parts[3])
            tab = parse_value(parts[4])
            data[kc_name] = {
                'deposito': str(depo),
                'giro': str(giro),
                'tabungan': str(tab)
            }
        except (ValueError, IndexError):
            print(f"  Warning: Could not parse line for {kc_name}: {line}")
    
    return data

type_labels = {
    'deposito': 'DEPO',
    'giro': 'GIRO',
    'tabungan': 'TAB',
}

def update_csv(filename, data, data_type, date_label):
    label = type_labels[data_type]
    
    with open(filename, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    header = lines[0].strip().split(';')
    kc_names = [name.strip() for name in header[2:]]
    
    new_row = [date_label, label]
    for kc in kc_names:
        if kc in data:
            new_row.append(f" {data[kc][data_type]} ")
        else:
            new_row.append(' 0 ')
    
    lines.append(';'.join(new_row) + '\n')
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    
    print(f"  ✓ {filename} updated")

def update_derived_csv(filename, label, data, date_label, calc_func):
    with open(filename, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    header = lines[0].strip().split(';')
    kc_names = [name.strip() for name in header[2:]]
    
    new_row = [date_label, label]
    for kc in kc_names:
        if kc in data:
            val = calc_func(data[kc])
            new_row.append(f" {val} ")
        else:
            new_row.append(' 0 ')
    
    lines.append(';'.join(new_row) + '\n')
    
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
    
    print(f"\nUpdating CSV files for {date_label}...")
    
    update_csv('depo.csv', data, 'deposito', date_label)
    update_csv('giro.csv', data, 'giro', date_label)
    update_csv('tabungan.csv', data, 'tabungan', date_label)
    
    update_derived_csv('dpk.csv', 'DPK', data, date_label,
        lambda d: int(d['deposito']) + int(d['giro']) + int(d['tabungan']))
    
    update_derived_csv('casa.csv', 'CASA', data, date_label,
        lambda d: int(d['giro']) + int(d['tabungan']))
    
    return True

if __name__ == "__main__":
    print("=" * 60)
    print("Updating CSV RITEL files with 23 & 24 Feb data...")
    print("=" * 60)
    
    # Process 23 Feb
    process_date('SSA Simpanan_Full Data_data 23 Feb 2026.csv', '23-Feb')
    
    # Process 24 Feb
    process_date('SSA Simpanan_data 24 Feb.csv', '24-Feb')
    
    print("\n" + "=" * 60)
    print("Done! CSV RITEL updated for 23 & 24 Feb.")
    print("=" * 60)
