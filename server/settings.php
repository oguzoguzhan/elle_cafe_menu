<?php
require_once __DIR__ . '/config.php';

setCORSHeaders();
session_start();

$method = $_SERVER['REQUEST_METHOD'];

// GET - Get settings
if ($method === 'GET') {
    $conn = getDBConnection();
    $stmt = $conn->query('SELECT * FROM settings LIMIT 1');
    $settings = $stmt->fetch();

    if (!$settings) {
        sendError('Settings not found', 404);
    }

    sendJSON($settings);
}

// PUT - Update settings (admin only)
if ($method === 'PUT') {
    verifyAdminSession();
    $input = getJSONInput();

    $conn = getDBConnection();

    $fields = [];
    $values = [];

    $allowedFields = [
        'logo_url',
        'header_logo_url',
        'site_title',
        'header_bg_color',
        'header_text_color',
        'landing_bg_color',
        'categories_bg_color',
        'products_bg_color',
        'nav_bg_color',
        'nav_text_color',
        'nav_hover_bg_color',
        'category_grid_cols',
        'category_text_color',
        'product_grid_cols',
        'product_name_color',
        'product_price_color',
        'product_description_color',
        'product_warning_color',
        'product_warning_bg_color',
        'product_image_width',
        'back_button_bg_color',
        'back_button_text_color',
        'back_button_hover_bg_color'
    ];

    foreach ($allowedFields as $field) {
        if (isset($input[$field])) {
            $fields[] = "$field = ?";
            $values[] = $input[$field];
        }
    }

    if (empty($fields)) {
        sendError('No fields to update');
    }

    $sql = 'UPDATE settings SET ' . implode(', ', $fields) . ' WHERE id = 1';
    $stmt = $conn->prepare($sql);
    $stmt->execute($values);

    $stmt = $conn->query('SELECT * FROM settings WHERE id = 1');
    $settings = $stmt->fetch();

    sendJSON($settings);
}

sendError('Method not allowed', 405);
?>
