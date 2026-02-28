import csv

# Mapping dari nama SSA ke nama di CSV header
ssa_to_csv = {
    'KCP Cipanas': 'KCP Cipanas',
    'KCP Pangandaran': 'KCP Pangandaran',
    'KCP Pelabuhan Ratu': 'KCP Pelabuhan Ratu',
    'KCP ITB': 'KCP ITB',
    'KCP BRI JATINANGOR': 'KCP BRI Jatinangor',
    'KCP Patrol': 'KCP Patrol',
    'KCP SUMBER SARI': 'KCP Sumber Sari',
    'KCP Weru': 'KCP Weru',
    'KCP OTTO ISKANDARDINATA': 'KCP Otto Iskandardinata',
    'KCP SETRASARI': 'KCP Setrasari',
    'KCP PADALARANG': 'KCP Padalarang',
    'KCP PASIR KALIKI': 'KCP Pasir Kaliki',
    'KCP PASAR BARU BANDUNG DS': 'KCP Pasar Baru Bandung',
    'KCP RAJAWALI BANDUNG': 'KCP Rajawali Bandung',
    'KCP CIJERAH': 'KCP Cijerah',
    'KCP CIMINDI': 'KCP Cimindi',
    'KCP PETA': 'KCP Peta',
    'KCP SUMBER': 'KCP Sumber',
    'KCP METRO TRADE CENTER': 'KCP Trade Center',
    'KCP ABDUL FATAH': 'KCP Abdul Fatah',
    'KCP RANCAEKEK': 'KCP Rancaekek',
    'KCP BANJARAN': 'KCP Banjaran',
    'KCP SUMMARECON BANDUNG': 'KCP Summarecon Bandung',
    'KCP CIKURUBUK': 'KCP Cikurubuk',
    'KCP GUNTUR': 'KCP Guntur',
    'KCP CIKAJANG': 'KCP Cikajang',
    'KCP CICURUG': 'KCP Cicurug',
    'KCP CIAWI TASIKMALAYA': 'KCP Ciawi Tasikmalaya',
    'KCP TELKOM BANDUNG': 'KCP Telkom Bandung',
    'KCP MANGUNSARKORO': 'KCP Mangunsarkoro',
    'KCP CIHAMPELAS': 'KCP Cihampelas',
    'KCP LEMBANG': 'KCP Lembang',
    'KCP BATUNUNGGAL': 'KCP Batununggal',
    'KCP Mekarwangi': 'KCP Mekarwangi',
    'KCP RIAU': 'KCP Riau',
    'KCP SUCI': 'KCP Suci',
    'KCP CILEDUG CIREBON': 'KCP Ciledug Cirebon',
    'KCP ANTAPANI': 'KCP Antapani',
    'KCP TAMAN KOPO INDAH': 'KCP Taman Kopo Indah',
    'KCP TAMAN KOPO INDAH II': 'KCP Taman Kopo Indah II',
    'KCP SURADE': 'KCP Surade',
    'KCP CIRANJANG': 'KCP Ciranjang',
    'KCP SUKANAGARA': 'KCP Sukanagara',
}

def parse_ssa_file(filepath):
    """Parse SSA CSV file and return dict {csv_kcp_name: {depo, giro, tabungan}}"""
    data = {}
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.reader(f, delimiter=';')
        header = next(reader)  # Skip header
        for row in reader:
            if len(row) < 5:
                continue
            uker = row[1].strip()
            if not uker:
                continue
            depo_str = row[2].strip() if row[2].strip() else '0,00'
            giro_str = row[3].strip() if row[3].strip() else '0,00'
            tab_str = row[4].strip() if row[4].strip() else '0,00'
            
            # Handle '-' and empty values
            if depo_str in ('-', '- ', ''):
                depo_str = '0,00'
            if giro_str in ('-', '- ', ''):
                giro_str = '0,00'
            if tab_str in ('-', '- ', ''):
                tab_str = '0,00'
            
            # Map SSA name to CSV name
            csv_name = ssa_to_csv.get(uker, None)
            if csv_name is None:
                for ssa_key, csv_val in ssa_to_csv.items():
                    if ssa_key.lower() == uker.lower():
                        csv_name = csv_val
                        break
            
            if csv_name:
                data[csv_name] = {
                    'depo': depo_str,
                    'giro': giro_str,
                    'tabungan': tab_str,
                }
    return data

def parse_value(value_str):
    """Parse value from SSA format to float"""
    if not value_str or value_str.strip() == '' or value_str.strip() == '-':
        return 0.0
    val = value_str.strip().replace(' ', '')
    if ',' in val and '.' in val:
        val = val.replace('.', '').replace(',', '.')
    elif ',' in val:
        val = val.replace(',', '.')
    return float(val)

def format_value(value):
    """Format float to CSV format (comma=decimal, 2 decimal places)"""
    return f"{value:.2f}".replace('.', ',')

def update_csv_file(filename, data, data_type, date_label):
    with open(filename, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    header = lines[0].strip().split(';')
    kcp_names = [name.strip() for name in header[1:]]
    
    new_row = [date_label]
    for kcp in kcp_names:
        if kcp in data:
            val = parse_value(data[kcp][data_type])
            new_row.append(f" {format_value(val)} ")
        else:
            new_row.append(' 0,00 ')
    
    lines.append(';'.join(new_row) + '\n')
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    
    print(f"  ✓ {filename} updated with {date_label}")

def update_dpk_file(data, date_label):
    with open('dpk.csv', 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    header = lines[0].strip().split(';')
    kcp_names = [name.strip() for name in header[1:]]
    
    new_row = [date_label]
    for kcp in kcp_names:
        if kcp in data:
            d = data[kcp]
            dpk = parse_value(d['depo']) + parse_value(d['giro']) + parse_value(d['tabungan'])
            new_row.append(f" {format_value(dpk)} ")
        else:
            new_row.append(' 0,00 ')
    
    lines.append(';'.join(new_row) + '\n')
    
    with open('dpk.csv', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    
    print(f"  ✓ dpk.csv updated with {date_label}")

def update_casa_file(data, date_label):
    with open('casa.csv', 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    header = lines[0].strip().split(';')
    kcp_names = [name.strip() for name in header[1:]]
    
    new_row = [date_label]
    for kcp in kcp_names:
        if kcp in data:
            d = data[kcp]
            casa = parse_value(d['giro']) + parse_value(d['tabungan'])
            new_row.append(f" {format_value(casa)} ")
        else:
            new_row.append(' 0,00 ')
    
    lines.append(';'.join(new_row) + '\n')
    
    with open('casa.csv', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    
    print(f"  ✓ casa.csv updated with {date_label}")

def process_date(ssa_file, date_label):
    print(f"\nProcessing {date_label} from {ssa_file}...")
    data = parse_ssa_file(ssa_file)
    print(f"   Found {len(data)} KCP entries")
    
    if len(data) == 0:
        print("   WARNING: Tidak ada data KCP ditemukan!")
        return False
    
    update_csv_file('depo.csv', data, 'depo', date_label)
    update_csv_file('giro.csv', data, 'giro', date_label)
    update_csv_file('tabungan.csv', data, 'tabungan', date_label)
    update_dpk_file(data, date_label)
    update_casa_file(data, date_label)
    return True

if __name__ == "__main__":
    print("=" * 60)
    print("Updating CSV KCP files with 27 Feb data...")
    print("=" * 60)
    
    # Process 27 Feb
    process_date('SSA SIMPANAN 27 FEBR 2026.csv', '27-Feb')
    
    print("\n" + "=" * 60)
    print("Done! All CSV KCP updated for 27 Feb.")
    print("=" * 60)
