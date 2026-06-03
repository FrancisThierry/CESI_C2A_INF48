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
