<?php
// =============================================
// API Memories : ajouter / lister / supprimer
// =============================================

require_once __DIR__ . '/../includes/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'list';

switch ($action) {

    // ── Ajouter un souvenir ──────────────────
    case 'add':
        if ($method !== 'POST') jsonError('Méthode non autorisée', 405);
        $userId = requireAuth();

        $capsuleId   = (int) ($_POST['capsule_id'] ?? 0);
        $textContent = trim($_POST['text_content'] ?? '');

        if (!$capsuleId) jsonError('ID capsule requis.');
        if (!$textContent && empty($_FILES['image'])) {
            jsonError('Ajoutez au moins un texte ou une image.');
        }

        $db = getDB();

        // Vérifier l'accès
        $stmt = $db->prepare('SELECT * FROM capsule_members WHERE capsule_id = ? AND user_id = ?');
        $stmt->execute([$capsuleId, $userId]);
        if (!$stmt->fetch()) jsonError('Accès refusé.', 403);

        // Vérifier que la capsule n'est pas encore ouverte
        $stmt = $db->prepare('SELECT opening_date FROM capsules WHERE id = ?');
        $stmt->execute([$capsuleId]);
        $capsule = $stmt->fetch();
        if (!$capsule) jsonError('Capsule introuvable.', 404);
        if ($capsule['opening_date'] <= date('Y-m-d')) {
            jsonError('Cette capsule est déjà ouverte, impossible d\'ajouter des souvenirs.');
        }

        // Upload image
        $imagePath = null;
        if (!empty($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mimeType = finfo_file($finfo, $_FILES['image']['tmp_name']);
            finfo_close($finfo);

            if (!in_array($mimeType, $allowed)) {
                jsonError('Format d\'image non supporté (JPG, PNG, GIF, WEBP).');
            }

            if ($_FILES['image']['size'] > 5 * 1024 * 1024) {
                jsonError('L\'image ne doit pas dépasser 5 Mo.');
            }

            $ext = match ($mimeType) {
                'image/jpeg' => 'jpg',
                'image/png'  => 'png',
                'image/gif'  => 'gif',
                'image/webp' => 'webp',
                default      => 'jpg'
            };
            $filename = uniqid('mem_') . '.' . $ext;
            $uploadDir = getUploadDir();

            if (!move_uploaded_file($_FILES['image']['tmp_name'], $uploadDir . $filename)) {
                jsonError('Erreur lors de l\'upload de l\'image.', 500);
            }
            $imagePath = 'uploads/' . $filename;
        }

        $stmt = $db->prepare('INSERT INTO memories (capsule_id, user_id, text_content, image_path) VALUES (?, ?, ?, ?)');
        $stmt->execute([$capsuleId, $userId, $textContent ?: null, $imagePath]);

        jsonResponse([
            'success' => true,
            'memory' => [
                'id'           => (int) $db->lastInsertId(),
                'text_content' => $textContent,
                'image_path'   => $imagePath
            ]
        ], 201);
        break;

    // ── Supprimer un souvenir ────────────────
    case 'delete':
        if ($method !== 'POST') jsonError('Méthode non autorisée', 405);
        $userId = requireAuth();
        $data = getJsonBody();
        $memoryId = (int) ($data['memory_id'] ?? 0);

        if (!$memoryId) jsonError('ID souvenir requis.');

        $db = getDB();
        $stmt = $db->prepare('SELECT * FROM memories WHERE id = ? AND user_id = ?');
        $stmt->execute([$memoryId, $userId]);
        $memory = $stmt->fetch();

        if (!$memory) jsonError('Souvenir introuvable ou accès refusé.', 404);

        // Vérifier que la capsule n'est pas ouverte
        $stmt = $db->prepare('SELECT opening_date FROM capsules WHERE id = ?');
        $stmt->execute([$memory['capsule_id']]);
        $capsule = $stmt->fetch();
        if ($capsule && $capsule['opening_date'] <= date('Y-m-d')) {
            jsonError('Impossible de supprimer après l\'ouverture.');
        }

        // Supprimer le fichier image si présent
        if ($memory['image_path']) {
            $filePath = __DIR__ . '/../../' . $memory['image_path'];
            if (file_exists($filePath)) unlink($filePath);
        }

        $stmt = $db->prepare('DELETE FROM memories WHERE id = ?');
        $stmt->execute([$memoryId]);

        jsonResponse(['success' => true, 'message' => 'Souvenir supprimé.']);
        break;

    default:
        jsonError('Action inconnue.', 404);
}
