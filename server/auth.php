<?php
require_once __DIR__ . '/config.php';

setCORSHeaders();

session_start();

$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['REQUEST_URI'];

// Login endpoint
if ($method === 'POST' && strpos($path, '/api/auth/login') !== false) {
    $input = getJSONInput();

    if (!isset($input['username']) || !isset($input['password'])) {
        sendError('Username and password required', 400);
    }

    $conn = getDBConnection();
    $stmt = $conn->prepare('SELECT id, username, password_hash FROM admin_users WHERE username = ?');
    $stmt->execute([$input['username']]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($input['password'], $user['password_hash'])) {
        sendError('Invalid credentials', 401);
    }

    $_SESSION['admin_id'] = $user['id'];
    $_SESSION['admin_username'] = $user['username'];

    sendJSON([
        'id' => $user['id'],
        'username' => $user['username']
    ]);
}

// Logout endpoint
if ($method === 'POST' && strpos($path, '/api/auth/logout') !== false) {
    session_destroy();
    sendJSON(['message' => 'Logged out successfully']);
}

// Check session endpoint
if ($method === 'GET' && strpos($path, '/api/auth/session') !== false) {
    if (isset($_SESSION['admin_id'])) {
        sendJSON([
            'id' => $_SESSION['admin_id'],
            'username' => $_SESSION['admin_username']
        ]);
    } else {
        sendError('Not authenticated', 401);
    }
}

sendError('Not found', 404);
?>
