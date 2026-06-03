const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite'); // <-- CORRECTION : Import de 'open' nécessaire pour utiliser await open()

const app = express();
const PORT = 3001;

// Middleware pour pouvoir lire les données envoyées par le formulaire HTML (POST)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 1. Route pour afficher la page de connexion
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. Route pour recevoir et traiter les données du formulaire
// CORRECTION : Ajout de 'async' ici pour pouvoir utiliser 'await' à l'intérieur
app.post('/login-endpoint', async (req, res) => {
    const { username, password } = req.body;

    try {
        // CORRECTION : Suppression des guillemets doubles en trop autour du chemin
        let db = await open({
            filename: 'C:\\data\\CESI\\myCompany.db',
            driver: sqlite3.Database
        });

        // CORRECTION SÉCURITÉ : Utilisation de la requête préparée (?) pour éviter les injections SQL et les erreurs de syntaxe
        const query = 'SELECT * FROM user WHERE username = ? AND password = ?';
        // const badQuery = "SELECT * FROM user WHERE username = '"+username+"' AND password = '"+password+"'";
        const user = await db.get(query, [username, password]);
        // const user = await db.get(badQuery);



        // Fermer la base de données après utilisation
        await db.close();

        console.log(`Tentative de connexion reçue ! Identifiant : ${username}`);

        // CORRECTION LOGIQUE : On vérifie si l'utilisateur existe dans la base de données SQLite
        if (user) {
            res.send(`<h1>Connexion réussie ! Bienvenue ${user.username}.</h1>`);
        } else {
            res.status(401).send('<h1>Identifiant ou mot de passe incorrect.</h1><a href="/">Réessayer</a>');
        }

    } catch (error) {
        console.error("Erreur serveur :", error);
        res.status(500).send('<h1>Erreur interne du serveur.</h1>');
    }
});

// Lancement du serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré avec succès !`);
    console.log(`Lien local : http://localhost:${PORT}`);
});