# OWASP (Open Web Application Security Project)
## Introduction
OWASP (Open Web Application Security Project) est un projet open source qui vise à promouvoir la sécurité des applications web. Il fournit des guides, des bonnes pratiques et des outils pour aider les développeurs à identifier et à corriger les vulnérabilités de sécurité dans leurs applications web.

L'OWASP Top 10 est une liste des 10 vulnérabilités les plus courantes dans les applications web, classées en fonction de leur impact potentiel sur la sécurité. Cette liste est mise à jour régulièrement par la communauté OWASP et fournit des conseils détaillés pour réduire les risques associés à chaque vulnérabilité.

Voici une introduction à quelques-unes des vulnérabilités les plus courantes de l'OWASP Top 10 :

## TOP 10 Owasp

1. Injection : L'injection consiste à insérer mal intentionnellement des données dans des entrées sensibles, telles que les requêtes SQL ou les commandes d'exécution. Les injections peuvent être évitées en validant et en échappant correctement les entrées utilisateur.

2. Brute Force : Les attaques par force brute consistent à essayer toutes les combinaisons possibles de mots de passe ou d'identifiants pour accéder à une application. Les applications web peuvent prendre des mesures pour limiter les tentatives de connexion erronées, comme la mise en place de mécanismes de blocage après un certain nombre d'échecs.

3. Cross-Site Scripting (XSS) : Les attaques XSS consistent à injecter du code JavaScript dans une application web pour voler les informations des utilisateurs ou compromettre leur système. Les développeurs doivent valider et échapper correctement les entrées utilisateur pour prévenir ces attaques.

4. Cross-Site Request Forgery (CSRF) : Les attaques CSRF consistent à inciter un utilisateur à effectuer des actions malveillantes sur son compte ou son système. Les développeurs doivent utiliser des mécanismes de sécurité tels que les tokens CSRF pour prévenir ces attaques.

5. Security Misconfiguration : Les erreurs de configuration peuvent laisser des vulnérabilités dans l'application. Il est important de mettre en place des politiques de sécurité appropriées et de les vérifier régulièrement.

6. Sensitive Data Exposure : Les données sensibles, telles que les informations bancaires ou les numéros de sécurité sociale, doivent être protégées. Les développeurs doivent prendre des mesures pour sécuriser la gestion et le stockage de ces données.

7. XML External Entities : Les attaques XML External Entities consistent à exploiter des entités externes dans des fichiers XML pour accéder à des ressources malveillantes ou exécuter des commandes. Les développeurs doivent limiter l'utilisation d'entités externes dans les fichiers XML.

8. Broken Authentication and Session Management : Les attaques peuvent être menées en cassant l'authentification ou en compromettant la gestion des sessions. Les développeurs doivent mettre en place des mécanismes de sécurité solides pour l'authentification et la gestion des sessions.

9. Insecure Direct Object References : Les références directes d'objets non sécurisées peuvent permettre à un attaquant d'accéder à des ressources protégées. Les développeurs doivent valider et sécuriser les références d'objets dans leur application.

10. Insufficient Transport Layer Protection : Les communications non sécurisées peuvent être interceptées et compromises. Les développeurs doivent utiliser des protocoles de chiffrement appropriés, tels que HTTPS, pour protéger les communications.

Il est important de noter que cette liste n'est pas exhaustive et qu'il existe d'autres vulnérabilités à prendre en compte lors de la sécurité des applications web. Il est recommandé de consulter la documentation officielle de l'OWASP pour obtenir des informations détaillées sur chaque vulnérabilité et les meilleures pratiques pour les prévenir.

# Juice Shop
## I Injection

Dans le formuliare login saisir comme login admin@juice-sh.op'--

Explication : Le ' ferme la chaîne de caractère dans la requête SQL, et -- commente le reste de la requête (faisant fi de la vérification du mot de passe). La base de données voit simplement :
SELECT * FROM Users WHERE email = 'admin@juice-sh.op'.

## II Brut Force
#### Login de l'Administrateur (Mot de passe)
Bien que l'injection SQL soit plus rapide, vous pouvez techniquement bruteforcer le compte admin@juice-sh.op.

