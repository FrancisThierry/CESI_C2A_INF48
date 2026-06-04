## Oauth avec GitHub

### Mise en place de l'authentification via Oauth avec GitHub

Sur GitHub se rendre dans la partie utilisateur/setting/devloper setting et ajouter un nouveau client id et secret

![alt text](image.png)




## Étape 1 : Créer l'application sur GitHub

Avant de toucher au code, vous devez déclarer votre application auprès de GitHub pour obtenir vos identifiants de connexion.

1. Connectez-vous à votre compte **GitHub**.
2. Allez dans **Settings** (Paramètres) > **Developer Settings** > **OAuth Apps**.
3. Cliquez sur **New OAuth App**.
4. Remplissez les champs ainsi :
* **Application name :** Le nom de votre projet (ex: `Mon Application CESI`).
* **Homepage URL :** `http://localhost:3001` (votre URL locale de développement).
* **Authorization callback URL :** `http://localhost:3001/auth/github/callback` *(Attention : cette URL doit correspondre au caractère près à votre route de callback dans Node.js)*.


5. Cliquez sur **Register application**.
6. Sur l'écran suivant, copiez le **Client ID**.
7. Cliquez sur **Generate a new client secret** et copiez immédiatement le **Client Secret** généré (il ne s'affichera qu'une seule fois).

---

## Étape 2 : Configurer les fichiers d'environnement

À la racine de votre projet, créez ou modifiez vos fichiers `env.dev` et `env.prod` pour y stocker vos clés de manière étanche.

### Dans `env.dev` (pour le local) :

```env
PORT=3001
NODE_ENV=dev
GITHUB_CLIENT_ID=votre_client_id_recupere_sur_github
GITHUB_CLIENT_SECRET=votre_client_secret_recupere_sur_github
GITHUB_CALLBACK_URL=http://localhost:3001/auth/github/callback
SESSION_SECRET=un_secret_de_dev_tres_long_et_aleatoire

```

---

## Étape 3 : Créer la stratégie Passport (`githubStrategy.js`)

Ce fichier configure la stratégie d'authentification en récupérant automatiquement les clés injectées depuis vos fichiers d'environnement.

```javascript
// githubStrategy.js
const GitHubStrategy = require('passport-github2').Strategy;

module.exports = new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL
  },
  function(accessToken, refreshToken, profile, done) {
    // Le profil de l'utilisateur renvoyé par GitHub est disponible ici.
    // C'est ici que vous pouvez vérifier si l'utilisateur existe en BBD SQLite
    // ou créer un compte à la volée.
    return done(null, profile);
  }
);

```

---

## Étape 4 : Assembler le serveur principal (`server.js`)

Voici l'architecture complète de votre fichier `server.js` intégrant le chargement dynamique de l'environnement, la sécurité des sessions (HttpOnly, SameSite, Secure) et les routes OAuth.

