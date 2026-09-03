import pandas as pd
import os

csv_path = r'C:\marginal\csv uker\tabungan_gabungan_all.csv'
out_path = r'C:\marginal\MARGINAL uker 1 juni - 22 agustus.xlsx'

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

june_dates = [f"{i:02d}-Jun" for i in range(1, 31)]
july_dates = [f"{i:02d}-Jul" for i in range(1, 32)]
aug_dates = [f"{i:02d}-Agt" for i in range(1, 23)]
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
    for d in range(22):
        aug_sum += posisi_matrix[b_idx][61 + d]
        b_avg.append(aug_sum / float(d+1))
    
    avg_matrix.append(b_avg)

# Load mapping for Kode Uker
uker_mapping_path = r'C:\marginal\uker\KERANGKA UKER.xlsx'
df_uker = pd.read_excel(uker_mapping_path)
dict_uker = {str(row['Nama Uker']).strip().upper(): str(row['Kode Branch']).strip() for _, row in df_uker.iterrows() if pd.notna(row['Nama Uker'])}

# Manual overrides for slightly different names
dict_uker['UNIT CIUMBULEUIT'] = '761'
dict_uker['UNIT MOH TOHA'] = '768'
dict_uker['KCP SUMMARECON'] = '1141'
dict_uker['UNIT JATIWARAS'] = '4452'

# Prepare DataFrame for export
print("Preparing dataframe...")
columns = ['NO', 'KODE UKER', 'UKER'] + dates + ['MTD', 'DTD'] + dates + ['MTD', 'DTD']
df_out = pd.DataFrame(columns=columns)

rows_list = []
for b_idx, branch in enumerate(branch_names):
    b_strip = branch.strip()
    kode_uker = dict_uker.get(b_strip.upper(), "")
    
    pos_vals = posisi_matrix[b_idx]
    pos_last = pos_vals[-1]
    pos_prev = pos_vals[-2] if len(pos_vals) > 1 else pos_last
    pos_31jul = pos_vals[60] # Index 60 is 31-Jul
    pos_mtd = pos_last - pos_31jul
    pos_dtd = pos_last - pos_prev
    
    avg_vals = avg_matrix[b_idx]
    avg_last = avg_vals[-1]
    avg_prev = avg_vals[-2] if len(avg_vals) > 1 else avg_last
    avg_31jul = avg_vals[60]
    avg_mtd = avg_last - avg_31jul
    avg_dtd = avg_last - avg_prev
    
    row_data = [b_idx+1, kode_uker, b_strip] + pos_vals + [pos_mtd, pos_dtd] + avg_vals + [avg_mtd, avg_dtd]
    rows_list.append(row_data)

df_out = pd.DataFrame(rows_list, columns=columns)

# Write to Excel with xlsxwriter
print("Writing to Excel...")
writer = pd.ExcelWriter(out_path, engine='xlsxwriter')
workbook = writer.book
worksheet = workbook.add_worksheet('UKER MARGINAL')

# Define formats
title_format = workbook.add_format({'bg_color': '#002060', 'font_color': '#FFFFFF', 'bold': True, 'align': 'left', 'valign': 'vcenter'})
header_blue = workbook.add_format({'bg_color': '#002060', 'font_color': '#FFFFFF', 'bold': True, 'align': 'center', 'valign': 'vcenter', 'border': 1, 'border_color': '#A6A6A6'})
header_orange = workbook.add_format({'bg_color': '#ED7D31', 'font_color': '#FFFFFF', 'bold': True, 'align': 'center', 'valign': 'vcenter', 'border': 1, 'border_color': '#A6A6A6'})
header_black = workbook.add_format({'bg_color': '#000000', 'font_color': '#FFFFFF', 'bold': True, 'align': 'center', 'valign': 'vcenter', 'border': 1, 'border_color': '#A6A6A6'})

cell_white = workbook.add_format({'num_format': '#,##0', 'border': 1, 'border_color': '#A6A6A6'})
cell_grey = workbook.add_format({'num_format': '#,##0', 'border': 1, 'border_color': '#A6A6A6', 'bg_color': '#F2F2F2'})
cell_white_red = workbook.add_format({'num_format': '#,##0', 'border': 1, 'border_color': '#A6A6A6', 'font_color': '#FF0000'})
cell_grey_red = workbook.add_format({'num_format': '#,##0', 'border': 1, 'border_color': '#A6A6A6', 'bg_color': '#F2F2F2', 'font_color': '#FF0000'})