L'outil : Utilisez Burp Suite Intruder.

La méthode :

Interceptez la requête de connexion.

Envoyez-la vers l'onglet Intruder.

Marquez le champ password comme position de payload.

Utilisez une liste de mots de passe courants (type best1050 ou rockyou).

Indice : Le mot de passe de l'admin est très simple : admin123.

## III Cross-Site Scripting (XSS)

L'outil : Dans le navigateur utilser la recherche du site Juice Shop et saisir un code html avec un Iframe.
Saisir le code suivant :

```html 
<iframe src="javascript:alert('XSS')"></iframe>
```


## IV Cross-Site Request Forgery (CSRF)
Le scénario CSRF dans Juice Shop : Changer le nom d'un utilisateur
L'un des challenges CSRF consiste à forcer un utilisateur connecté à modifier son profil (par exemple, changer son nom d'utilisateur) à son insu.

1. Analyse de la requête légitime (ce que fait le site)
Si vous interceptez avec Burp Suite la requête lorsque vous changez votre nom dans l'interface de Juice Shop, vous verrez une requête HTTP qui ressemble à ceci :

HTTP
POST /rest/user/change-password?current=... HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{"username":"nouveauNom"}
Le point faible : Juice Shop stocke parfois le jeton de session (JWT) dans un cookie.

Le comportement du navigateur : Si un autre site web tiers envoie une requête vers http://localhost:3000/rest/user/change-password, le navigateur va automatiquement inclure ce cookie.

2. Construction de l'attaque (Le site malveillant)
Pour exploiter cela, un attaquant va créer une fausse page HTML (qu'il héberge sur son propre serveur, par exemple http://site-pirate.com). Cette page contient un formulaire caché qui cible directement l'API de Juice Shop.

Puisque l'API de Juice Shop attend du JSON, l'attaquant peut utiliser du JavaScript pour forger la requête à l'ouverture de la page :

```html
<html>
  <body>
    <h1>Félicitations ! Vous avez gagné un iPad !</h1>
    <script>
      // On crée une requête cachée vers le Juice Shop de la victime
      var xhr = new XMLHttpRequest();
      xhr.open("POST", "http://localhost:3000/rest/user/change-password", true);
      xhr.setRequestHeader("Content-Type", "application/json");
      
      // Le navigateur inclura automatiquement les cookies de localhost:3000 !
      xhr.withCredentials = true; 
      
      // On envoie le payload pour modifier le nom de la victime
      xhr.send(JSON.stringify({ "username": "Pwned_By_CSRF" }));
    </script>
  </body>
</html>
```
3. L'exécution
L'administrateur de Juice Shop (ou n'importe quel utilisateur) est connecté sur son compte Juice Shop dans un onglet.

Dans un autre onglet, il clique sur un lien reçu par mail qui l'emmène sur http://site-pirate.com.

Le script s'exécute instantanément en arrière-plan.

Le navigateur envoie la requête à Juice Shop avec le cookie de session de la victime.

Le profil de la victime est modifié à son insu. Le challenge est réussi !

## V Security Misconfiguration

La Security Misconfiguration (Configuration de Sécurité Défectueuse) fait partie du Top 10 de l'OWASP. Contrairement aux failles de code (comme une injection SQL), elle provient d'un défaut de paramétrage des serveurs, des frameworks, des bases de données ou de l'application elle-même.

Dans OWASP Juice Shop, plusieurs challenges amusants et très réalistes illustrent parfaitement ce problème. Voici les exemples les plus marquants que vous pouvez tester :

1. Le mode "Debug" activé et les messages d'erreur trop bavards
C'est l'une des configurations défectueuses les plus fréquentes en production. Les développeurs oublient souvent de désactiver le mode de développement (mode Debug) avant de mettre en ligne l'application.

Dans Juice Shop :
Si vous tentez de vous connecter avec un mot de passe contenant une apostrophe ou si vous manipulez une URL pour forcer une erreur système, l'application ne se contente pas de dire "Une erreur est survenue".