```javascript
// server.js
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const passport = require('passport');

// 1. CHARGEMENT DYNAMIQUE DE L'ENVIRONNEMENT (env.dev ou env.prod)
const env = process.env.NODE_ENV === 'prod' ? 'prod' : 'dev';
require('dotenv').config({ path: path.resolve(__dirname, `env.${env}`) });

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy si vous êtes derrière un reverse proxy (ex: Nginx, Heroku) en prod
if (process.env.NODE_ENV === 'prod') {
    app.set('trust proxy', 1);
}

// 2. CONFIGURATION DE LA SESSION & DES COOKIES SÉCURISÉS
app.use(require('express-session')({
    secret: process.env.SESSION_SECRET || 'un_secret_par_defaut',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        httpOnly: true,                         // Empêche le vol de cookie via JS (XSS)
        secure: process.env.NODE_ENV === 'prod', // HTTPS obligatoire en prod (évite le cookie vide en dev)
        sameSite: 'lax'                         // Permet le bon fonctionnement des redirections OAuth
    }
}));

// 3. INITIALISATION DE PASSPORT
app.use(passport.initialize());
app.use(passport.session());

// Charger la stratégie définie à l'étape 3
passport.use('github', require('./githubStrategy'));

// Sérialisation requise par Passport pour stocker l'utilisateur en session
passport.serializeUser((user, done) => { done(null, user); });
passport.deserializeUser((obj, done) => { done(null, obj); });

// Middlewares pour parser les requêtes POST
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 4. LES ROUTES

// Page d'accueil / Connexion
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route 1 : Déclencher l'authentification vers GitHub
app.get('/auth/github', passport.authenticate('github', { scope: [ 'user:email' ] }));

// Route 2 : Le point de retour (Callback) après validation GitHub
app.get('/auth/github/callback', 
    passport.authenticate('github', { failureRedirect: '/' }),
    (req, res) => {
        // Succès ! Les infos de l'utilisateur sont dans req.user
        res.send(`<h1>Connexion GitHub réussie ! Bienvenue ${req.user.username}.</h1><a href="/">Retour</a>`);
    }
);

// Route 3 : Déconnexion complète et propre
app.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        
        req.session.destroy((destroyErr) => {
            if (destroyErr) console.error(destroyErr);
            res.clearCookie('connect.sid'); // Supprime le cookie du navigateur
            res.redirect('/');
        });
    });
});

// (Vos autres routes existantes : /login-endpoint, /review...)

// 5. LANCEMENT DU SERVEUR
app.listen(PORT, () => {
    console.log(`Serveur démarré en mode [${env}] sur http://localhost:${PORT}`);
});

```

---

## Étape 5 : Lancement selon le terminal

Pour exécuter votre code sans lever d'erreurs de variables d'environnement :

* **Sous Windows (PowerShell) :**
```powershell
$env:NODE_ENV="dev"
node server.js

```


* **Sous Windows (Invite de commande CMD classique) :**
```cmd
set NODE_ENV=dev&& node server.js

```


* **Via un script npm (Option universelle recommandée avec `cross-env`) :**
Ajoutez ceci dans votre `package.json` :
```json
"scripts": {
  "dev": "cross-env NODE_ENV=dev node server.js",
  "prod": "cross-env NODE_ENV=prod node server.js"
}

```


Puis lancez simplement : `npm run dev`.

Pour l'autorisation prévoir une autre librairie comme :
#### A. Casl (@casl/ability) 
CASL est aujourd'hui la référence. Elle va au-delà du simple RBAC en permettant l'ABAC (Attribute-Based Access Control), ce qui signifie que vous pouvez définir des règles basées sur les propriétés des objets (ex: "Un utilisateur peut modifier un article si il en est l'auteur").

Avantages : Isomorphe (partagé entre Frontend et Backend), syntaxe très naturelle (can('update', 'Article')), supporte les conditions complexes.

Idéal pour : Les applications de taille moyenne à grande avec des règles métier évolutives.

#### B. AccessControl 
Si vous n'avez pas besoin de vérifier les attributs des objets mais uniquement des rôles stricts (ex: admin, user, manager) avec des notions d'héritage, AccessControl est parfaite.

Avantages : Chaînage de méthodes très lisible, gestion native de l'héritage des rôles (l'admin hérite des droits du manager).

Exemple : ac.grant('admin').extend('user').updateAny('video').


---

## 1. Syntaxe purement déclarative (Frameworks & Middlewares)

C'est l'approche la plus propre pour sécuriser des API. On utilise des décorateurs ou des arguments de middleware pour définir les règles d'accès d'un coup d'œil.

### En Node.js (Express standard)

On utilise un middleware qui accepte les rôles autorisés en paramètres.

```javascript
// ✅ BONNE SYNTAXE : Claire, lisible au niveau de la route
router.delete('/users/:id', 
  authenticateJWT, 
  authorizeRoles('admin', 'super_admin'), // Contrôle d'accès explicite
  UserController.deleteUser
);

