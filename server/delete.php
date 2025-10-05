<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['filename'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Filename required']);
    exit;
}

$filename = basename($input['filename']);
$filepath = __DIR__ . '/../uploads/img/' . $filename;

if (file_exists($filepath)) {
    if (unlink($filepath)) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete file']);
    }
} else {
    http_response_code(404);
    echo json_encode(['error' => 'File not found']);
}
?>