Elle vous renvoie une Stack Trace (la trace d'erreur complète du code source).

Ce message d'erreur verbeux révèle des informations cruciales pour un attaquant : les versions exactes de Node.js utilisées, les chemins absolus des fichiers sur le serveur (C:\Users\...\juice-shop\...), et les bibliothèques tierces (packages npm) installées.

2. Les fichiers sensibles accessibles publiquement (Le cas package.json.bak)
Une mauvaise configuration des permissions de fichiers ou l'absence de restrictions dans le serveur web (comme Nginx ou Apache) peut exposer des fichiers qui devraient rester strictement privés.

Dans Juice Shop :
Les développeurs ont parfois l'habitude de faire des sauvegardes rapides en renommant un fichier (par exemple package.json.bak ou ftp.bak).

En explorant les répertoires ou en essayant de deviner des extensions courantes directement dans l'URL (ex: http://localhost:3000/package.json.bak), on se rend compte que le serveur web accepte de livrer le fichier.

En téléchargeant ce fichier de configuration, un attaquant découvre la liste exacte des dépendances de l'application et peut chercher si l'une d'elles possède une vulnérabilité connue (CVE) pour pirater le serveur.

3. L'arborescence des répertoires visible (Directory Listing)
Par défaut, si aucun fichier index.html n'est présent dans un dossier, un serveur web mal configuré affichera la liste complète des fichiers et des sous-dossiers, comme dans un explorateur de fichiers Windows.

Dans Juice Shop :
L'application possède un dossier /ftp qui contient des fichiers de l'entreprise. En tentant d'accéder directement à http://localhost:3000/ftp, une mauvaise configuration du serveur permet de lister l'intégralité du contenu de ce dossier. Vous y trouverez des fichiers de backup, des mémos internes et des documents textuels secrets qui n'auraient jamais dû être visibles par les clients de la boutique.

4. Les identifiants et comptes par défaut
Laisser des mots de passe d'usine ou des comptes de test actifs dans l'environnement de production est une erreur de configuration majeure.

Dans Juice Shop :
Au-delà de l'attaque par force brute que vous avez étudiée, certains composants tiers (comme des bases de données ou des consoles d'administration) sont laissés avec leurs configurations d'installation de base. C'est le cas pour certains accès "Admin" ou des clés de chiffrement par défaut (comme des secrets JWT génériques de type "admin123" ou "secret") qui permettent de forger de faux jetons d'authentification.

## VI Sensitive Data Exposure 
La faille Sensitive Data Exposure (Exposition de Données Sensibles), désormais englobée sous la catégorie Cryptographic Failures dans les versions récentes du Top 10 de l'OWASP, se produit lorsqu'une application ne protège pas correctement des informations critiques (données de carte bancaire, mots de passe, données de santé, données personnelles réglementées par le RGPD, etc.).

Dans OWASP Juice Shop, cette vulnérabilité est particulièrement bien mise en scène à travers plusieurs défis qui montrent comment un attaquant peut fouiller pour exfiltrer des informations confidentielles.

#### Les clés de chiffrement codées "en dur" (Hardcoded Secrets)
Exposer les clés qui servent à sécuriser l'application est une forme majeure d'exposition de données.

Dans Juice Shop :
L'application utilise des jetons JWT (JSON Web Tokens) pour maintenir la session des utilisateurs. Pour vérifier qu'un jeton est valide, le serveur le signe avec une clé secrète.

En inspectant le code source JavaScript minifié de l'application (téléchargeable par n'importe quel navigateur dans l'onglet Sources), on peut fouiller et trouver la clé secrète utilisée par le backend (par exemple, une chaîne de caractères comme this-is-a-very-secret-key321).

Avec cette clé sous la main, un attaquant n'a plus besoin de deviner les mots de passe : il peut forger lui-même un faux jeton JWT pour le compte de l'administrateur, l'injecter dans ses cookies et prendre le contrôle total du site.


## VII XML External Entities

Pour réussir le challenge **XXE (XML External Entities)** dans OWASP Juice Shop, la démarche consiste à trouver une fonctionnalité qui accepte (ou peut être forcée à accepter) du XML, puis à y injecter une entité malveillante pour lire un fichier local du serveur.

Dans Juice Shop, ce challenge est généralement lié à la fonctionnalité de **réclamation (Complaint)** ou à l'**import de fichiers**.

