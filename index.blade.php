@extends('layouts.app')

@section('title', 'Uker Marginal Average')

@section('content')
<div class="page-title">
    <h2>Generate Average Tabungan Uker Marginal</h2>
</div>

<div class="row">
    <div class="col-md-8 col-lg-6">
        <div class="card card-custom">
            <div class="card-header bg-white pb-0">
                <h5 class="card-title text-primary"><i class="bi bi-file-earmark-excel"></i> Proses Rekap Uker Marginal</h5>
            </div>
            <div class="card-body mt-3">
                @if(session('error'))
                    <div class="alert alert-danger alert-dismissible fade show" role="alert">
                        <strong>Gagal!</strong> {{ session('error') }}
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                @endif
                
                @if(session('success'))
                    <div class="alert alert-success alert-dismissible fade show" role="alert">
                        <strong>Berhasil!</strong> {{ session('success') }}
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                @endif

                <p class="text-muted">
                    Fitur ini akan menjalankan skrip secara otomatis untuk menarik data dari file <code>C:\marginal\csv uker\tabungan_gabungan_all.csv</code>.
                    Sistem akan secara otomatis mendeteksi tanggal laporan terakhir (hingga bulan berjalan) dan menghitung <strong>Average</strong>, <strong>MTD</strong>, serta <strong>DTD</strong>.
                </p>

                <div class="alert alert-info" role="alert">
                    <i class="bi bi-info-circle me-2"></i> Pastikan file <strong>tabungan_gabungan_all.csv</strong> Anda sudah *up-to-date* sebelum menekan tombol generate.
                </div>

                <form action="{{ route('uker-marginal.process') }}" method="POST" id="formGenerate">
                    @csrf
                    <div class="d-grid gap-2 mt-4">
                        <button type="submit" class="btn btn-primary btn-lg" id="btnGenerate">
                            <i class="bi bi-gear-fill me-2"></i> Generate & Download Excel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<script>
    document.getElementById('formGenerate').addEventListener('submit', function() {
        const btn = document.getElementById('btnGenerate');
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Sedang memproses... Harap tunggu.';
        btn.classList.add('disabled');
        
        // Timeout to reset button after typical download time (e.g. 20s)
        setTimeout(() => {
            btn.innerHTML = '<i class="bi bi-gear-fill me-2"></i> Generate & Download Excel';
            btn.classList.remove('disabled');
        }, 20000);
    });
</script>
@endsection
