import csv
import re
from datetime import datetime
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
    ("19-Aug", "SSA Simpanan 19 Agustus 2026.csv"),
]

DATE_ROW_RE = re.compile(r"^\d{1,2}-[A-Za-z]{3};")


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


def upsert_sorted_row(csv_file: Path, date_label: str, data_type: str, branch_data: dict) -> None:
    lines = csv_file.read_text(encoding="utf-8").splitlines(keepends=True)
    if not lines:
        raise ValueError(f"File kosong: {csv_file}")

    header_line = lines[0]
    header = header_line.strip().split(";")
    kcp_names = [name.strip() for name in header[1:]]

    new_row = [date_label]
    for kcp in kcp_names:
        val = branch_data.get(kcp, {}).get(data_type, 0.0)
        new_row.append(f" {format_value(val)} ")

    new_line = ";".join(new_row) + "\n"
    body = [ln for ln in lines[1:] if not ln.startswith(f"{date_label};")]

    date_rows = [ln for ln in body if DATE_ROW_RE.match(ln)]
    non_date_rows = [ln for ln in body if not DATE_ROW_RE.match(ln) and keep_non_date_row(ln)]

    date_rows.append(new_line)
    date_rows.sort(key=date_key_from_line)

    csv_file.write_text("".join([header_line] + date_rows + non_date_rows), encoding="utf-8")


def process_date(base_dir: Path, date_label: str, ssa_file: str) -> None:
    source_path = base_dir / ssa_file
    if not source_path.exists():
        raise FileNotFoundError(f"Source tidak ditemukan: {ssa_file}")

    data = parse_ssa_file(source_path)
    if not data:
        raise ValueError(f"Tidak ada data cabang terbaca dari {ssa_file}")

    upsert_sorted_row(base_dir / "depo.csv", date_label, "depo", data)
    upsert_sorted_row(base_dir / "giro.csv", date_label, "giro", data)
    upsert_sorted_row(base_dir / "tabungan.csv", date_label, "tabungan", data)
    upsert_sorted_row(base_dir / "dpk.csv", date_label, "dpk", data)
    upsert_sorted_row(base_dir / "casa.csv", date_label, "casa", data)

    print(f"OK {date_label} <- {ssa_file} ({len(data)} KCP)")


def main() -> None:
    base_dir = Path(__file__).resolve().parent
    print("=" * 70)
    print("Update CSV KCP 19 Agustus 2026")
    print("=" * 70)

    # Process August 19
    for date_label, source in DATE_SOURCES:
        process_date(base_dir, date_label, source)

    print("=" * 70)
    print("Selesai.")
    print("=" * 70)


if __name__ == "__main__":
    main()
