import pandas as pd
import xlsxwriter
import os
import sys
import re

def main():
    if len(sys.argv) >= 3:
        csv_path = sys.argv[1]
        out_path = sys.argv[2]
    else:
        # Fallback to default paths if run directly
        csv_path = r'C:\marginal\csv uker\tabungan_gabungan_all.csv'
        out_path = r'C:\marginal\MARGINAL uker 1 juni - latest agustus.xlsx'

    print(f"Reading from: {csv_path}")
    print(f"Outputting to: {out_path}")

    if not os.path.exists(csv_path):
        print(f"Error: file {csv_path} not found.")
        sys.exit(1)

    df_csv = pd.read_csv(csv_path, sep=';', dtype=str)

    def parse_val(v):
        if pd.isna(v): return 0.0
        if isinstance(v, str):
            v = v.strip()
            if not v or v == '-': return 0.0
            try:
                v = v.replace('.', '')
                v = v.replace(',', '.')
                return float(v)
            except Exception:
                return 0.0
        return float(v)

    branch_names = [col for col in df_csv.columns if col.upper() != 'UKER' and not col.startswith('Unnamed')]

    # Determine dynamic August dates
    dates_col = df_csv.iloc[:, 0].dropna()
    aug_dates_mask = dates_col.str.endswith('-Agt', na=False)
    aug_dates_list = dates_col[aug_dates_mask].tolist()
    
    max_aug_day = 0
    for d in aug_dates_list:
        try:
            day = int(d.split('-')[0])
            if day > max_aug_day:
                max_aug_day = day
        except:
            pass
            
    if max_aug_day == 0:
        print("Warning: No '-Agt' dates found. Defaulting to 1")
        max_aug_day = 1
        
    print(f"Detected latest August date: {max_aug_day}")

    june_dates = [f"{i:02d}-Jun" for i in range(1, 31)]
    july_dates = [f"{i:02d}-Jul" for i in range(1, 32)]
    aug_dates = [f"{i:02d}-Agt" for i in range(1, max_aug_day + 1)]
    dates = june_dates + july_dates + aug_dates

    # Calculate running sums efficiently
    # Data matrix: shape (len(dates), len(branch_names))
    print("Parsing data...")
    data_matrix = []
    for date_str in dates:
        row_d = df_csv[df_csv.iloc[:, 0] == date_str]
        if len(row_d) > 0:
            row_vals = [parse_val(v) for v in row_d.iloc[0][branch_names].values]
        else:
            row_vals = [0.0] * len(branch_names)
        data_matrix.append(row_vals)

    # Transpose so it's shape (len(branch_names), len(dates))
    posisi_matrix = list(map(list, zip(*data_matrix)))

    print("Calculating averages...")
    avg_matrix = []
    for b_idx in range(len(branch_names)):
        b_avg = []
        # June averages
        june_sum = 0
        for d in range(30):
            june_sum += posisi_matrix[b_idx][d]
            b_avg.append(june_sum / float(d+1))
            
        # July averages
        july_sum = 0
        for d in range(31):
            july_sum += posisi_matrix[b_idx][30 + d]
            b_avg.append(july_sum / float(d+1))
            
        # August averages
        aug_sum = 0
        for d in range(max_aug_day):
            aug_sum += posisi_matrix[b_idx][61 + d]
            b_avg.append(aug_sum / float(d+1))
        
        avg_matrix.append(b_avg)

    # Prepare DataFrame for final writing
    print("Preparing dataframe...")
    
    july_last_idx = 30 + 30 
    aug_last_idx = 61 + max_aug_day - 1 
    aug_prev_idx = aug_last_idx - 1 if max_aug_day > 1 else july_last_idx

    final_data = []
    for b_idx, b_name in enumerate(branch_names):
        row = [b_name]
        row.extend(avg_matrix[b_idx])
        
        # Posisi hari ini
        posisi = posisi_matrix[b_idx][aug_last_idx]
        
        # MTD (posisi hari ini - posisi 31-Jul)
        posisi_31jul = posisi_matrix[b_idx][july_last_idx]
        mtd = posisi - posisi_31jul
        
        # DTD (posisi hari ini - posisi H-1)
        posisi_prev = posisi_matrix[b_idx][aug_prev_idx]
        dtd = posisi - posisi_prev
        
        row.extend([posisi, mtd, dtd])
        final_data.append(row)

    # Custom mapping
    dict_uker = {
        'KCP BUAHBATU':'SUMMARECON BANDUNG',
        'KCP SUMMARECON BANDUNG':'SUMMARECON BANDUNG',
        'UNIT KARANG LAYUNG':'JATIWARAS'
    }

    print("Writing to Excel...")
    workbook = xlsxwriter.Workbook(out_path)
    worksheet = workbook.add_worksheet(f'{max_aug_day:02d} AGUSTUS 2026')

    # Define formats
    title_format = workbook.add_format({'bold': True, 'align': 'center', 'valign': 'vcenter', 'font_size': 14})
    header_blue = workbook.add_format({'bold': True, 'align': 'center', 'valign': 'vcenter', 'bg_color': '#b4c6e7', 'border': 1, 'text_wrap': True})
    header_green = workbook.add_format({'bold': True, 'align': 'center', 'valign': 'vcenter', 'bg_color': '#e2efda', 'border': 1, 'text_wrap': True})
    header_yellow = workbook.add_format({'bold': True, 'align': 'center', 'valign': 'vcenter', 'bg_color': '#fff2cc', 'border': 1, 'text_wrap': True})
    
    cell_border = workbook.add_format({'border': 1, 'valign': 'vcenter'})
    cell_border_center = workbook.add_format({'border': 1, 'align': 'center', 'valign': 'vcenter'})
    
    num_format = workbook.add_format({'border': 1, 'num_format': '#,##0', 'valign': 'vcenter'})
    num_format_red = workbook.add_format({'border': 1, 'num_format': '#,##0', 'valign': 'vcenter', 'font_color': 'red'})
    
    # Pre-calculate widths
    total_cols = 1 + len(dates) + 3 # Uker + dates + posisi, mtd, dtd
    worksheet.set_column(0, 0, 5)
    worksheet.set_column(1, 1, 8)
    worksheet.set_column(2, 2, 25)
    worksheet.set_column(3, total_cols-1, 10)

    # Merge Title
    worksheet.merge_range(1, 0, 1, total_cols-1, f"HASIL PERHITUNGAN AVERAGE TABUNGAN MARGINAL UKER 1 JUNI - {max_aug_day:02d} AGUSTUS 2026", title_format)

    # Group Headers
    worksheet.merge_range(2, 0, 3, 0, "NO", header_blue)
    worksheet.merge_range(2, 1, 3, 1, "S. BRANCH", header_blue)
    worksheet.merge_range(2, 2, 3, 2, "UKER", header_blue)
    
    # Group by months
    worksheet.merge_range(2, 3, 2, 3+29, "AVERAGE JUNI", header_blue)
    worksheet.merge_range(2, 3+30, 2, 3+30+30, "AVERAGE JULI", header_green)
    worksheet.merge_range(2, 3+61, 2, 3+61+max_aug_day-1, "AVERAGE AGUSTUS", header_yellow)
    
    worksheet.merge_range(2, 3+61+max_aug_day, 3, 3+61+max_aug_day, "POSISI HARI INI", header_blue)
    worksheet.merge_range(2, 3+61+max_aug_day+1, 3, 3+61+max_aug_day+1, "MTD (Y-Y)", header_blue)
    worksheet.merge_range(2, 3+61+max_aug_day+2, 3, 3+61+max_aug_day+2, "DTD (Y-Y)", header_blue)
    
    # Date Headers
    for i, d_str in enumerate(dates):
        color = header_blue
        if '-Jul' in d_str: color = header_green
        elif '-Agt' in d_str: color = header_yellow
        worksheet.write(3, 3+i, d_str.split('-')[0], color)

    # Write data
    start_row = 4
    for r_idx, row_data in enumerate(final_data):
        b_name = row_data[0]
        display_name = dict_uker.get(b_name, b_name)
        
        # Branch Code extraction (simple fallback)
        try:
            b_code = display_name.split()[-1]
            if not b_code.isdigit():
                b_code = b_name.split()[-1]
        except:
            b_code = ""
            
        worksheet.write(start_row + r_idx, 0, r_idx + 1, cell_border_center)
        worksheet.write(start_row + r_idx, 1, b_code, cell_border_center)
        worksheet.write(start_row + r_idx, 2, display_name, cell_border)
        
        for c_idx in range(1, len(row_data)):
            val = row_data[c_idx]
            if val < 0:
                worksheet.write(start_row + r_idx, 2 + c_idx, val, num_format_red)
            else:
                worksheet.write(start_row + r_idx, 2 + c_idx, val, num_format)

    workbook.close()
    print("Done!")

if __name__ == '__main__':
    main()
