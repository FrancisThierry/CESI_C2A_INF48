
# 🏢 POLITIQUE DE SÉCURITÉ DE L'INFORMATION & MODÉLISATION DES RISQUES

**Document Référence :** SEC-LMS-2026-V1.0

**Phase du Projet :** Avant-Proception / Spécifications Architecturales

**Périmètre :** Plateforme Core LMS (Angular / Node.js Express / OAuth 2.0 & OIDC)

**Classification :** Interne / Confidentiel

---

## 1. Gouvernance et Objectifs de Sécurité

Ce document consigne les directives impératives de sécurité (*Security Gateways*) établies dès la phase de pré-conception. L'approche retenue est celle du **Security by Design** et du **Least Privilege**, visant à aligner le futur développement avec les standards **OWASP Top 10** (API & Web) et le **RGPD**.

---

## 2. Analyse d'Impact Métier (BIA) & Classification des Données

Avant l'évaluation technique des risques, les actifs de la plateforme e-Learning sont classifiés pour déterminer le niveau de protection requis.

### 2.1. Échelle de Criticité DICP

Les critères de **Disponibilité (D)**, **Intégrité (I)**, **Confidentialité (C)**, et **Preuve/Traçabilité (P)** sont évalués de 1 (Faible) à 4 (Critique).

| Actif Informationnel | C | I | D | P | Justification Métier / Réglementaire |
| --- | --- | --- | --- | --- | --- |
| **Données PII** (Profils, Courriels, Résultats) | **4** | 3 | 2 | 2 | Conformité RGPD. Risque d'amende et réputation. |
| **Secrets et Jetons** (Tokens OAuth, Clés API) | **4** | **4** | 3 | 3 | Clé de voûte de la confiance de l'infrastructure. |
| **Contenu Pédagogique / Certifications** | 2 | **4** | 3 | 3 | Prévention de la fraude aux examens et contrefaçon. |

---

## 3. Modélisation des Menaces Architecturales (Méthode STRIDE)

L'analyse en amont cartographie la stack cible face aux vecteurs d'attaque théoriques afin d'imposer des contre-mesures dès le schéma d'architecture.

### 3.1. Couche d'Authentification : OAuth 2.0 & OpenID Connect

* **Risque Identifié :** Interception de jetons d'accès (Session Hijacking) ou attaques par rejeu.
* **Vecteur d'attaque théorique :** Fuite du *Bearer Token* stocké dans le `localStorage` de l'application Angular via une faille XSS.
* **Directive d'Architecture Impérative :**
> **Pattern BFF (Backend for Frontend) :** L'application Angular ne doit jamais manipuler ou stocker de tokens d'accès (Access/Refresh Tokens). Le serveur Node.js/Express agit comme proxy OAuth, conserve les tokens dans sa session sécurisée, et maintient la session avec Angular via un cookie chiffré, configuré avec les attributs `HttpOnly`, `Secure`, et `SameSite=Strict`. Le flux obligatoire est **Authorization Code avec PKCE**.



### 3.2. Couche Client : Framework Angular

* **Risque Identifié :** Élévation de privilèges côté client ou défaillance du contrôle d'accès.
* **Vecteur d'attaque théorique :** Modification de l'état de l'application (ex: modifier une variable `isAdmin: false` en `true` via les outils de développement du navigateur).
* **Directive d'Architecture Impérative :**
> Le routeur Angular et les `Guards` ne servent qu'à l'expérience utilisateur (UX). **Aucune décision de sécurité ne doit reposer sur le client.** L'API Node.js doit valider de manière idempotente les droits de l'utilisateur à chaque requête (Contrôle d'accès basé sur les rôles - RBAC).



### 3.3. Couche API et Logique Métier : Node.js & Express

* **Risque Identifié :** Déni de Service Applicatif (ReDoS ou épuisement de la boucle d'événements) et injections.
* **Vecteur d'attaque théorique :** Injection de requêtes NoSQL/SQL via des points d'entrée non typés ou saturation du thread Node.js par l'envoi de charges utiles (payloads) massives.
* **Directive d'Architecture Impérative :**
> Validation stricte des données entrantes au niveau de la couche de routage Express via un validateur de schéma de types (ex: `Zod` ou `Joi`). Implémentation systématique de la limitation de débit (*Rate Limiting*) globale et par endpoint sensible (ex: `/api/auth/*`).



---

## 4. Exigences d'Intégration du Cadre d'Assurance Sécurité (SAST/DAST)

Pour garantir l'application de ces directives lors de la phase de développement, le pipeline CI/CD intégrera des contrôles automatisés basés sur les critères de succès ci-dessous.

```
[Code Source] ──> [ SAST Gateway: Snyk/SonarQube ] ──> [ DAST Gateway: OWASP ZAP ] ──> [ Production ]
                        (Bloquant si CVSS >= 7.0)             (Bloquant si Vuln. Active)

```

### 4.1. Exigences SAST (Static Application Security Testing)

Les règles d'analyse statique du code devront inclure des politiques spécifiques au profil technologique défini :

* **Règle #1 (Node.js) :** Détection et blocage de toute importation de dépendance contenant une vulnérabilité connue (CVE) avec un score **CVSS v3 $\ge$ 7.0**.
* **Règle #2 (Angular) :** Interdiction des méthodes de contournement du mécanisme de sérialisation natif (ex: interdiction absolue de `bypassSecurityTrustHtml`).

### 4.2. Exigences DAST (Dynamic Application Security Testing)

Le plan de test dynamique en environnement de staging devra obligatoirement simuler des scénarios d'attaque spécifiques au domaine e-learning :

* **Contrôle BOLA / IDOR :** Injection de scripts automatisés pour tester la permutation d'identifiants d'objets dans les routes d'API (ex: tenter d'accéder à `/api/courses/cours-payant-id` avec la session d'un utilisateur sans souscription).
* **Robustesse OAuth :** Attaques par falsification de requêtes intersites (CSRF) sur le endpoint de callback d'authentification et tests de validité de la signature des jetons (attaque *JWT none algorithm*).

---

## 5. Matrice d'Approbation du Cadrage Sécurité

Le passage officiel à la phase de conception détaillée et de développement est soumis à la signature de cette matrice par les parties prenantes.

| Rôle | Entité / Direction | Statut | Signature / Date |
| --- | --- | --- | --- |
| **RSSI / CISO** | Direction de la Sécurité | ⬜ En attente de revue |  |
| **Architecte Cloud/Lead** | Direction Technique | 🟩 Approuvé | *Signé électroniquement* |
| **Product Owner** | Direction Métier | 🟩 Approuvé | *Signé électroniquement* |