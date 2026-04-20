import csv
from pathlib import Path

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
    data = {}
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.reader(f, delimiter=';')
        next(reader, None)
        for row in reader:
            if len(row) < 5:
                continue

            uker = row[1].strip()
            if not uker:
                continue

            depo_str = row[2].strip() if row[2].strip() else '0,00'
            giro_str = row[3].strip() if row[3].strip() else '0,00'
            tab_str = row[4].strip() if row[4].strip() else '0,00'

            if depo_str in ('-', '- ', ''):
                depo_str = '0,00'
            if giro_str in ('-', '- ', ''):
                giro_str = '0,00'
            if tab_str in ('-', '- ', ''):
                tab_str = '0,00'

            csv_name = ssa_to_csv.get(uker)
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
    if not value_str or value_str.strip() in ('', '-'):
        return 0.0

    val = value_str.strip().replace(' ', '')
    if ',' in val and '.' in val:
        val = val.replace('.', '').replace(',', '.')
    elif ',' in val:
        val = val.replace(',', '.')

    return float(val)


def format_value(value):
    return f"{value:.2f}".replace('.', ',')


def build_row(filename, data, data_type, date_label):
    with open(filename, 'r', encoding='utf-8') as f:
        header = f.readline().strip().split(';')

    kcp_names = [name.strip() for name in header[1:]]

    new_row = [date_label]
    for kcp in kcp_names:
        if kcp in data:
            val = parse_value(data[kcp][data_type])
            new_row.append(f" {format_value(val)} ")
        else:
            new_row.append(' 0,00 ')

    return ';'.join(new_row) + '\n'


def build_dpk_row(filename, data, date_label):
    with open(filename, 'r', encoding='utf-8') as f:
        header = f.readline().strip().split(';')

    kcp_names = [name.strip() for name in header[1:]]

    new_row = [date_label]
    for kcp in kcp_names:
        if kcp in data:
            d = data[kcp]
            dpk = parse_value(d['depo']) + parse_value(d['giro']) + parse_value(d['tabungan'])
            new_row.append(f" {format_value(dpk)} ")
        else:
            new_row.append(' 0,00 ')

    return ';'.join(new_row) + '\n'


def build_casa_row(filename, data, date_label):
    with open(filename, 'r', encoding='utf-8') as f:
        header = f.readline().strip().split(';')

    kcp_names = [name.strip() for name in header[1:]]

    new_row = [date_label]
    for kcp in kcp_names:
        if kcp in data:
            d = data[kcp]
            casa = parse_value(d['giro']) + parse_value(d['tabungan'])
            new_row.append(f" {format_value(casa)} ")
        else:
            new_row.append(' 0,00 ')

    return ';'.join(new_row) + '\n'


def upsert_row(filename, date_label, new_row_line):
    with open(filename, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    kept = [lines[0]]
    date_prefix = f"{date_label};"
    for line in lines[1:]:
        if not line.startswith(date_prefix):
            kept.append(line)

    kept.append(new_row_line)

    with open(filename, 'w', encoding='utf-8') as f:
        f.writelines(kept)


DATE_SOURCES = [
    ('19-Apr', 'SSA Simpanan 19 april.csv'),
]


if __name__ == '__main__':
    base = Path(__file__).resolve().parent

    print('=' * 70)
    print('Update CSV KCP 19-Apr (upsert mode)')
    print('=' * 70)

    for date_label, source_name in DATE_SOURCES:
        source_path = base / source_name
        if not source_path.exists():
            print(f"SKIP {date_label}: source tidak ditemukan -> {source_name}")
            continue

        data = parse_ssa_file(source_path)
        if not data:
            print(f"SKIP {date_label}: data kosong dari {source_name}")
            continue

        depo_row = build_row(base / 'depo.csv', data, 'depo', date_label)
        giro_row = build_row(base / 'giro.csv', data, 'giro', date_label)
        tab_row = build_row(base / 'tabungan.csv', data, 'tabungan', date_label)
        dpk_row = build_dpk_row(base / 'dpk.csv', data, date_label)
        casa_row = build_casa_row(base / 'casa.csv', data, date_label)

        upsert_row(base / 'depo.csv', date_label, depo_row)
        upsert_row(base / 'giro.csv', date_label, giro_row)
        upsert_row(base / 'tabungan.csv', date_label, tab_row)
        upsert_row(base / 'dpk.csv', date_label, dpk_row)
        upsert_row(base / 'casa.csv', date_label, casa_row)

        print(f"OK {date_label} <- {source_name} ({len(data)} KCP)")

    print('=' * 70)
    print('Selesai.')
    print('=' * 70)