Voici la démarche technique étape par étape en utilisant **Burp Suite** :

---

## Étape 1 : Repérer le point d'entrée et capturer la requête

1. Ouvrez Juice Shop via le navigateur intégré de Burp Suite et connectez-vous à un compte utilisateur.
2. Allez dans le menu et ouvrez la page de réclamation (**Complaint**).
3. Remplissez le formulaire avec un message de test et téléversez un fichier texte ou un PDF si l'option est présente, puis activez l'interception dans Burp Suite (*Proxy > Intercept is on*).
4. Cliquez sur **Submit** (Envoyer).
5. Dans Burp Suite, faites un clic droit sur la requête interceptée et sélectionnez **Send to Repeater** (Envoyer au Repeater). Vous pouvez relâcher la requête (*Intercept is off*).

---

## Étape 2 : Forcer le serveur à analyser du XML

Par défaut, l'application Juice Shop communique en JSON. Nous allons modifier la requête dans l'onglet **Repeater** pour voir si le serveur accepte le format XML.

1. Repérez la ligne de l'en-tête HTTP :
`Content-Type: application/json`
2. Modifiez-la explicitement en :
`Content-Type: application/xml`
3. Effacez le corps de la requête en JSON (les données entre accolades `{ ... }`) et remplacez-le par une structure XML de base pour tester la réaction du serveur :
```xml
<?xml version="1.0" encoding="UTF-8"?>
<comment>
    <message>Test XML</message>
</comment>

```


4. Cliquez sur **Send**. Si le serveur répond avec un code `200 OK` ou un message indiquant qu'il a traité la donnée, cela confirme que le parseur XML du backend est actif et à l'écoute.

---

## Étape 3 : Injecter le Payload XXE pour lire un fichier

Puisque le serveur accepte le XML, nous allons déclarer une entité externe (une sorte de variable) qui va pointer vers un fichier sensible du système. Juice Shop tournant généralement sous un environnement Node.js (souvent encapsulé dans Docker ou exécuté localement), nous allons cibler un fichier type.

* Si votre Juice Shop tourne sous **Linux / Docker** : nous allons chercher à lire `/etc/passwd`.
* Si votre Juice Shop tourne directement sous **Windows** : nous allons chercher à lire `C:/Windows/win.ini`.

Modifiez le corps de votre requête dans le Repeater avec le payload suivant (exemple pour Linux) :

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE xxe [
  <!ENTITY payload SYSTEM "file:///etc/passwd">
]>
<comment>
  <message>&payload;</message>
</comment>

```

### Ce qui se passe ici :

* `<!ENTITY payload SYSTEM "file:///etc/passwd">` : On crée une entité nommée `payload` qui ordonne au serveur de charger le fichier `/etc/passwd`.
* `<message>&payload;</message>` : On appelle cette variable à l'endroit où le serveur est censé traiter ou stocker le texte de notre réclamation.

---

## Étape 4 : Analyser la réponse et valider le challenge

1. Cliquez sur **Send** dans le Repeater.
2. Regardez le panneau de droite (la réponse du serveur).
3. Si l'attaque a réussi, le parseur XML a remplacé la balise `&payload;` par le contenu réel du fichier avant de générer sa réponse. Vous verrez s'afficher la liste des utilisateurs du système (le contenu de `/etc/passwd`) directement dans la réponse HTTP ou dans le message de confirmation.
4. Dès que ce fichier est lu et renvoyé, Juice Shop détecte le succès de l'action et le bandeau de notification de réussite du challenge s'affiche à l'écran !

## VIII Broken Authentication and Session Management 
La catégorie **Broken Authentication and Session Management** (Authentification Brisée et Gestion de Session Défectueuse) regroupe les failles qui permettent à un attaquant de contourner les mécanismes d'identification, de voler des sessions ou de se faire passer pour un autre utilisateur sans connaître ses identifiants.

Dans **OWASP Juice Shop**, cette catégorie offre des challenges très formateurs. L'application utilise une architecture moderne basée sur des jetons **JWT (JSON Web Tokens)** transmis via le navigateur, ce qui permet d'explorer des vulnérabilités de session très réalistes.

Voici les principaux scénarios de cette faille mis en scène dans Juice Shop :

---

## 1. L'injection SQL pour contourner l'authentification (Authentication Bypass)

C'est le grand classique des failles d'authentification brisée. Au lieu de deviner le mot de passe (force brute), l'attaquant manipule la requête SQL sous-jacente pour forcer le serveur à valider la connexion.

### Dans Juice Shop :

Sur la page de connexion, si vous tapez ceci dans le champ e-mail :

* **E-mail :** `admin@juice-sh.op'--`
* **Mot de passe :** *n'importe quoi*

