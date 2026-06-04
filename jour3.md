# 🚀 Standard Industriel : Pipeline CI/CD Sécurisé (Dev, Recette, Prod)


## 1. Architecture Globale du Pipeline 

Le diagramme suivant illustre le flux nominal du code, depuis le poste du développeur jusqu'à la mise en production, en mettant en évidence les barrières de sécurité automatisées (*Quality Gates*).

```mermaid
graph TD
    %% Définition des styles et des sous-graphes
    classDef dev fill:#e1f5fe,stroke:#01579b,stroke-width:2px;
    classDef staging fill:#fff3e0,stroke:#e65100,stroke-width:2px;
    classDef prod fill:#ffebee,stroke:#b71c1c,stroke-width:2px;
    classDef sec fill:#f3e5f5,stroke:#4a148c,stroke-width:2px;

    %% PHASE 1 : INTÉGRATION CONTINUE (CI)
    subgraph Dev_Phase ["1. ENVIRONNEMENT DE DÉVELOPPEMENT & CI"]
        A[Développeur: Commit & Push Code] -->|Déclenche la CI| B(Pipeline CI)
        B --> C[Linter & Compilation Static]
        C --> D[Tests Unitaires & Couverture]
        D --> E{Sécurité Statique <br> SAST / SCA / Secrets}:::sec
        E -->|Échec: Seuil non respecté| F[Build Rejeté / Bloqué]
        E -->|Succès: Gates OK| G[Construction de l'Artéfact <br> Image Container / Package]
    end
    class Dev_Phase dev;

    %% Transition vers la Recette
    G -->|Publication| H[(Registre d'images)]
    H -->|Déploiement Auto| I

    %% PHASE 2 : LIVRAISON CONTINUE / RECETTE
    subgraph Staging_Phase ["2. ENVIRONNEMENT DE RECETTE / STAGING"]
        I[Déploiement sur l'infra de Recette] --> J[Tests d'Intégration & End-to-End]
        J --> K(Analyse Dynamique <br> Scan DAST):::sec
        K --> L{Vérification DAST}:::sec
        L -->|Faille Critique Active| M[Alerte / Rollback Immédiat]
        L -->|Sécurité OK| N[Validation Métier / UAT]
    end
    class Staging_Phase staging;

    %% Transition vers la Production
    N -->|Approbation Manuelle / Tag Release| O[Déclenchement Pipeline Prod]

    %% PHASE 3 : DÉPLOIEMENT CONTINU / PROD
    subgraph Prod_Phase ["3. ENVIRONNEMENT DE PRODUCTION"]
        O --> P[Déploiement Progressif <br> Blue-Green ou Canary]
        P --> Q[Smoke Tests de Viabilité]
        Q --> R{Statut Déploiement}
        R -->|Erreur / Métriques Dégradées| S[Rollback Auto]
        R -->|100% Nominal| T[Application Live]
        T --> U(Monitoring & Observabilité <br> Alerting Sécurité):::sec
    end
    class Prod_Phase prod;

    %% Feedback loops
    F -.->|Correction| A
    M -.->|Incident / Ticket Jira| A