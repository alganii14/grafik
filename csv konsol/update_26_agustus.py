import csv
import re
from datetime import datetime
from pathlib import Path

BRANCH_MAPPING = {
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

DATE_SOURCES = [
    ("26-Aug", "SSA Simpanan 26 Agustus 2026.csv"),
]

LABEL_MAP = {
    "depo": "DEPO",
    "giro": "GIRO",
    "tabungan": "TAB",
    "dpk": "DPK",
    "casa": "CASA",
}

DATE_ROW_RE = re.compile(r"^\d{1,2}-[A-Za-z]{3};")


def parse_int(value: str) -> int:
    if value is None:
        return 0
    s = str(value).strip()
    if not s or s in {"-", "- ", "-   "}:
        return 0
    s = s.replace(" ", "")
    if not s or s == "0":
        return 0
    s = s.replace(".", "").replace(",", ".")
    try:
        return int(round(float(s)))
    except Exception:
        return 0


def format_number(value: int) -> str:
    if value >= 1000:
        return f"{value:,}".replace(",", ".")
    return str(value)


def is_grand_total(value: str) -> bool:
    if value is None:
        return False
    s = str(value).strip().lower()
    return "grand total" in s or s in {"grand", "total"}


def has_skip_keyword(row: list[str]) -> bool:
    for cell in row:
        if cell is None:
            continue
        s = str(cell).lower()
        if "kanwil" in s or "nwil" in s:
            return True
    return False


def get_code(row: list[str]) -> tuple[int | None, int | None]:
    for idx in (0, 1):
        if idx >= len(row):
            continue
        token = row[idx].strip()
        if is_grand_total(token):
            return None, None
        if "--" in token:
            code_part = token.split("--", 1)[0].strip()
            try:
                return int(code_part), idx + 1
            except Exception:
                continue
        try:
            return int(token), idx + 2
        except Exception:
            continue
    return None, None


def parse_ssa_file(path: Path) -> dict:
    data: dict[str, dict[str, int]] = {}
    with path.open("r", encoding="utf-8-sig") as f:
        reader = csv.reader(f, delimiter=";")
        next(reader, None)
        for row in reader:
            if len(row) < 5:
                continue
            if has_skip_keyword(row):
                continue
            if is_grand_total(row[0]) or (len(row) > 1 and is_grand_total(row[1])):
                continue

            code, value_start = get_code(row)
            if code is None or code not in BRANCH_MAPPING or value_start is None:
                continue

            if value_start + 2 >= len(row):
                continue

            branch = BRANCH_MAPPING[code]
            depo = parse_int(row[value_start])
            giro = parse_int(row[value_start + 1])
            tabungan = parse_int(row[value_start + 2])

            data[branch] = {
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
    if stripped.startswith("UKER;"):
        return False
    if set(stripped) <= {";"}:
        return False
    return True


def upsert_sorted_row(csv_file: Path, date_label: str, data_type: str, branch_data: dict) -> None:
    lines = csv_file.read_text(encoding="utf-8").splitlines(keepends=True)
    if not lines:
        raise ValueError(f"File kosong: {csv_file}")

    header_line = lines[0]
    header_parts = header_line.rstrip("\n").split(";")

    is_double_header = len(header_parts) > 1 and header_parts[1].strip() == ""
    if is_double_header:
        branches = [c.strip() for c in header_parts[2:] if c.strip()]
        row = [date_label, LABEL_MAP[data_type]]
    else:
        branches = [c.strip() for c in header_parts[1:] if c.strip()]
        row = [date_label]

    for branch in branches:
        value = branch_data.get(branch, {}).get(data_type, 0)
        row.append(f" {format_number(value)} ")

    new_line = ";".join(row) + "\n"
    body = [ln for ln in lines[1:] if not ln.startswith(f"{date_label};")]

    date_rows = [ln for ln in body if DATE_ROW_RE.match(ln)]
    non_date_rows = [ln for ln in body if not DATE_ROW_RE.match(ln) and keep_non_date_row(ln)]

    date_rows.append(new_line)
    date_rows.sort(key=date_key_from_line)

    csv_file.write_text("".join([header_line] + date_rows + non_date_rows), encoding="utf-8")


def process_date(base_dir: Path, date_label: str, source_name: str) -> None:
    source_path = base_dir / source_name
    if not source_path.exists():
        raise FileNotFoundError(f"Source tidak ditemukan: {source_name}")

    data = parse_ssa_file(source_path)
    if not data:
        raise ValueError(f"Tidak ada data cabang terbaca dari {source_name}")

    upsert_sorted_row(base_dir / "depo.csv", date_label, "depo", data)
    upsert_sorted_row(base_dir / "giro.csv", date_label, "giro", data)
    upsert_sorted_row(base_dir / "tabungan.csv", date_label, "tabungan", data)
    upsert_sorted_row(base_dir / "dpk.csv", date_label, "dpk", data)
    upsert_sorted_row(base_dir / "casa.csv", date_label, "casa", data)

    print(f"OK {date_label} <- {source_name} ({len(data)} cabang)")


def main() -> None:
    base_dir = Path(__file__).resolve().parent
    print("=" * 70)
    print("Update CSV konsol 26 Agustus 2026")
    print("=" * 70)

    # Process August 26
    for date_label, source in DATE_SOURCES:
        process_date(base_dir, date_label, source)

    print("=" * 70)
    print("Selesai.")
    print("=" * 70)


if __name__ == "__main__":
    main()
