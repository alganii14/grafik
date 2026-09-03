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
    ("10-May", "SSA Simpanan 10 Mei 2026.csv"),
    ("11-May", "11 Mei .csv"),
    ("12-May", "SSA Simpanan 12 Mei.csv"),
    ("13-May", "13 mei dr hourly (h-1 hari).csv"),
    ("14-May", "SSA Simpanan 14 Mei 2026 (1).csv"),
    ("15-May", "SSA Simpanan 15 Mei 2026.csv"),
]


def lookup_name(raw_name):
    raw = raw_name.strip()
    if raw in ssa_to_csv:
        return ssa_to_csv[raw]
    if raw.lower() in ssa_to_csv_lower:
        return ssa_to_csv_lower[raw.lower()]
    return None


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
        header = f.readline().strip()
    first_col = header.split(";")[0].strip().lower()
    if "nama uker" in first_col:
        return "nama_uker"
    return "kode_uker"


def parse_ssa_file(filepath: Path):
    fmt = detect_format(filepath)
    data = {}

    with filepath.open("r", encoding="utf-8-sig") as f:
        reader = csv.reader(f, delimiter=";")
        next(reader)  # skip header

        for row in reader:
            if not row:
                continue

            if fmt == "nama_uker":
                if len(row) < 4:
                    continue
                raw = row[0].strip()
                if "Grand Total" in raw or "grand" in raw.lower():
                    continue
                if " -- " in raw:
                    kcp_raw = raw.split(" -- ", 1)[1].strip()
                else:
                    kcp_raw = raw
                csv_name = lookup_name(kcp_raw)
                if csv_name is None:
                    continue
                try:
                    depo = parse_float(row[2]) if len(row) > 2 else 0.0
                    giro = parse_float(row[3]) if len(row) > 3 else 0.0
                    tab = parse_float(row[4]) if len(row) > 4 else 0.0
                except (ValueError, IndexError):
                    depo = parse_float(row[1]) if len(row) > 1 else 0.0
                    giro = parse_float(row[2]) if len(row) > 2 else 0.0
                    tab = parse_float(row[3]) if len(row) > 3 else 0.0
            else:
                if len(row) < 5:
                    continue
                uker = row[1].strip()
                first = row[0].strip()
                if "Grand" in first or "grand" in first:
                    continue
                if not uker:
                    continue
                csv_name = lookup_name(uker)
                if csv_name is None:
                    continue
                depo = parse_float(row[2]) if len(row) > 2 else 0.0
                giro = parse_float(row[3]) if len(row) > 3 else 0.0
                tab = parse_float(row[4]) if len(row) > 4 else 0.0

            data[csv_name] = {
                "depo": depo,
                "giro": giro,
                "tabungan": tab,
                "dpk": depo + giro + tab,
                "casa": giro + tab,
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

    lines.append(";".join(new_row) + "\n")

    with filename.open("w", encoding="utf-8") as f:
        f.writelines(lines)
    print(f"  ✓ {filename} updated")


def process_date(base_dir: Path, ssa_file: str, date_label: str) -> bool:
    source_path = base_dir / ssa_file
    if not source_path.exists():
        raise FileNotFoundError(f"Source tidak ditemukan: {ssa_file}")

    print(f"\nParsing {ssa_file}...")
    data = parse_ssa_file(source_path)
    print(f"  Found {len(data)} KCP entries")

    if not data:
        print("  ERROR: No data parsed!")
        return False

    update_csv_file(base_dir / "depo.csv", data, "depo", date_label)
    update_csv_file(base_dir / "giro.csv", data, "giro", date_label)
    update_csv_file(base_dir / "tabungan.csv", data, "tabungan", date_label)
    update_csv_file(base_dir / "dpk.csv", data, "dpk", date_label)
    update_csv_file(base_dir / "casa.csv", data, "casa", date_label)
    return True


if __name__ == "__main__":
    base_dir = Path(__file__).resolve().parent
    print("=" * 60)
    print("Updating CSV KCP files with 10-15 Mei 2026 data...")
    print("=" * 60)

    for date_label, source in DATE_SOURCES:
        process_date(base_dir, source, date_label)

    print("\n" + "=" * 60)
    print("Done! CSV KCP updated for 10-15 Mei.")
    print("=" * 60)
