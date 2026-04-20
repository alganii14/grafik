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
    ("19-Apr", "SSA Simpanan 19 april.csv"),
]

TYPE_LABEL = {
    "depo": "DEPO",
    "tabungan": "TAB",
    "dpk": "DPK",
    "casa": "CASA",
}

DATE_ROW_RE = re.compile(r"^\d{2}-[A-Za-z]{3};")


def keep_non_date_row(line: str) -> bool:
    stripped = line.strip()
    if not stripped:
        return False
    if stripped.startswith("UKER;"):
        return False
    if set(stripped) <= {";"}:
        return False
    return True


def parse_number(value: str) -> int:
    if value is None:
        return 0

    s = str(value).strip()
    if not s or s in {"-", "- "}:
        return 0

    s = s.replace(" ", "")
    s = s.replace(".", "").replace(",", ".")

    try:
        return int(round(float(s)))
    except Exception:
        return 0


def parse_ssa_file(path: Path) -> dict[str, dict[str, int]]:
    data: dict[str, dict[str, int]] = {}

    with path.open("r", encoding="utf-8") as f:
        reader = csv.reader(f, delimiter=";")
        next(reader, None)

        for row in reader:
            if len(row) < 5:
                continue

            first_col = row[0].strip()
            if "grand total" in first_col.lower() or first_col.lower() in {"grand", "total"}:
                continue

            try:
                code = int(first_col)
            except Exception:
                continue

            if code not in BRANCH_MAPPING:
                continue

            branch = BRANCH_MAPPING[code]
            depo = parse_number(row[2])
            giro = parse_number(row[3])
            tabungan = parse_number(row[4])

            data[branch] = {
                "depo": depo,
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


def upsert_sorted_row(csv_file: Path, date_label: str, metric: str, branch_data: dict[str, dict[str, int]]) -> None:
    lines = csv_file.read_text(encoding="utf-8").splitlines(keepends=True)
    if not lines:
        raise ValueError(f"File kosong: {csv_file}")

    header = lines[0].rstrip("\n").split(";")
    branches = [c.strip() for c in header[2:] if c.strip()]

    row = [date_label, TYPE_LABEL[metric]]
    for branch in branches:
        value = branch_data.get(branch, {}).get(metric, 0)
        row.append(f" {value} ")
    new_line = ";".join(row) + "\n"

    body = [ln for ln in lines[1:] if not ln.startswith(f"{date_label};")]
    date_rows = [ln for ln in body if DATE_ROW_RE.match(ln)]
    non_date_rows = [ln for ln in body if not DATE_ROW_RE.match(ln) and keep_non_date_row(ln)]

    date_rows.append(new_line)
    date_rows.sort(key=date_key_from_line)

    csv_file.write_text("".join([lines[0]] + date_rows + non_date_rows), encoding="utf-8")


def process_date(base_dir: Path, date_label: str, source_name: str) -> None:
    source_path = base_dir / source_name
    if not source_path.exists():
        raise FileNotFoundError(f"Source tidak ditemukan: {source_name}")

    data = parse_ssa_file(source_path)
    if not data:
        raise ValueError(f"Tidak ada data cabang terbaca dari {source_name}")

    upsert_sorted_row(base_dir / "depo.csv", date_label, "depo", data)
    upsert_sorted_row(base_dir / "tabungan.csv", date_label, "tabungan", data)
    upsert_sorted_row(base_dir / "dpk.csv", date_label, "dpk", data)
    upsert_sorted_row(base_dir / "casa.csv", date_label, "casa", data)

    print(f"OK {date_label} <- {source_name} ({len(data)} cabang)")


def main() -> None:
    base_dir = Path(__file__).resolve().parent
    print("=" * 70)
    print("Update CSV ritel 19-Apr")
    print("=" * 70)

    for date_label, source in DATE_SOURCES:
        process_date(base_dir, date_label, source)

    print("=" * 70)
    print("Selesai.")
    print("=" * 70)


if __name__ == "__main__":
    main()