```

### En NestJS (TypeScript avec Décorateurs)

NestJS excelle dans ce domaine en séparant totalement les rôles du code de la fonction.

```typescript
@Controller('products')
export class ProductController {

  @Post()
  @Roles(Role.Admin, Role.Manager) // ✅ Décorateur personnalisé
  @UseGuards(JwtAuthGuard, RolesGuard) // Application stricte
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }
}

```

---

## 2. Syntaxe avec une librairie dédiée (AccessControl)

Si vous utilisez la bibliothèque `accesscontrol` en Node.js, la syntaxe est basée sur un chaînage de méthodes très proche du langage naturel (Fluent API).

```javascript
const AccessControl = require('accesscontrol');
const ac = new AccessControl();

// Définition des règles (généralement centralisée dans un fichier unique)
ac.grant('user')                    // Rôle de base
    .readOwn('account')
    .updateOwn('account')
  .grant('manager')                 // Rôle intermédiaire
    .extend('user')                 // 💡 Héritage automatique des droits de l'user
    .readAny('account')
  .grant('admin')                   // Rôle suprême
    .extend('manager')
    .updateAny('account')
    .deleteAny('account');

// ✅ Exemple de syntaxe de vérification dans votre code :
const permission = ac.can(req.user.role).updateAny('account');

if (permission.granted) {
  // L'utilisateur a le droit
} else {
  // 403 Forbidden
}

```

---

## 3. Syntaxe orientée "Permissions/Capacités" (CASL)

La meilleure pratique à long terme (si votre application grandit) consiste à vérifier des **permissions** (ce que l'utilisateur peut faire) plutôt que des **rôles** (qui il est). CASL permet de combiner le RBAC et les conditions dynamiques (ABAC).

### Définition des règles (Centralisée)

```javascript
import { AbilityBuilder, PureAbility } from '@casl/ability';

function defineRulesFor(user) {
  const { can, cannot, build } = new AbilityBuilder(PureAbility);

  if (user.role === 'admin') {
    can('manage', 'all'); // L'admin peut tout faire
  } else {
    can('read', 'Article'); // Tout le monde peut lire les articles
    
    // 💡 Syntaxe dynamique : On peut modifier l'article SEULEMENT si on en est l'auteur
    can('update', 'Article', { authorId: user.id }); 
  }

  return build();
}

```

### Utilisation dans le code

```javascript
const ability = defineRulesFor(req.user);

// ✅ Syntaxe ultra-lisible, proche de l'anglais
if (ability.can('update', article)) {
  // Procéder à la modification
} else {
  res.status(403).send("Vous n'êtes pas l'auteur de cet article.");
}

```

---

## 4. Syntaxe de configuration JSON / YAML (Pour les architectures microservices / Passerelles)

Si vous gérez vos rôles via une passerelle d'API (comme Kong, Traefik) ou un outil comme Kubernetes, le RBAC est décrit sous forme de configuration (souvent YAML).

```yaml
# Exemple de syntaxe RBAC Kubernetes (très standardisé)
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: production
  name: pod-reader
rules:
- apiGroups: [""] # "" indique l'API principale
  resources: ["pods"]
  verbs: ["get", "watch", "list"] # ✅ Les actions autorisées

```

---

## À retenir pour avoir une "bonne" syntaxe :

1. **Évitez le Hardcoding :** Pas de `if (user.role === 'admin' || user.role === 'manager' && user.department === 'IT')` perdu au milieu d'un contrôleur.
2. **Utilisez des Verbes et des Ressources :** Vos fonctions de vérification doivent idéalement ressembler à : `can(action, ressource)` (ex: `can('delete', 'user')`).
3. **Centralisez :** Un développeur doit pouvoir ouvrir **un seul fichier** dans votre projet et comprendre instantanément qui a le droit de faire quoi dans toute l'application.