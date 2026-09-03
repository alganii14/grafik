<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class UkerMarginalController extends Controller
{
    public function index()
    {
        return view('uker-marginal.index');
    }

    public function process(Request $request)
    {
        // Setup paths
        $scriptPath = base_path('scripts/process_uker_marginal.py');
        
        // Cek path python. Mengikuti struktur yang ada di GabunganTabunganController
        $pythonExe = 'C:\\Users\\SWIFT GO\\AppData\\Local\\Python\\bin\\python.exe';
        if (!file_exists($pythonExe)) {
            // Coba path venv
            $pythonExe = 'C:\\xampp\\htdocs\\grafik-main\\grafik-main\\.venv\\Scripts\\python.exe';
            if (!file_exists($pythonExe)) {
                $pythonExe = 'python'; // Fallback
            }
        }

        // Kita biarkan skrip menggunakan path default C:\marginal\csv uker\tabungan_gabungan_all.csv
        // Tapi kita juga bisa pass argumen eksplisit jika file diupload, 
        // Namun karena ini biasanya ditarik otomatis/terpusat, kita jalankan saja script pythonnya
        
        // Define explicit paths to match the user's manual process
        $inputCsvPath = 'C:\\marginal\\csv uker\\tabungan_gabungan_all.csv';
        
        // Untuk output, kita buat temporary path agar bisa di-download via Laravel
        $tempDir = storage_path('app/public/temp_marginal');
        if (!file_exists($tempDir)) {
            mkdir($tempDir, 0755, true);
        }
        
        $outputFileName = 'MARGINAL_uker_terbaru_' . time() . '.xlsx';
        $outputExcelPath = $tempDir . '/' . $outputFileName;

        // Jalankan perintah python
        $process = new Process([$pythonExe, $scriptPath, $inputCsvPath, $outputExcelPath]);
        $process->setTimeout(600); // 10 menit timeout
        
        try {
            $process->mustRun();
            
            if (file_exists($outputExcelPath)) {
                // Proses berhasil, download file
                return response()->download($outputExcelPath, 'MARGINAL uker 1 juni - terbaru.xlsx')->deleteFileAfterSend(true);
            } else {
                Log::error('Output file not found after processing.');
                return back()->with('error', 'Proses selesai tetapi file Excel tidak ditemukan.');
            }
            
        } catch (ProcessFailedException $exception) {
            Log::error('Error processing Uker Marginal: ' . $exception->getMessage());
            return back()->with('error', 'Terjadi kesalahan saat mengeksekusi skrip python. Pastikan file CSV tersedia di C:\\marginal\\csv uker\\tabungan_gabungan_all.csv. Pesan error: ' . $exception->getMessage());
        }
    }
}
