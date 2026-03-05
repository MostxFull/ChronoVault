# ChronoVault - Coffre-fort de souvenirs collaboratif

## Installation

### 1. Base de données
1. Démarrez XAMPP/WAMP et activez Apache + MySQL
2. Ouvrez phpMyAdmin (`http://localhost/phpmyadmin`)
3. Importez le fichier `database/chronovault.sql`

### 2. Configuration du serveur
1. Placez le dossier du projet dans le répertoire `htdocs` de XAMPP (ou `www` de WAMP)
2. Modifiez `api/config/database.php` si vos identifiants MySQL sont différents

### 3. Lancement
Accédez à `http://localhost/testminiprjt/`

## Structure du projet

```
testminiprjt/
├── index.html              ← Page principale (SPA)
├── .htaccess               ← Réécriture URL Apache
├── js/
│   ├── api.js              ← Client API (fetch)
│   └── app.js              ← Logique de l'application SPA
├── api/
│   ├── config/
│   │   └── database.php    ← Configuration BDD
│   ├── includes/
│   │   └── helpers.php     ← Fonctions utilitaires
│   ├── auth.php            ← API authentification
│   ├── capsules/
│   │   └── index.php       ← API capsules
│   ├── invitations/
│   │   └── index.php       ← API invitations
│   └── memories/
│       └── index.php       ← API souvenirs
├── database/
│   └── chronovault.sql     ← Schéma de la base de données
└── uploads/                ← Images uploadées (créé automatiquement)
```

## Technologies
- **Frontend** : HTML, Tailwind CSS (CDN), JavaScript vanilla
- **Backend** : PHP 8+, MySQL
- **Architecture** : SPA frontend ↔ API REST PHP
