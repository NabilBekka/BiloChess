# ♟️ Bilo Chess

Application web fullstack pour apprendre les échecs.

**Stack :** Next.js 15 + React 19 (frontend) | Node.js + Express (backend) | PostgreSQL via Neon (BDD)

---

## 📁 Structure du projet

```
bilochess/
├── frontend/                 # Next.js 15 (App Router)
│   ├── public/
│   │   └── logo.png          # Logo Bilo Chess
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.js     # Layout racine
│   │   │   ├── page.js       # Page d'accueil
│   │   │   ├── page.module.css
│   │   │   ├── about/        # Page À propos
│   │   │   ├── settings/     # Page Paramètres
│   │   │   └── forgot-password/
│   │   ├── components/
│   │   │   ├── Header.js     # Navbar (logo + nav + profil)
│   │   │   ├── LoginModal.js
│   │   │   ├── RegisterModal.js
│   │   │   ├── GoogleRegisterModal.js
│   │   │   ├── VerifyEmailModal.js
│   │   │   ├── Header.module.css
│   │   │   └── Modal.module.css
│   │   ├── context/
│   │   │   └── AuthContext.js # Gestion auth globale
│   │   └── styles/
│   │       └── globals.css    # Variables CSS + reset
│   ├── jsconfig.json          # Alias @ → ./src/
│   ├── next.config.mjs
│   ├── package.json
│   └── .env.local.example
│
└── backend/                   # Node.js + Express
    ├── src/
    │   ├── index.js           # API (toutes les routes)
    │   └── db.js              # Connexion PostgreSQL
    ├── init.sql               # Schema BDD
    ├── package.json
    └── .env.example
```

---

## 🚀 Étapes d'installation

### 1. Base de données — Neon (PostgreSQL gratuit)

