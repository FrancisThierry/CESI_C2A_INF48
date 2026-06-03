const express = require('express');
const path = require('path');
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
// (Note que dans le HTML précédent, l'action était "/login-endpoint")
app.post('/login-endpoint', (req, res) => {
    const { username, password } = req.body;

    // INFO : C'est ici que tu devrais vérifier dans une base de données
    console.log(`Tentative de connexion reçue !`);
    console.log(`Identifiant : ${username}`);
    console.log(`Mot de passe : ${password}`); // En production, on ne log jamais les mots de passe en clair !

    // Exemple de validation ultra-simple et statique
    if (username === 'admin' && password === 'secret') {
        res.send('<h1>Connexion réussie ! Bienvenue.</h1>');
    } else {
        res.status(401).send('<h1>Identifiant ou mot de passe incorrect.</h1><a href="/">Réessayer</a>');
    }
});

// Lancement du serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré avec succès !`);
    console.log(`Lien local : http://localhost:${PORT}`);
});