<?php
// =============================================
// API Auth : register / login / logout / me
// =============================================

require_once __DIR__ . '/includes/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($action) {

    // ── Inscription ──────────────────────────
    case 'register':
        if ($method !== 'POST') jsonError('Méthode non autorisée', 405);

        $data = getJsonBody();
        $username = trim($data['username'] ?? '');
        $email    = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';

        if (!$username || !$email || !$password) {
            jsonError('Tous les champs sont obligatoires.');
        }
        if (strlen($username) < 3) {
            jsonError('Le pseudo doit contenir au moins 3 caractères.');
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            jsonError('Adresse email invalide.');
        }
        if (strlen($password) < 6) {
            jsonError('Le mot de passe doit contenir au moins 6 caractères.');
        }

        $db = getDB();

        // Vérifier unicité
        $stmt = $db->prepare('SELECT id FROM users WHERE username = ? OR email = ?');
        $stmt->execute([$username, $email]);
        if ($stmt->fetch()) {
            jsonError('Ce pseudo ou cet email est déjà utilisé.');
        }

        $hash = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $db->prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)');
        $stmt->execute([$username, $email, $hash]);

        $userId = (int) $db->lastInsertId();
        $_SESSION['user_id'] = $userId;

        jsonResponse([
            'success' => true,
            'user' => [
                'id'       => $userId,
                'username' => $username,
                'email'    => $email
            ]
        ], 201);
        break;

    // ── Connexion ────────────────────────────
    case 'login':
        if ($method !== 'POST') jsonError('Méthode non autorisée', 405);

        $data = getJsonBody();
        $login    = trim($data['login'] ?? '');
        $password = $data['password'] ?? '';

        if (!$login || !$password) {
            jsonError('Identifiant et mot de passe requis.');
        }

        $db = getDB();
        $stmt = $db->prepare('SELECT * FROM users WHERE username = ? OR email = ?');
        $stmt->execute([$login, $login]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            jsonError('Identifiant ou mot de passe incorrect.', 401);
        }

        $_SESSION['user_id'] = (int) $user['id'];

        jsonResponse([
            'success' => true,
            'user' => [
                'id'       => (int) $user['id'],
                'username' => $user['username'],
                'email'    => $user['email'],
                'avatar'   => $user['avatar']
            ]
        ]);
        break;

    // ── Déconnexion ──────────────────────────
    case 'logout':
        session_destroy();
        jsonResponse(['success' => true, 'message' => 'Déconnecté.']);
        break;

    // ── Utilisateur courant ──────────────────
    case 'me':
        $userId = requireAuth();
        $db = getDB();
        $stmt = $db->prepare('SELECT id, username, email, avatar, created_at FROM users WHERE id = ?');
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        if (!$user) {
            session_destroy();
            jsonError('Utilisateur introuvable.', 404);
        }

        jsonResponse(['success' => true, 'user' => $user]);
        break;

    default:
        jsonError('Action inconnue.', 404);
}
