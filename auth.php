<?php
declare(strict_types=1);

const AUTH_DEFAULT_USERNAME = 'admin';
const AUTH_DEFAULT_PASSWORD_HASH = '$2y$10$NjsjysrqPcVSpLLOBjGu.udIMHyMzRBNwRFd3wf/9Qkz0SbIGL2I2';
const AUTH_MAX_ATTEMPTS = 5;
const AUTH_LOCK_SECONDS = 30;

function auth_start_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    $isHttps = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    session_name('dpk_dashboard_session');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => $isHttps,
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    session_start();
}

auth_start_session();

function auth_is_authenticated(): bool
{
    return isset($_SESSION['auth_user']) && is_string($_SESSION['auth_user']);
}

function auth_current_user(): string
{
    return auth_is_authenticated() ? $_SESSION['auth_user'] : '';
}

function auth_require_login(): void
{
    if (auth_is_authenticated()) {
        return;
    }

    header('Location: login.php');
    exit;
}

function auth_csrf_token(): string
{
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    return $_SESSION['csrf_token'];
}

function auth_verify_csrf(string $token): bool
{
    return isset($_SESSION['csrf_token'])
        && hash_equals($_SESSION['csrf_token'], $token);
}

function auth_expected_username(): string
{
    $configured = getenv('DPK_AUTH_USERNAME');
    return $configured !== false && $configured !== ''
        ? $configured
        : AUTH_DEFAULT_USERNAME;
}

function auth_expected_password_hash(): string
{
    $configuredHash = getenv('DPK_AUTH_PASSWORD_HASH');
    if ($configuredHash !== false && $configuredHash !== '') {
        return $configuredHash;
    }

    $configuredPassword = getenv('DPK_AUTH_PASSWORD');
    if ($configuredPassword !== false && $configuredPassword !== '') {
        return password_hash($configuredPassword, PASSWORD_DEFAULT);
    }

    return AUTH_DEFAULT_PASSWORD_HASH;
}

function auth_seconds_until_unlock(): int
{
    $lockedUntil = (int) ($_SESSION['auth_locked_until'] ?? 0);
    if ($lockedUntil <= time()) {
        unset($_SESSION['auth_locked_until']);
        return 0;
    }

    return $lockedUntil - time();
}

function auth_record_failed_attempt(): void
{
    $attempts = (int) ($_SESSION['auth_failed_attempts'] ?? 0) + 1;
    if ($attempts >= AUTH_MAX_ATTEMPTS) {
        $_SESSION['auth_locked_until'] = time() + AUTH_LOCK_SECONDS;
        $_SESSION['auth_failed_attempts'] = 0;
        return;
    }

    $_SESSION['auth_failed_attempts'] = $attempts;
}

function auth_attempt_login(string $username, string $password): bool
{
    if (auth_seconds_until_unlock() > 0) {
        return false;
    }

    $usernameMatches = hash_equals(auth_expected_username(), $username);
    $passwordMatches = password_verify($password, auth_expected_password_hash());

    if (!$usernameMatches || !$passwordMatches) {
        auth_record_failed_attempt();
        return false;
    }

    session_regenerate_id(true);
    $_SESSION['auth_user'] = $username;
    $_SESSION['auth_login_time'] = time();
    unset($_SESSION['auth_failed_attempts'], $_SESSION['auth_locked_until']);
    auth_csrf_token();

    return true;
}

function auth_logout(): void
{
    $_SESSION = [];

    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
    }

    session_destroy();
}
