import csv
from pathlib import Path

# Mapping: kode cabang -> nama kolom di CSV konsol
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


def format_number(value: int) -> str:
    if value >= 1000:
        return f"{value:,}".replace(",", ".")
    return str(value)


def parse_ssa_file(path: Path) -> dict[str, dict[str, int]]:
    data: dict[str, dict[str, int]] = {}

    with path.open("r", encoding="utf-8") as f:
        reader = csv.reader(f, delimiter=";")
        next(reader, None)  # skip header

        for row in reader:
            if len(row) < 5:
                continue

            first_col = row[0].strip()
            if "grand" in first_col.lower():
                continue

            try:
                kode = int(first_col)
            except Exception:
                continue

            if kode not in BRANCH_MAPPING:
                continue

            branch_name = BRANCH_MAPPING[kode]
            depo = parse_number(row[2])
            giro = parse_number(row[3])
            tabungan = parse_number(row[4])

            data[branch_name] = {
                "depo": depo,
                "giro": giro,
                "tabungan": tabungan,
                "dpk": depo + giro + tabungan,
                "casa": giro + tabungan,
            }

    return data


def upsert_csv_row(csv_file: Path, date_label: str, data_type: str, branch_data: dict[str, dict[str, int]]) -> None:
    with csv_file.open("r", encoding="utf-8") as f:
        lines = f.readlines()

    if not lines:
        raise ValueError(f"File kosong: {csv_file}")

    header = lines[0].rstrip("\n")
    header_parts = header.split(";")

    # depo/giro/dpk/casa: UKER;;KC..., tabungan: UKER;KC...
    if len(header_parts) > 1 and header_parts[1].strip() == "":
        branch_columns = [c.strip() for c in header_parts[2:]]
        row_parts = [date_label, data_type.upper()]
    else:
        branch_columns = [c.strip() for c in header_parts[1:]]
        row_parts = [date_label]

    for branch in branch_columns:
        value = branch_data.get(branch, {}).get(data_type, 0)
        row_parts.append(f" {format_number(value)} ")

    new_line = ";".join(row_parts) + "\n"

    # Hapus baris tanggal yang sama agar tidak duplikat saat rerun.
    kept = [lines[0]] + [ln for ln in lines[1:] if not ln.startswith(f"{date_label};")]
    kept.append(new_line)

    with csv_file.open("w", encoding="utf-8") as f:
        f.writelines(kept)


def process_date(base_dir: Path, date_label: str, source_name: str) -> None:
    source_path = base_dir / source_name
    if not source_path.exists():
        raise FileNotFoundError(f"Source tidak ditemukan: {source_name}")

    data = parse_ssa_file(source_path)
    if not data:
        raise ValueError(f"Tidak ada data cabang terbaca dari {source_name}")

    upsert_csv_row(base_dir / "depo.csv", date_label, "depo", data)
    upsert_csv_row(base_dir / "giro.csv", date_label, "giro", data)
    upsert_csv_row(base_dir / "tabungan.csv", date_label, "tabungan", data)
    upsert_csv_row(base_dir / "dpk.csv", date_label, "dpk", data)
    upsert_csv_row(base_dir / "casa.csv", date_label, "casa", data)

    print(f"OK {date_label} <- {source_name} ({len(data)} cabang)")


def main() -> None:
    base_dir = Path(__file__).resolve().parent
    print("=" * 70)
    print("Update CSV konsol 19-Apr")
    print("=" * 70)

    for date_label, source in DATE_SOURCES:
        process_date(base_dir, date_label, source)

    print("=" * 70)
    print("Selesai.")
    print("=" * 70)


if __name__ == "__main__":
    main()
