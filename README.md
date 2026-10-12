# 🇹🇳 DocSexprime Tunisie — Version 3.0 (Mobile & Praticiens)

Plateforme d'éducation sexuelle clinique et d'accompagnement psychosocial pour la jeunesse tunisienne (15-25 ans) et les professionnels de santé. Adaptée au contexte socioculturel et au cadre légal tunisien, disponible en **Français**, **Arabe Tunisien (Dérja)** et **Anglais**.

---

## 🌟 Nouveautés de la Version 3.0

1. **Bouton d'Urgence et Discrétion ("Quick Exit")** :
   - Présent en permanence en haut de page pour permettre aux jeunes de quitter instantanément le site vers une page neutre (Wikipédia Tunisie) en un seul clic, protégeant ainsi leur vie privée sur smartphone ou ordinateur partagé.
2. **Sécurisation de l'Espace Praticien de Santé** :
   - Verrouillage par code d'accès clinicien (`DOCSEXPRIME2026` par défaut ou via la variable `CLINICIAN_PASSCODE`).
   - Modal d'authentification professionnelle et bouton de verrouillage de session en 1 clic.
3. **Export des Données Cliniques (JSON)** :
   - Nouveau point d'API `/api/export/qa` permettant aux praticiens et chercheurs en sexologie d'exporter l'ensemble des questions et réponses du forum pour l'analyse statistique et épidémiologique.
4. **Recherche Globale Temps Réel Connectée (Ctrl + K)** :
   - Indexation automatique combinant les articles statiques, les articles dynamiques créés par les soignants dans SQLite, les quiz et les questions/réponses.
5. **Moteur Clinique de Secours Résilient pour Amel (Chatbot IA)** :
   - Si la clé `GEMINI_API_KEY` n'est pas encore renseignée ou en cas de coupure réseau, Amel bascule automatiquement sur une base de connaissances cliniques d'urgence couvrant la contraception, la loi 58, le dépistage, le vaginisme et les centres ONFP.
6. **Synthèse Vocale Améliorée (TTS)** :
   - Utilise le modèle `gemini-2.5-flash-preview-tts` et bascule automatiquement sur l'API native `SpeechSynthesis` du navigateur si aucune clé n'est configurée, sans message d'erreur bloquant.
7. **Barre de Navigation Mobile Native** :
   - Navigation ergonomique fixée en bas de l'écran sur mobile pour un accès direct au pouce (Accueil, Articles, Amel IA, Forum, Quiz, Carte).
8. **Bannière d'Urgence Nationale Permanente** :
   - Mise en avant directe du numéro vert national gratuit **1899** (violences, écoute 24h/24) et de l'accès aux centres régionaux de l'**ONFP**.

---

## 🛠️ Stack Technique

- **Frontend** : React 19, TypeScript, Tailwind CSS v4 (`@tailwindcss/vite`), Lucide React, Recharts (cartographie et graphiques statistiques), Motion.
- **Backend** : Node.js, Express 4, `tsx` (développement), `esbuild` (bundle production).
- **Base de données** : SQLite embarquée via `better-sqlite3` (`data/docsexprime.db` en mode WAL).
- **Intelligence Artificielle** : Google GenAI SDK (`@google/genai`) — Gemini 2.0 Flash (Chat) & Gemini 2.5 Flash Preview (Text-To-Speech).

---

## 🚀 Installation & Démarrage

### 1. Prérequis
- **Node.js** (v18 ou supérieur recommandé)

### 2. Configuration des variables d'environnement
Créez un fichier `.env` ou `.env.local` à la racine :
```env
# Clé API Google Gemini (optionnelle pour le mode démo, requise pour l'IA en direct)
GEMINI_API_KEY=votre_cle_gemini_ici

# Code d'accès pour l'Espace Praticien (défaut : DOCSEXPRIME2026)
CLINICIAN_PASSCODE=DOCSEXPRIME2026
```

### 3. Lancer en développement
```bash
npm run dev
```
L'application démarre sur : **`http://localhost:3000`**

### 4. Vérification du typage (TypeScript)
```bash
npm run lint
```

### 5. Compiler pour la production
```bash
npm run build
npm start
```

---

## 🔐 Identifiants et Paramètres Démo

- **Code d'accès Espace Praticien** : `DOCSEXPRIME2026`
- **Numéro d'urgence national Tunisie** : `1899` (Numéro vert gratuit 24/7)
- **Partenaires de santé publique** : ONFP (Office National de la Famille et de la Population) & ADLI.