1. Va sur **[neon.tech](https://neon.tech)** et crée un compte gratuit
2. Crée un nouveau projet : `bilochess`
3. Copie le **connection string** qui ressemble à :
   ```
   postgresql://neondb_owner:xxxxxxxx@ep-xxxxx.eu-west-1.aws.neon.tech/neondb?sslmode=require
   ```
4. ✅ C'est tout pour l'instant — les tables seront créées à l'étape 6 avec `npm run db:init`

### 2. Google OAuth (Connexion Google)

#### A) Créer le projet Google Cloud

1. Va sur **[console.cloud.google.com](https://console.cloud.google.com)**
2. En haut à gauche, clique sur **Select a project** → **New Project**
3. Nom du projet : `Bilo Chess` → **Create**
4. Assure-toi que le projet `Bilo Chess` est bien sélectionné en haut

#### B) Configurer l'écran de consentement OAuth

1. Dans le menu à gauche : **APIs & Services** → **OAuth consent screen**
2. Tu arrives sur **"Google Auth platform"** avec un bouton **"GET STARTED"** → clique dessus
3. **Étape 1 — App Information :**
   - **App name** : `Bilo Chess`
   - **User support email** : sélectionne ton adresse Gmail
   - Clique **Next**
4. **Étape 2 — Audience :**
   - Sélectionne **External** (n'importe qui avec un compte Google peut se connecter)
   - Clique **Next**
5. **Étape 3 — Contact Information :**
   - **Email address** : entre ton adresse Gmail (Google t'enverra des notifs si besoin)
   - Clique **Next**
6. **Étape 4 — Finish :**
   - Coche **"I agree to the Google API Services: User Data Policy"**
   - Clique **Continue** puis **Create**

> ℹ️ Ton app sera en mode **"Testing"** — c'est normal et suffisant pour le développement. En mode test, seuls les comptes que tu ajoutes comme testeurs peuvent se connecter.

#### C) Ajouter des utilisateurs de test

1. Après la création, clique sur **Audience** dans le menu à gauche
2. Sous **"Test users"**, clique **Add users**
3. Ajoute ton adresse Gmail (et celles de tes testeurs)
4. **Save**

#### D) Créer les identifiants OAuth (Client ID)

1. Dans le menu à gauche : **Clients** (ou **APIs & Services** → **Credentials**)
2. Clique **+ Create Client**
3. **Application type** : `Web application`
4. **Name** : `Bilo Chess Web`
5. Sous **Authorized JavaScript origins**, clique **Add URI** :
   - `http://localhost:3000`
6. Sous **Authorized redirect URIs**, clique **Add URI** :
   - `http://localhost:3000`
7. Clique **Create**
8. Une popup apparaît avec :
   - **Client ID** → copie-le (tu en as besoin dans le `.env.local` du frontend ET le `.env` du backend)
   - **Client Secret** → copie-le (`.env` du backend uniquement)

### 3. JWT (JSON Web Token)

Rien à configurer en externe ! Tu dois juste générer une clé secrète aléatoire.

Dans ton terminal :
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Copie le résultat dans `JWT_SECRET` de ton `.env`.

### 4. SMTP (Envoi d'emails via Gmail)

1. Va sur **[myaccount.google.com/security](https://myaccount.google.com/security)**
2. Active la **validation en 2 étapes** si ce n'est pas fait
3. Va dans **Mots de passe des applications** (cherche "App Passwords")
4. Crée un mot de passe pour : `Mail` / `Autre (Bilo Chess)`
5. Tu obtiens un mot de passe de 16 caractères type : `abcd efgh ijkl mnop`
6. C'est ton `SMTP_PASS` (sans les espaces : `abcdefghijklmnop`)
7. `SMTP_USER` = ton adresse Gmail complète

### 5. Installation des dépendances

```bash
# Backend
cd bilochess/backend
npm install

# Frontend
cd ../frontend
npm install
```

### 6. Configuration des fichiers .env

**Backend** — crée `backend/.env` :
```env
DATABASE_URL=postgresql://neondb_owner:xxxxx@ep-xxxxx.eu-west-1.aws.neon.tech/neondb?sslmode=require
GOOGLE_CLIENT_ID=123456-xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
JWT_SECRET=ta-cle-secrete-generee-a-letape-3
JWT_EXPIRES_IN=7d
PORT=5000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ton-email@gmail.com
SMTP_PASS=abcdefghijklmnop
FRONTEND_URL=http://localhost:3000
```

**Frontend** — crée `frontend/.env.local` :
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456-xxxxx.apps.googleusercontent.com
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 7. Initialiser la base de données

```bash
cd bilochess/backend
npm run db:init
```
Tu dois voir :
```
♟️  Initialisation de la base de données Bilo Chess...
✅ Tables créées avec succès !
   - users
   - email_verification_codes
   - password_reset_codes
🎉 Base de données prête !
```

### 8. Lancement

```bash
# Terminal 1 — Backend
cd bilochess/backend
npm run dev
# → ♟️ Bilo Chess API sur http://localhost:5000

# Terminal 2 — Frontend
cd bilochess/frontend
npm run dev
# → Next.js sur http://localhost:3000
```

---

## 🔑 Routes API

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| POST | `/api/auth/register` | ❌ | Inscription email/password |
| POST | `/api/auth/login` | ❌ | Connexion email/password |
| POST | `/api/auth/google` | ❌ | Auth Google (vérifie token) |
| POST | `/api/auth/google/register` | ❌ | Créer compte via Google |
| GET | `/api/auth/me` | ✅ | Profil utilisateur |
| PUT | `/api/auth/update` | ✅ | Modifier profil |
| DELETE | `/api/auth/delete` | ✅ | Supprimer compte |
| POST | `/api/auth/send-verification` | ✅ | Envoyer code vérif email |
| POST | `/api/auth/verify-email` | ✅ | Vérifier email avec code |
| POST | `/api/auth/forgot-password` | ❌ | Demander reset password |
| POST | `/api/auth/verify-reset-code` | ❌ | Vérifier code reset |
| POST | `/api/auth/reset-password` | ❌ | Nouveau mot de passe |
