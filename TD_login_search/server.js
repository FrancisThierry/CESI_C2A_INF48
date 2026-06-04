const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const passport = require('passport');

// -------------------------------------------------------------------------
// CONFIGURATION DE L'ENVIRONNEMENT (env.dev ou env.prod)
// -------------------------------------------------------------------------
// Détermine l'environnement (par défaut 'dev' si NODE_ENV n'est pas défini)
const env = process.env.NODE_ENV === 'prod' ? 'prod' : 'dev';
const envFile = `env.${env}`;

// Charge les variables d'environnement depuis la racine du projet
require('dotenv').config({ path: path.resolve(__dirname, envFile) });

const app = express();
const PORT = process.env.PORT || 3001;

// -------------------------------------------------------------------------
// CONFIGURATION PASSPORT & SESSION
// -------------------------------------------------------------------------
// Initialiser la session (Requis pour Passport qui y stocke l'utilisateur)
app.use(require('express-session')({
    secret: process.env.SESSION_SECRET || 'un_secret_par_defaut', // Idéalement défini dans vos fichiers env
    resave: false,
    saveUninitialized: false,
    // cookie: { secure: true }
    sameSite: 'lax' // Protège des attaques CSRF tout en permettant le callback GitHub
}));

// Initialiser Passport et l'intégrer aux sessions
app.use(passport.initialize());
app.use(passport.session());

// Définir la stratégie Passport avec GitHub
// (Assurez-vous que githubStrategy.js utilise bien process.env)
passport.use('github', require('./githubStrategy'));

// Sérialisation requise pour maintenir la session utilisateur
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

// Middleware pour parser les requêtes (POST)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// -------------------------------------------------------------------------
// ROUTES
// -------------------------------------------------------------------------

// 1. Page de connexion
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. Déclenchement de l'authentification GitHub
app.get('/auth/github', passport.authenticate('github', { scope: [ 'user:email' ] }));

// 3. Callback de redirection GitHub après validation
app.get('/auth/github/callback', 
    passport.authenticate('github', { failureRedirect: '/' }),
    (req, res) => {
        // Authentification réussie, req.user contient les infos de GitHub
        res.send(`<h1>Connexion GitHub réussie ! Bienvenue ${req.user.username}.</h1><a href="/">Retour</a>`);
    }
);

// 4. Route de connexion classique (Formulaire)
app.post('/login-endpoint', async (req, res) => {
    let { username, password } = req.body;
    username = username ? username.trim() : "";
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!username || !emailRegex.test(username)) {
        return res.status(400).send('<h1>Erreur : L\'adresse email formatée est invalide.</h1><a href="/">Retour</a>');
    }

    if (!password || password.length < 4) {
        return res.status(400).send('<h1>Erreur : Le mot de passe doit contenir au moins 4 caractères.</h1><a href="/">Retour</a>');
    }

    try {
        let db = await open({
            filename: 'C:\\data\\CESI\\myCompany.db',
            driver: sqlite3.Database
        });

        const query = 'SELECT * FROM user WHERE username = ? AND password = ?';
        const user = await db.get(query, [username, password]);
        await db.close();

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

// Route pour se déconnecter
app.get('/logout', (req, res, next) => {
    // req.logout() est fourni par Passport pour vider la session de l'utilisateur
    req.logout((err) => {
        if (err) { 
            console.error("Erreur lors de la déconnexion :", err);
            return next(err); 
        }
        
        // Détruire complètement la session dans le store (optionnel mais recommandé pour nettoyer le cookie)
        req.session.destroy((destroyErr) => {
            if (destroyErr) {
                console.error("Erreur lors de la destruction de la session :", destroyErr);
            }
            
            // Efface le cookie côté client (connect.sid est le nom par défaut)
            res.clearCookie('connect.sid'); 
            
            // Redirection vers la page d'accueil ou de connexion
            res.redirect('/'); 
        });
    });
});

// 5. Route Review
app.post('/review', (req, res) => {
    let { review } = req.body;
    const db = new sqlite3.Database('C:\\data\\CESI\\myCompany.db');
    
    try {
        db.run("INSERT INTO review (entry) VALUES (?)", [review]);
        res.status(200).send('ok');
    } catch (error) {
        console.error("Erreur serveur :", error);
        res.status(500).send('<h1>Erreur interne du serveur.</h1>');
    }
});

// Lancement du serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré avec succès en mode [${env}] !`);
    console.log(`Lien local : http://localhost:${PORT}`);
});