Le serveur génère une requête SQL qui ressemble à ça :

```sql
SELECT * FROM Users WHERE email = 'admin@juice-sh.op'--' AND password = '...'

```

Les deux tirets `--` indiquent au moteur de base de données (SQLite ici) que tout le reste de la ligne est un commentaire. La vérification du mot de passe est totalement ignorée. Le serveur voit que le compte admin existe et vous connecte instantanément. L'authentification est brisée à cause d'un manque de nettoyage des entrées.

---

## 2. La faille de l'algorithme "None" dans les jetons JWT

Juice Shop utilise des tokens JWT pour gérer la session. Un JWT est découpé en trois parties séparées par des points : le *Header* (qui indique l'algorithme de chiffrement), le *Payload* (les données utilisateur) et la *Signature* (qui prouve que le jeton n'a pas été modifié).

### Dans Juice Shop :

Dans certains niveaux, le backend Node.js utilise une bibliothèque JWT mal configurée qui accepte l'algorithme `none` (aucun chiffrement).

1. Vous interceptez votre jeton JWT avec Burp Suite.
2. Vous décodez le *Header* (qui est juste du Base64) et vous remplacez l'algorithme (ex: `HS256`) par `"alg": "none"`.
3. Vous modifiez le *Payload* pour changer votre `id` ou votre rôle de `customer` à `admin`.
4. Vous supprimez complètement la signature à la fin du jeton (en laissant le point final).
5. Vous renvoyez le jeton modifié. Le serveur, voyant `none`, ne valide pas la signature et vous accorde les droits d'administrateur.

---

## 3. Le manque de rotation et d'expiration des sessions (Session Fixation / Replay)

Une bonne gestion de session exige qu'un identifiant de session (ou jeton) expire rapidement et soit détruit dès que l'utilisateur clique sur "Déconnexion".

### Dans Juice Shop :

Certains challenges vous demandent de manipuler les sessions d'autres utilisateurs. Par exemple :

* **Le vol de session par usurpation :** Si un jeton de session n'expire jamais ou est prévisible (généré par exemple à partir d'un simple timestamp ou de l'adresse e-mail encodée en Base64), un attaquant peut fabriquer ou réutiliser le jeton d'une victime pour s'emparer de son compte sans jamais passer par la page de login.
* **L'absence d'invalidation :** Parfois, cliquer sur "Logout" efface simplement le cookie dans *votre* navigateur, mais le serveur ne l'invalide pas de son côté. Si vous aviez sauvegardé ce token dans Burp Suite avant de vous déconnecter, vous constaterez qu'il fonctionne encore indéfiniment.

---

## 4. Les questions de sécurité (Security Questions) prévisibles

L'authentification ne concerne pas uniquement le formulaire de login initial, elle englobe aussi les mécanismes de **récupération de compte** (mot de passe oublié).

### Dans Juice Shop :

Pour réinitialiser le mot de passe du compte de l'administrateur ou d'un utilisateur VIP (comme Jim ou MC SafeSearch), l'application propose une question de sécurité (ex: *"Quel est le nom de votre premier animal de compagnie ?"* ou *"Votre morceau de musique préféré ?"*).

* En faisant de la reconnaissance simple (OSINT) sur le site (en lisant les avis produits, les commentaires ou la page "À propos"), ou en cherchant des références culturelles évidentes liées aux noms des utilisateurs, la réponse à la question s'avère très facile à deviner.
* Une fois la réponse saisie, l'application vous permet de définir un nouveau mot de passe, brisant ainsi l'accès légitime de l'utilisateur.

