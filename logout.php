<?php
declare(strict_types=1);

require_once __DIR__ . '/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: index.php');
    exit;
}

$token = (string) ($_POST['csrf_token'] ?? '');
if (!auth_verify_csrf($token)) {
    http_response_code(403);
    exit('Permintaan tidak valid. Silakan kembali dan coba lagi.');
}

auth_logout();
header('Location: login.php?logged_out=1');
exit;
