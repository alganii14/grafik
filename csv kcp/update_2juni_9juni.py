import csv
from pathlib import Path

ssa_to_csv = {
    "KCP Cipanas": "KCP Cipanas",
    "KCP Pangandaran": "KCP Pangandaran",
    "KCP Pelabuhan Ratu": "KCP Pelabuhan Ratu",
    "KCP ITB": "KCP ITB",
    "KCP BRI JATINANGOR": "KCP BRI Jatinangor",
    "KCP Patrol": "KCP Patrol",
    "KCP SUMBER SARI": "KCP Sumber Sari",
    "KCP Weru": "KCP Weru",
    "KCP OTTO ISKANDARDINATA": "KCP Otto Iskandardinata",
    "KCP SETRASARI": "KCP Setrasari",
    "KCP PADALARANG": "KCP Padalarang",
    "KCP PASIR KALIKI": "KCP Pasir Kaliki",
    "KCP PASAR BARU BANDUNG DS": "KCP Pasar Baru Bandung",
    "KCP RAJAWALI BANDUNG": "KCP Rajawali Bandung",
    "KCP CIJERAH": "KCP Cijerah",
    "KCP CIMINDI": "KCP Cimindi",
    "KCP PETA": "KCP Peta",
    "KCP SUMBER": "KCP Sumber",
    "KCP METRO TRADE CENTER": "KCP Trade Center",
    "KCP ABDUL FATAH": "KCP Abdul Fatah",
    "KCP RANCAEKEK": "KCP Rancaekek",
    "KCP BANJARAN": "KCP Banjaran",
    "KCP SUMMARECON BANDUNG": "KCP Summarecon Bandung",
    "KCP CIKURUBUK": "KCP Cikurubuk",
    "KCP GUNTUR": "KCP Guntur",
    "KCP CIKAJANG": "KCP Cikajang",
    "KCP CICURUG": "KCP Cicurug",
    "KCP CIAWI TASIKMALAYA": "KCP Ciawi Tasikmalaya",
    "KCP TELKOM BANDUNG": "KCP Telkom Bandung",
    "KCP MANGUNSARKORO": "KCP Mangunsarkoro",
    "KCP CIHAMPELAS": "KCP Cihampelas",
    "KCP LEMBANG": "KCP Lembang",
    "KCP BATUNUNGGAL": "KCP Batununggal",
    "KCP Mekarwangi": "KCP Mekarwangi",
    "KCP RIAU": "KCP Riau",
    "KCP SUCI": "KCP Suci",
    "KCP CILEDUG CIREBON": "KCP Ciledug Cirebon",
    "KCP ANTAPANI": "KCP Antapani",
    "KCP TAMAN KOPO INDAH": "KCP Taman Kopo Indah",
    "KCP TAMAN KOPO INDAH II": "KCP Taman Kopo Indah II",
    "KCP SURADE": "KCP Surade",
    "KCP CIRANJANG": "KCP Ciranjang",
    "KCP SUKANAGARA": "KCP Sukanagara",
}

ssa_to_csv_lower = {k.lower(): v for k, v in ssa_to_csv.items()}

DATE_SOURCES = [
    ("02-Jun", "SSA Simpanan 2 Juni 2026 (1).csv"),
    ("03-Jun", "SSA Simpanan 2 Juni 2026 (1).csv"),  # samakan dengan 2 Juni
    ("04-Jun", "SSA Simpanan mentah 4 Juni 2026 (1).csv"),
    ("05-Jun", "SSA Simpanan mentah 4 Juni 2026 (1).csv"),  # samakan dengan 4 Juni
    ("06-Jun", "SSA Simpanan 6 Juni 2026 (1).csv"),
    ("07-Jun", "SSA Simpanan 7 Juni 2026.csv"),
    ("08-Jun", "SSA Simpanan 8 Juni 2026.csv"),
    ("09-Jun", "SSA Simpanan 9 Juni 2026.csv"),
]


def lookup_name(raw_name):
    raw = raw_name.strip()
    if raw in ssa_to_csv:
        return ssa_to_csv[raw]
    return ssa_to_csv_lower.get(raw.lower())


