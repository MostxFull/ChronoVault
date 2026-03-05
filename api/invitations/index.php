<?php
// =============================================
// API Invitations : inviter / accepter / refuser
// =============================================

require_once __DIR__ . '/../includes/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'list';

switch ($action) {

    // ── Inviter un ami par pseudo ────────────
    case 'send':
        if ($method !== 'POST') jsonError('Méthode non autorisée', 405);
        $userId = requireAuth();
        $data = getJsonBody();

        $capsuleId = (int) ($data['capsule_id'] ?? 0);
        $username  = trim($data['username'] ?? '');

        if (!$capsuleId || !$username) {
            jsonError('ID capsule et pseudo requis.');
        }

        $db = getDB();

        // Vérifier que l'utilisateur est créateur de la capsule
        $stmt = $db->prepare('SELECT * FROM capsules WHERE id = ? AND creator_id = ?');
        $stmt->execute([$capsuleId, $userId]);
        if (!$stmt->fetch()) jsonError('Seul le créateur peut inviter.', 403);

        // Trouver l'utilisateur invité
        $stmt = $db->prepare('SELECT id FROM users WHERE username = ?');
        $stmt->execute([$username]);
        $invitedUser = $stmt->fetch();
        if (!$invitedUser) jsonError('Utilisateur introuvable.');

        $invitedId = (int) $invitedUser['id'];
        if ($invitedId === $userId) jsonError('Vous ne pouvez pas vous inviter vous-même.');

        // Vérifier s'il est déjà membre
        $stmt = $db->prepare('SELECT * FROM capsule_members WHERE capsule_id = ? AND user_id = ?');
        $stmt->execute([$capsuleId, $invitedId]);
        if ($stmt->fetch()) jsonError('Cet utilisateur est déjà membre.');

        // Vérifier s'il existe déjà une invitation pending
        $stmt = $db->prepare('SELECT * FROM invitations WHERE capsule_id = ? AND invited_user_id = ? AND status = "pending"');
        $stmt->execute([$capsuleId, $invitedId]);
        if ($stmt->fetch()) jsonError('Invitation déjà envoyée.');

        $stmt = $db->prepare('INSERT INTO invitations (capsule_id, invited_by, invited_user_id) VALUES (?, ?, ?)');
        $stmt->execute([$capsuleId, $userId, $invitedId]);

        jsonResponse(['success' => true, 'message' => 'Invitation envoyée à ' . $username . '.']);
        break;

    // ── Mes invitations en attente ───────────
    case 'list':
        $userId = requireAuth();
        $db = getDB();

        $stmt = $db->prepare('
            SELECT i.*, c.title AS capsule_title, c.opening_date, u.username AS invited_by_name
            FROM invitations i
            JOIN capsules c ON c.id = i.capsule_id
            JOIN users u ON u.id = i.invited_by
            WHERE i.invited_user_id = ? AND i.status = "pending"
            ORDER BY i.created_at DESC
        ');
        $stmt->execute([$userId]);

        jsonResponse(['success' => true, 'invitations' => $stmt->fetchAll()]);
        break;

    // ── Accepter une invitation ──────────────
    case 'accept':
        if ($method !== 'POST') jsonError('Méthode non autorisée', 405);
        $userId = requireAuth();
        $data = getJsonBody();
        $invitationId = (int) ($data['invitation_id'] ?? 0);

        if (!$invitationId) jsonError('ID invitation requis.');

        $db = getDB();
        $stmt = $db->prepare('SELECT * FROM invitations WHERE id = ? AND invited_user_id = ? AND status = "pending"');
        $stmt->execute([$invitationId, $userId]);
        $invitation = $stmt->fetch();
        if (!$invitation) jsonError('Invitation introuvable.', 404);

        $db->beginTransaction();
        try {
            $stmt = $db->prepare('UPDATE invitations SET status = "accepted" WHERE id = ?');
            $stmt->execute([$invitationId]);

            $stmt = $db->prepare('INSERT INTO capsule_members (capsule_id, user_id, role) VALUES (?, ?, "member")');
            $stmt->execute([$invitation['capsule_id'], $userId]);

            $db->commit();
            jsonResponse(['success' => true, 'message' => 'Invitation acceptée !']);
        } catch (Exception $e) {
            $db->rollBack();
            jsonError('Erreur : ' . $e->getMessage(), 500);
        }
        break;

    // ── Refuser une invitation ───────────────
    case 'decline':
        if ($method !== 'POST') jsonError('Méthode non autorisée', 405);
        $userId = requireAuth();
        $data = getJsonBody();
        $invitationId = (int) ($data['invitation_id'] ?? 0);

        if (!$invitationId) jsonError('ID invitation requis.');

        $db = getDB();
        $stmt = $db->prepare('UPDATE invitations SET status = "declined" WHERE id = ? AND invited_user_id = ? AND status = "pending"');
        $stmt->execute([$invitationId, $userId]);

        if ($stmt->rowCount() === 0) jsonError('Invitation introuvable.', 404);

        jsonResponse(['success' => true, 'message' => 'Invitation refusée.']);
        break;

    default:
        jsonError('Action inconnue.', 404);
}
