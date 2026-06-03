-- Création de la table 'user'
CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insertion de trois utilisateurs de test
-- Note : En production, les mots de passe doivent TOUJOURS être hachés (ex: avec bcrypt)
INSERT INTO user (username, password) VALUES 
('admin', 'secret'),
('alice', 'alice2026'),
('bob', 'password123');