def parse_float(val):
    if not val or val.strip() in ("-", "- ", ""):
        return 0.0
    s = val.strip().replace(" ", "")
    if "," in s:
        s = s.replace(".", "").replace(",", ".")
    return float(s)


def format_value(value):
    return f"{value:.2f}".replace(".", ",")


def detect_format(filepath: Path) -> str:
    with filepath.open("r", encoding="utf-8-sig") as f:
        header = [part.strip().lower() for part in f.readline().strip().split(";")]

    if len(header) > 1 and ("uker" in header[1] or "nama uker" in header[1]):
        return "kode_uker"
    if header and "nama uker" in header[0]:
        return "nama_uker"
    return "kode_uker"


def parse_ssa_file(filepath: Path):
    fmt = detect_format(filepath)
    data = {}

    with filepath.open("r", encoding="utf-8-sig") as f:
        reader = csv.reader(f, delimiter=";")
        next(reader)

        for row in reader:
            if not row:
                continue

            first = row[0].strip()
            if "grand" in first.lower():
                continue

            if fmt == "nama_uker":
                if len(row) < 4:
                    continue
                if " -- " in first:
                    kcp_raw = first.split(" -- ", 1)[1].strip()
                else:
                    kcp_raw = first
                value_start = 1
            else:
                if len(row) < 5:
                    continue
                kcp_raw = row[1].strip()
                if not kcp_raw:
                    continue
                value_start = 2

            csv_name = lookup_name(kcp_raw)
            if csv_name is None:
                continue

            depo = parse_float(row[value_start]) if len(row) > value_start else 0.0
            giro = parse_float(row[value_start + 1]) if len(row) > value_start + 1 else 0.0
            tabungan = parse_float(row[value_start + 2]) if len(row) > value_start + 2 else 0.0

            data[csv_name] = {
                "depo": depo,
                "giro": giro,
                "tabungan": tabungan,
                "dpk": depo + giro + tabungan,
                "casa": giro + tabungan,
            }

    return data


def update_csv_file(filename: Path, data, data_type, date_label):
    with filename.open("r", encoding="utf-8") as f:
        lines = f.readlines()

    while lines and lines[-1].strip().replace(";", "").strip() == "":
        lines.pop()

    header = lines[0].strip().split(";")
    kcp_names = [name.strip() for name in header[1:]]

    new_row = [date_label]
    for kcp in kcp_names:
        val = data.get(kcp, {}).get(data_type, 0.0)
        new_row.append(f" {format_value(val)} ")

    kept_lines = [
        line for line in lines[1:]
        if line.split(";", 1)[0].strip() != date_label
    ]
    lines = [lines[0], *kept_lines, ";".join(new_row) + "\n"]

    with filename.open("w", encoding="utf-8") as f:
        f.writelines(lines)
    print(f"  OK {filename.name} updated with {date_label}")


def process_date(base_dir: Path, date_label: str, ssa_file: str) -> bool:
    source_path = base_dir / ssa_file
    if not source_path.exists():
        raise FileNotFoundError(f"Source tidak ditemukan: {ssa_file}")

    print(f"\nParsing {ssa_file}...")
    data = parse_ssa_file(source_path)
    print(f"  Found {len(data)} KCP entries")

    if not data:
        print("  ERROR: No data parsed!")
        return False

    for filename, data_type in (
        ("depo.csv", "depo"),
        ("giro.csv", "giro"),
        ("tabungan.csv", "tabungan"),
        ("dpk.csv", "dpk"),
        ("casa.csv", "casa"),
    ):
        update_csv_file(base_dir / filename, data, data_type, date_label)

    return True


if __name__ == "__main__":
    base_dir = Path(__file__).resolve().parent
    print("=" * 60)
    print("Updating CSV KCP files with 2 - 9 Juni 2026 data...")
    print("=" * 60)

    for date_label, source in DATE_SOURCES:
        process_date(base_dir, date_label, source)

    print("\n" + "=" * 60)
    print("Done! CSV KCP updated for 2 - 9 Juni.")
    print("=" * 60)
