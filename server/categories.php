<?php
require_once __DIR__ . '/config.php';

setCORSHeaders();
session_start();

$method = $_SERVER['REQUEST_METHOD'];

// GET - List all categories
if ($method === 'GET') {
    $conn = getDBConnection();
    $stmt = $conn->query('SELECT * FROM categories ORDER BY sort_order ASC');
    $categories = $stmt->fetchAll();
    sendJSON($categories);
}

// POST - Create new category (admin only)
if ($method === 'POST') {
    verifyAdminSession();
    $input = getJSONInput();

    if (!isset($input['name'])) {
        sendError('Category name is required');
    }

    $conn = getDBConnection();

    // Get next sort order
    $stmt = $conn->query('SELECT COALESCE(MAX(sort_order), -1) + 1 as next_order FROM categories');
    $nextOrder = $stmt->fetch()['next_order'];

    $stmt = $conn->prepare('INSERT INTO categories (name, image_url, sort_order) VALUES (?, ?, ?)');
    $stmt->execute([
        $input['name'],
        $input['image_url'] ?? null,
        $nextOrder
    ]);

    $id = $conn->lastInsertId();
    $stmt = $conn->prepare('SELECT * FROM categories WHERE id = ?');
    $stmt->execute([$id]);
    $category = $stmt->fetch();

    sendJSON($category, 201);
}

// PUT - Update category (admin only)
if ($method === 'PUT') {
    verifyAdminSession();
    $input = getJSONInput();

    if (!isset($input['id'])) {
        sendError('Category ID is required');
    }

    $conn = getDBConnection();

    $fields = [];
    $values = [];

    if (isset($input['name'])) {
        $fields[] = 'name = ?';
        $values[] = $input['name'];
    }

    if (isset($input['image_url'])) {
        $fields[] = 'image_url = ?';
        $values[] = $input['image_url'];
    }

    if (isset($input['sort_order'])) {
        $fields[] = 'sort_order = ?';
        $values[] = $input['sort_order'];
    }

    if (empty($fields)) {
        sendError('No fields to update');
    }

    $values[] = $input['id'];
    $sql = 'UPDATE categories SET ' . implode(', ', $fields) . ' WHERE id = ?';
    $stmt = $conn->prepare($sql);
    $stmt->execute($values);

    $stmt = $conn->prepare('SELECT * FROM categories WHERE id = ?');
    $stmt->execute([$input['id']]);
    $category = $stmt->fetch();

    if (!$category) {
        sendError('Category not found', 404);
    }

    sendJSON($category);
}

// DELETE - Delete category (admin only)
if ($method === 'DELETE') {
    verifyAdminSession();
    $input = getJSONInput();

    if (!isset($input['id'])) {
        sendError('Category ID is required');
    }

    $conn = getDBConnection();
    $stmt = $conn->prepare('DELETE FROM categories WHERE id = ?');
    $stmt->execute([$input['id']]);

    if ($stmt->rowCount() === 0) {
        sendError('Category not found', 404);
    }

    sendJSON(['message' => 'Category deleted successfully']);
}

sendError('Method not allowed', 405);
?>
