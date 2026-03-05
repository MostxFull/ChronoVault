<?php
// =============================================
// API Capsules : CRUD + membres
// =============================================

require_once __DIR__ . '/../includes/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'list';

switch ($action) {

    // ── Lister mes capsules ──────────────────
    case 'list':
        $userId = requireAuth();
        $db = getDB();

        $stmt = $db->prepare('
            SELECT c.*, u.username AS creator_name,
                   (SELECT COUNT(*) FROM capsule_members WHERE capsule_id = c.id) AS member_count,
                   (SELECT COUNT(*) FROM memories WHERE capsule_id = c.id) AS memory_count
            FROM capsules c
            JOIN capsule_members cm ON cm.capsule_id = c.id
            JOIN users u ON u.id = c.creator_id
            WHERE cm.user_id = ?
            ORDER BY c.opening_date ASC
        ');
        $stmt->execute([$userId]);
        $capsules = $stmt->fetchAll();

        // Mettre à jour l'état d'ouverture
        $today = date('Y-m-d');
        foreach ($capsules as &$cap) {
            $cap['is_opened'] = ($cap['opening_date'] <= $today) ? 1 : 0;
        }

        jsonResponse(['success' => true, 'capsules' => $capsules]);
        break;

    // ── Détail d'une capsule ─────────────────
    case 'detail':
        $userId = requireAuth();
        $capsuleId = (int) ($_GET['id'] ?? 0);
        if (!$capsuleId) jsonError('ID capsule requis.');

        $db = getDB();

        // Vérifier l'accès
        $stmt = $db->prepare('SELECT * FROM capsule_members WHERE capsule_id = ? AND user_id = ?');
        $stmt->execute([$capsuleId, $userId]);
        if (!$stmt->fetch()) jsonError('Accès refusé.', 403);

        // Capsule
        $stmt = $db->prepare('
            SELECT c.*, u.username AS creator_name
            FROM capsules c
            JOIN users u ON u.id = c.creator_id
            WHERE c.id = ?
        ');
        $stmt->execute([$capsuleId]);
        $capsule = $stmt->fetch();
        if (!$capsule) jsonError('Capsule introuvable.', 404);

        $today = date('Y-m-d');
        $capsule['is_opened'] = ($capsule['opening_date'] <= $today) ? 1 : 0;

        // Membres
        $stmt = $db->prepare('
            SELECT u.id, u.username, u.avatar, cm.role, cm.joined_at
            FROM capsule_members cm
            JOIN users u ON u.id = cm.user_id
            WHERE cm.capsule_id = ?
        ');
        $stmt->execute([$capsuleId]);
        $members = $stmt->fetchAll();

        // Souvenirs (seulement si ouverte, ou seulement les miens)
        if ($capsule['is_opened']) {
            $stmt = $db->prepare('
                SELECT m.*, u.username 
                FROM memories m
                JOIN users u ON u.id = m.user_id
                WHERE m.capsule_id = ?
                ORDER BY m.created_at ASC
            ');
            $stmt->execute([$capsuleId]);
        } else {
            $stmt = $db->prepare('
                SELECT m.*, u.username 
                FROM memories m
                JOIN users u ON u.id = m.user_id
                WHERE m.capsule_id = ? AND m.user_id = ?
                ORDER BY m.created_at ASC
            ');
            $stmt->execute([$capsuleId, $userId]);
        }
        $memories = $stmt->fetchAll();

        jsonResponse([
            'success' => true,
            'capsule'  => $capsule,
            'members'  => $members,
            'memories' => $memories
        ]);
        break;

    // ── Créer une capsule ────────────────────
    case 'create':
        if ($method !== 'POST') jsonError('Méthode non autorisée', 405);
        $userId = requireAuth();
        $data = getJsonBody();

        $title       = trim($data['title'] ?? '');
        $description = trim($data['description'] ?? '');
        $openingDate = trim($data['opening_date'] ?? '');

        if (!$title || !$openingDate) {
            jsonError('Titre et date d\'ouverture obligatoires.');
        }
        if ($openingDate <= date('Y-m-d')) {
            jsonError('La date d\'ouverture doit être dans le futur.');
        }

        $db = getDB();
        $db->beginTransaction();

        try {
            $stmt = $db->prepare('INSERT INTO capsules (title, description, opening_date, creator_id) VALUES (?, ?, ?, ?)');
            $stmt->execute([$title, $description, $openingDate, $userId]);
            $capsuleId = (int) $db->lastInsertId();

            // Ajouter le créateur comme membre
            $stmt = $db->prepare('INSERT INTO capsule_members (capsule_id, user_id, role) VALUES (?, ?, "creator")');
            $stmt->execute([$capsuleId, $userId]);

            $db->commit();

            jsonResponse([
                'success' => true,
                'capsule' => [
                    'id'           => $capsuleId,
                    'title'        => $title,
                    'description'  => $description,
                    'opening_date' => $openingDate
                ]
            ], 201);
        } catch (Exception $e) {
            $db->rollBack();
            jsonError('Erreur lors de la création : ' . $e->getMessage(), 500);
        }
        break;

    // ── Supprimer une capsule ────────────────
    case 'delete':
        if ($method !== 'POST') jsonError('Méthode non autorisée', 405);
        $userId = requireAuth();
        $data = getJsonBody();
        $capsuleId = (int) ($data['capsule_id'] ?? 0);

        if (!$capsuleId) jsonError('ID capsule requis.');

        $db = getDB();
        $stmt = $db->prepare('SELECT * FROM capsules WHERE id = ? AND creator_id = ?');
        $stmt->execute([$capsuleId, $userId]);
        if (!$stmt->fetch()) jsonError('Capsule introuvable ou accès refusé.', 403);

        $stmt = $db->prepare('DELETE FROM capsules WHERE id = ?');
        $stmt->execute([$capsuleId]);

        jsonResponse(['success' => true, 'message' => 'Capsule supprimée.']);
        break;

    default:
        jsonError('Action inconnue.', 404);
}