## IX Insecure Direct Object References
La faille **Insecure Direct Object References (IDOR)** — que l'on retrouve aujourd'hui dans la catégorie plus large *Broken Access Control* (Défaut de contrôle d'accès) du Top 10 de l'OWASP — est l'une des vulnérabilités les plus courantes et les plus dangereuses sur les API et les applications web.

Elle se produit lorsqu'une application fournit un accès direct à des objets (des fichiers, des lignes de base de données, des comptes) en se basant sur un identifiant fourni par l'utilisateur, **sans vérifier si cet utilisateur a réellement le droit d'accéder à cet objet**.

Dans **OWASP Juice Shop**, cette faille est particulièrement bien illustrée car elle simule parfaitement ce qui arrive sur de vraies boutiques en ligne ou des applications de gestion.

---

## Le mécanisme de l'attaque : Comment ça marche ?

L'IDOR repose sur une logique très simple : l'attaquant modifie une valeur (souvent un nombre ou un identifiant) directement dans l'URL, les paramètres de la requête ou le corps JSON pour accéder aux données d'un autre utilisateur.

### Le scénario typique :

1. Vous vous connectez à Juice Shop avec votre compte standard.
2. Vous allez dans votre historique de commandes et vous cliquez sur "Afficher la facture".
3. Le site web charge l'URL suivante ou appelle une API :
`http://localhost:3000/ftp/legal.md` ou `http://localhost:3000/api/Deliveries/1`
4. Vous vous dites : *"Tiens, et si je changeais le `1` par un `2` ou un `3` ?"*
5. Si l'application est vulnérable, elle affiche la commande ou la facture d'un parfait inconnu, car elle a simplement exécuté la requête en base de données sans valider que la commande appartenait bien à votre session.

---

## Les défis IDOR marquants dans Juice Shop

Voici la démarche pour deux des challenges IDOR les plus célèbres de l'application :

### 1. Accéder au panier d'un autre utilisateur (Basket IDOR)

Lorsque vous ajoutez un article ou que vous consultez votre panier dans Juice Shop, l'application Angular fait une requête vers l'API pour récupérer le contenu de votre panier.

* **La démarche :**
1. Interceptez la requête de chargement de votre panier avec Burp Suite (ou regardez l'onglet *Network* de votre navigateur).
2. Vous verrez passer une requête HTTP de type `GET` vers une URL ressemblant à : `/rest/basket/5` (où `5` est l'identifiant de votre panier).
3. Envoyez cette requête vers le **Repeater** de Burp Suite.
4. Modifiez simplement le chiffre `5` par `1`, `2` ou `3`, puis cliquez sur **Send**.
5. Le backend de Juice Shop va vous renvoyer la liste JSON des articles du panier d'un autre utilisateur (souvent celui de l'administrateur). Vous pouvez ainsi voir ce qu'il s'apprête à acheter, voire manipuler son panier.



### 2. Télécharger des factures tierces (Invoice IDOR)

Un autre challenge consiste à récupérer des reçus ou des factures de commandes qui ne vous appartiennent pas.

* **La démarche :**
1. Après avoir passé une commande de test, téléchargez votre facture au format PDF.
2. Analysez l'URL générée ou la requête d'API : elle ressemble souvent à `/ftp/order_1.pdf` ou utilise un identifiant de commande dans une route d'API (ex: `/api/Orders/1`).
3. En modifiant séquentiellement cet identifiant par d'autres numéros dans votre navigateur ou dans Burp, vous forcez le serveur à vous livrer les fichiers PDF des factures des autres clients, révélant leurs noms, adresses de livraison et détails d'achats.



---

## Pourquoi cette faille existe-t-elle ?

L'IDOR ne provient pas d'une erreur de syntaxe ou d'un bug de code complexe, mais d'une **absence de contrôle d'accès logique** côté serveur.

Le développeur a écrit un code qui dit :

*"L'utilisateur me demande la commande X, je vais chercher la commande X et je lui donne."*

Au lieu d'écrire :

*"L'utilisateur me demande la commande X. Est-ce que l'utilisateur actuellement connecté est bien le propriétaire de la commande X ? Si oui, je lui donne. Si non, je bloque l'accès."*

