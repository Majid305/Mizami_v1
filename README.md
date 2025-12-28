
# Mizami v1.5 - Gestion Administrative Intelligente

Mizami est une application web (PWA) conçue pour la gestion des courriers, des rejets de chèques et l'expertise d'incidents, propulsée par l'IA Google Gemini.

## 🚀 Déploiement sur GitHub Pages

Cette application est configurée pour être déployée automatiquement via **GitHub Actions**.

### Étapes de configuration obligatoires :

1.  **Repository Secrets** :
    *   Sur GitHub, allez dans `Settings` > `Secrets and variables` > `Actions`.
    *   Cliquez sur `New repository secret`.
    *   Nom : **`VITE_API_KEY`**
    *   Valeur : Votre clé API Gemini.
2.  **Activation de GitHub Pages** :
    *   Une fois le premier "Push" effectué, allez dans `Settings` > `Pages`.
    *   Sous "Build and deployment", choisissez "Deploy from a branch".
    *   Sélectionnez la branche **`gh-pages`** (elle sera créée automatiquement par l'Action) et le dossier `/ (root)`.
3.  **Lancement** :
    *   Poussez votre code sur la branche `main`. Le transfert devrait maintenant réussir.

## 🛠 Technologies
- **Frontend**: React 19 + TypeScript
- **IA**: Google Gemini 3 Flash
- **Database**: IndexedDB (100% local/offline)

## 🔒 Confidentialité
Toutes les données sont stockées localement dans votre navigateur.
