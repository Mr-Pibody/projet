# Portfolio — Elfried ZANNOU

Portfolio personnel full-stack en Node.js/Express, thème "Data Pulse", avec des dizaines de mini-projets fonctionnels intégrés.

## 🚀 Installation locale (sur ton PC, avant déploiement)

1. Ouvre ce dossier dans VS Code.
2. Ouvre le terminal intégré (Ctrl+`) et tape :
   ```
   npm install
   ```
3. Crée ton fichier `.env` en copiant `.env.example` :
   ```
   cp .env.example .env
   ```
   Puis remplis les vraies valeurs (mots de passe, secrets, etc.) — voir la section "Variables d'environnement" ci-dessous.

4. Pour tester en local avant d'envoyer sur alwaysdata :
   ```
   npm start
   ```
   Le site sera accessible sur `http://localhost:8100`.

## 📦 Déploiement sur alwaysdata

### Étape 1 — Créer le site
Dans **Sites > Configuration** :
- **Type** : Node.js
- **Commande** : `node /home/pibody/portfolio/server.js` (adapte le chemin)
- **Répertoire de travail** : `/home/pibody/portfolio`
- **Version de Node.js** : la plus récente proposée

### Étape 2 — Téléverser les fichiers
Via SSH/SFTP, envoie tout le contenu de ce dossier.

### Étape 3 — Variables d'environnement
Dans **Sites > Configuration**, champ **Environnement**, colle une ligne avec toutes tes variables (remplace par tes vraies valeurs) :

```
SESSION_SECRET=... ENCRYPTION_SECRET=... ADMIN_PASSWORD_BOUTIQUE=... ADMIN_PASSWORD_ECOMMERCE=... ADMIN_PASSWORD_RESTAURANT=... EMAIL_HOST=smtp-pibody.alwaysdata.net EMAIL_PORT=587 EMAIL_USER=pibody@alwaysdata.net EMAIL_PASSWORD=... EMAIL_TO=elfriedzannou@gmail.com
```

Ajoute `GROQ_API_KEY=`, `GEMINI_API_KEY=`, `MISTRAL_API_KEY=` pour activer Pibody IA et le Quiz IA (optionnel).

### Étape 4 — Lancer
Alwaysdata démarre automatiquement. Visite ton domaine pour vérifier.

## 🔑 Accès admin (Boutique / E-commerce / Restaurant)

Ces 3 projets partagent un seul point d'entrée caché, jamais affiché publiquement :

```
https://ton-domaine.com/projets/boutique/gestion-privee-pibody
```

Cette page propose 3 connexions distinctes, une par espace, chacune avec son propre mot de passe (`ADMIN_PASSWORD_BOUTIQUE`, `ADMIN_PASSWORD_ECOMMERCE`, `ADMIN_PASSWORD_RESTAURANT`). Garde cette URL pour toi seul.

## 🗄️ Base de données

Ce projet utilise **sql.js** (SQLite en WebAssembly) plutôt que `sqlite3` natif : zéro compilation requise, donc zéro risque d'échec sur hébergement mutualisé. Le fichier `data/portfolio.sqlite` est créé et structuré automatiquement au premier démarrage — rien à importer manuellement.

## 📁 Liste des projets inclus

**Algorithmique & data**
- Exécuteur d'algorithmes (éditeur de pseudo-code façon AlgoBox, exécuté dans le navigateur)
- Panorama mondial des sites web (statistiques réelles W3Techs, sources citées)
- Carte interactive (OpenStreetMap/Leaflet)
- Calculatrice scientifique avec traceur de courbes et étude de fonctions

**Outils pratiques**
- Générateur de CV (PDF) · Convertisseur de fichiers · Markdown → PDF · Time Tracker/Pomodoro
- QR Code carte de contact · Horloge/Alarme/Minuteur · Facture/Devis (PDF)
- Gestion de notes élèves (export Word + sauvegarde chiffrée) · Bloc-notes chiffré

**Catalogues & e-commerce**
- Catalogue Boutique · Boutique E-commerce · Menu Restaurant (admin caché, commande WhatsApp)

**Communauté & temps réel**
- Salons de discussion éphémères (Socket.IO, 5 Mo max/fichier, zéro stockage)
- Plateforme de vote par événement (protection IP)
- Questionnaire d'enquête en temps réel (résultats détaillés)
- Petites Annonces (soumission libre)

**Arcade (8 jeux)**
- Neon Runner · Reaction Rapide · Memory Grid · Memory XL · Pattern Breaker · Quick Math · Snake · Quiz IA

**IA**
- Pibody IA (chat, cascade Groq → Gemini → Mistral)
- Quiz IA (questions générées par IA, dans l'Arcade)

Plus : formulaire de contact fonctionnel, animations ambiantes, easter egg sur le bouton de thème.

## ⚠️ Notes importantes

- Les **salons de discussion** ne stockent rien en base — tout vit en mémoire, disparaît à la fermeture.
- Le **chiffrement** (notes élèves, bloc-notes) utilise AES-256-GCM, basé sur `ENCRYPTION_SECRET`.
- La **protection anti-double-vote par IP** est un frein raisonnable, pas une garantie absolue.
- **Pibody IA et Quiz IA** nécessitent au moins une clé API gratuite. Sans clé, ils affichent un message clair — le reste du site n'est pas affecté.