center_white = workbook.add_format({'align': 'center', 'border': 1, 'border_color': '#A6A6A6'})
center_grey = workbook.add_format({'align': 'center', 'border': 1, 'border_color': '#A6A6A6', 'bg_color': '#F2F2F2'})

left_white = workbook.add_format({'border': 1, 'border_color': '#A6A6A6'})
left_grey = workbook.add_format({'border': 1, 'border_color': '#A6A6A6', 'bg_color': '#F2F2F2'})

# Set columns width
num_dates = len(dates)
total_cols = 3 + num_dates + 2 + num_dates + 2
worksheet.set_column(0, 0, 5)
worksheet.set_column(1, 1, 15)
worksheet.set_column(2, 2, 35)
worksheet.set_column(3, total_cols-1, 10)

# Merge Title
worksheet.merge_range(1, 0, 1, total_cols-1, "HASIL PERHITUNGAN AVERAGE TABUNGAN MARGINAL UKER 1 JUNI - 22 AGUSTUS 2026", title_format)

# Group Headers
worksheet.merge_range(2, 0, 3, 0, "NO", header_blue)
worksheet.merge_range(2, 1, 3, 1, "KODE UKER", header_blue)
worksheet.merge_range(2, 2, 3, 2, "UKER", header_blue)

pos_start = 3
pos_end = pos_start + num_dates - 1
worksheet.merge_range(2, pos_start, 2, pos_end, "POSISI", header_orange)

pos_mtd = pos_end + 1
pos_dtd = pos_end + 2
worksheet.merge_range(2, pos_mtd, 3, pos_mtd, "MTD", header_black)
worksheet.merge_range(2, pos_dtd, 3, pos_dtd, "DTD", header_black)

avg_start = pos_dtd + 1
avg_end = avg_start + num_dates - 1
worksheet.merge_range(2, avg_start, 2, avg_end, "AVERAGE MARGINAL", header_blue)

avg_mtd = avg_end + 1
avg_dtd = avg_end + 2
worksheet.merge_range(2, avg_mtd, 3, avg_mtd, "MTD", header_black)
worksheet.merge_range(2, avg_dtd, 3, avg_dtd, "DTD", header_black)

# Date Headers
col = pos_start
for d in dates:
    worksheet.write(3, col, d, header_orange)
    col += 1
col = avg_start
for d in dates:
    worksheet.write(3, col, d, header_blue)
    col += 1

# Data Rows
row_idx = 4
for r in rows_list:
    is_odd = (row_idx % 2 == 1)
    
    # 0: NO, 1: KODE UKER, 2: UKER
    worksheet.write(row_idx, 0, r[0], center_grey if is_odd else center_white)
    worksheet.write(row_idx, 1, r[1], center_grey if is_odd else center_white)
    worksheet.write(row_idx, 2, r[2], left_grey if is_odd else left_white)
    
    # POSISI dates
    c_idx = 3
    for i in range(num_dates):
        worksheet.write(row_idx, c_idx, r[c_idx], cell_grey if is_odd else cell_white)
        c_idx += 1
        
    # POSISI MTD & DTD
    worksheet.write(row_idx, c_idx, r[c_idx], (cell_grey_red if is_odd else cell_white_red) if r[c_idx] < 0 else (cell_grey if is_odd else cell_white))
    c_idx += 1
    worksheet.write(row_idx, c_idx, r[c_idx], (cell_grey_red if is_odd else cell_white_red) if r[c_idx] < 0 else (cell_grey if is_odd else cell_white))
    c_idx += 1
    
    # AVERAGE dates
    for i in range(num_dates):
        worksheet.write(row_idx, c_idx, r[c_idx], cell_grey if is_odd else cell_white)
        c_idx += 1
        
    # AVERAGE MTD & DTD
    worksheet.write(row_idx, c_idx, r[c_idx], (cell_grey_red if is_odd else cell_white_red) if r[c_idx] < 0 else (cell_grey if is_odd else cell_white))
    c_idx += 1
    worksheet.write(row_idx, c_idx, r[c_idx], (cell_grey_red if is_odd else cell_white_red) if r[c_idx] < 0 else (cell_grey if is_odd else cell_white))
    
    row_idx += 1

worksheet.freeze_panes(4, 2)
writer.close()
print("Done!")
