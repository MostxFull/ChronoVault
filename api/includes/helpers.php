<?php
// =============================================
// Helpers communs pour l'API
// =============================================

// Afficher les erreurs PHP dans la réponse JSON
error_reporting(E_ALL);
ini_set('display_errors', 0); // Ne pas afficher en HTML
set_exception_handler(function ($e) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ], JSON_UNESCAPED_UNICODE);
    exit;
});
set_error_handler(function ($severity, $message, $file, $line) {
    throw new ErrorException($message, 0, $severity, $file, $line);
});

session_start();

require_once __DIR__ . '/../config/database.php';

// Headers CORS + JSON
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Gérer les requêtes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

/**
 * Envoie une réponse JSON
 */
function jsonResponse(mixed $data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Envoie une erreur JSON
 */
function jsonError(string $message, int $code = 400): void {
    jsonResponse(['success' => false, 'error' => $message], $code);
}

/**
 * Récupère le body JSON de la requête
 */
function getJsonBody(): array {
    $body = file_get_contents('php://input');
    $data = json_decode($body, true);
    return is_array($data) ? $data : [];
}

/**
 * Vérifie si l'utilisateur est connecté
 */
function requireAuth(): int {
    if (!isset($_SESSION['user_id'])) {
        jsonError('Non authentifié. Veuillez vous connecter.', 401);
    }
    return (int) $_SESSION['user_id'];
}

/**
 * Dossier d'upload des images
 */
function getUploadDir(): string {
    $dir = __DIR__ . '/../../uploads/';
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    return $dir;
}
