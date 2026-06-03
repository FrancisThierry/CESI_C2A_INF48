-- script de création de la table review avec id, entry, dateAdded pour sqlite

CREATE TABLE IF NOT EXISTS review (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry TEXT NOT NULL,
    dateAdded DATETIME DEFAULT CURRENT_TIMESTAMP
);
