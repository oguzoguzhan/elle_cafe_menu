<?php
require_once __DIR__ . '/config.php';

setCORSHeaders();
session_start();

$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['REQUEST_URI'];

// GET - List products (optionally filter by category)
if ($method === 'GET') {
    $conn = getDBConnection();

    // Check if category_id is in query string
    $categoryId = isset($_GET['category_id']) ? intval($_GET['category_id']) : null;

    if ($categoryId) {
        $stmt = $conn->prepare('SELECT * FROM products WHERE category_id = ? ORDER BY sort_order ASC');
        $stmt->execute([$categoryId]);
    } else {
        $stmt = $conn->query('SELECT * FROM products ORDER BY sort_order ASC');
    }

    $products = $stmt->fetchAll();
    sendJSON($products);
}

// POST - Create new product (admin only)
if ($method === 'POST') {
    verifyAdminSession();
    $input = getJSONInput();

    if (!isset($input['category_id']) || !isset($input['name'])) {
        sendError('Category ID and product name are required');
    }

    $conn = getDBConnection();

    // Get next sort order for this category
    $stmt = $conn->prepare('SELECT COALESCE(MAX(sort_order), -1) + 1 as next_order FROM products WHERE category_id = ?');
    $stmt->execute([$input['category_id']]);
    $nextOrder = $stmt->fetch()['next_order'];

    $stmt = $conn->prepare(
        'INSERT INTO products (category_id, name, description, image_url, price, warning_text, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        $input['category_id'],
        $input['name'],
        $input['description'] ?? null,
        $input['image_url'] ?? null,
        $input['price'] ?? null,
        $input['warning_text'] ?? null,
        $nextOrder
    ]);

    $id = $conn->lastInsertId();
    $stmt = $conn->prepare('SELECT * FROM products WHERE id = ?');
    $stmt->execute([$id]);
    $product = $stmt->fetch();

    sendJSON($product, 201);
}

// PUT - Update product (admin only)
if ($method === 'PUT') {
    verifyAdminSession();
    $input = getJSONInput();

    if (!isset($input['id'])) {
        sendError('Product ID is required');
    }

    $conn = getDBConnection();

    $fields = [];
    $values = [];

    if (isset($input['name'])) {
        $fields[] = 'name = ?';
        $values[] = $input['name'];
    }

    if (isset($input['description'])) {
        $fields[] = 'description = ?';
        $values[] = $input['description'];
    }

    if (isset($input['image_url'])) {
        $fields[] = 'image_url = ?';
        $values[] = $input['image_url'];
    }

    if (isset($input['price'])) {
        $fields[] = 'price = ?';
        $values[] = $input['price'];
    }

    if (isset($input['warning_text'])) {
        $fields[] = 'warning_text = ?';
        $values[] = $input['warning_text'];
    }

    if (isset($input['sort_order'])) {
        $fields[] = 'sort_order = ?';
        $values[] = $input['sort_order'];
    }

    if (isset($input['category_id'])) {
        $fields[] = 'category_id = ?';
        $values[] = $input['category_id'];
    }

    if (empty($fields)) {
        sendError('No fields to update');
    }

    $values[] = $input['id'];
    $sql = 'UPDATE products SET ' . implode(', ', $fields) . ' WHERE id = ?';
    $stmt = $conn->prepare($sql);
    $stmt->execute($values);

    $stmt = $conn->prepare('SELECT * FROM products WHERE id = ?');
    $stmt->execute([$input['id']]);
    $product = $stmt->fetch();

    if (!$product) {
        sendError('Product not found', 404);
    }

    sendJSON($product);
}

// DELETE - Delete product (admin only)
if ($method === 'DELETE') {
    verifyAdminSession();
    $input = getJSONInput();

    if (!isset($input['id'])) {
        sendError('Product ID is required');
    }

    $conn = getDBConnection();
    $stmt = $conn->prepare('DELETE FROM products WHERE id = ?');
    $stmt->execute([$input['id']]);

    if ($stmt->rowCount() === 0) {
        sendError('Product not found', 404);
    }

    sendJSON(['message' => 'Product deleted successfully']);
}

sendError('Method not allowed', 405);
?>
