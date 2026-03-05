-- =============================================
-- ChronoVault - Database Schema
-- Coffre-fort de souvenirs collaboratif
-- =============================================

CREATE DATABASE IF NOT EXISTS chronovault CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE chronovault;

-- Table des utilisateurs
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar VARCHAR(255) DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Table des capsules temporelles
CREATE TABLE capsules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    opening_date DATE NOT NULL,
    creator_id INT NOT NULL,
    is_opened TINYINT(1) DEFAULT 0,
    cover_image VARCHAR(255) DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table des membres d'une capsule
CREATE TABLE capsule_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    capsule_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('creator', 'member') DEFAULT 'member',
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (capsule_id) REFERENCES capsules(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_membership (capsule_id, user_id)
) ENGINE=InnoDB;

-- Table des invitations
CREATE TABLE invitations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    capsule_id INT NOT NULL,
    invited_by INT NOT NULL,
    invited_user_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'declined') DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (capsule_id) REFERENCES capsules(id) ON DELETE CASCADE,
    FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (invited_user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_invitation (capsule_id, invited_user_id)
) ENGINE=InnoDB;

-- Table des souvenirs (messages + photos)
CREATE TABLE memories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    capsule_id INT NOT NULL,
    user_id INT NOT NULL,
    text_content TEXT,
    image_path VARCHAR(255) DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (capsule_id) REFERENCES capsules(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Index pour optimiser les recherches
CREATE INDEX idx_capsules_opening_date ON capsules(opening_date);
CREATE INDEX idx_capsules_creator ON capsules(creator_id);
CREATE INDEX idx_memories_capsule ON memories(capsule_id);
CREATE INDEX idx_memories_user ON memories(user_id);
CREATE INDEX idx_invitations_user ON invitations(invited_user_id);
CREATE INDEX idx_invitations_status ON invitations(status);
