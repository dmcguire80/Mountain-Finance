# Firebase Setup Guide

Step-by-step instructions for setting up Firebase with Mountain Finance.

---

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"** (or "Add project")
3. Enter project name: `Mountain-Finance` (or your preferred name)
4. *(Optional)* Enable Google Analytics → Click **Continue**
5. Wait for project creation → Click **Continue**

---

## Step 2: Enable Authentication

1. In the left sidebar, click **Build → Authentication**
2. Click **Get started**
3. Under "Sign-in method", click **Email/Password**
4. Toggle **Enable** to ON
5. Click **Save**

---

## Step 3: Create Firestore Database

1. In the left sidebar, click **Build → Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode** → Click **Next**
4. Select a location (e.g., `us-east1`) → Click **Enable**
5. Wait for database provisioning

---

## Step 4: Set Firestore Security Rules

1. In Firestore, click the **Rules** tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click **Publish**

---

## Step 5: Add Web App & Get Config

1. Click the **gear icon** (Project settings) in the left sidebar
2. Scroll down to "Your apps" section
3. Click the **Web icon** (`</>`) to add a web app
4. Enter app nickname: `Mountain Finance`
5. *(Skip)* Firebase Hosting checkbox
6. Click **Register app**
7. You'll see a code block with `firebaseConfig` — **copy these values**:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",           // ← Copy this
  authDomain: "xxx.firebaseapp.com",
  projectId: "xxx",
  storageBucket: "xxx.appspot.com",
  messagingSenderId: "123...",
  appId: "1:123..."
};
```

---

## Step 6: Configure Your App

1. In your terminal, copy the example env file:
```bash
cp .env.example .env
```

2. Open `.env` and paste your values:
```
VITE_FIREBASE_API_KEY=AIza...your-key...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

3. **Restart dev server** (Ctrl+C to stop, then `npm run dev`)

---

## Step 7: Test the App

1. Open http://localhost:5173/
2. Click **"Sign up"** to create an account
3. Enter email and password
4. You should be redirected to the Dashboard

---

## Troubleshooting

**"Firebase: Error (auth/invalid-api-key)"**
- Check that `.env` values are correct and have no extra spaces/quotes

**"Missing or insufficient permissions"**
- Make sure Firestore rules are published (Step 4)
- Refresh the page after signing in

**Changes to `.env` not taking effect**
- Stop and restart the dev server (`npm run dev`)

---

## Optional: Firebase Hosting (Deploy to Web)

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login and initialize:
```bash
firebase login
firebase init hosting
```
   - Select your project
   - Public directory: `dist`
   - Single-page app: `Yes`
   - Overwrite index.html: `No`

3. Build and deploy:
```bash
npm run build
firebase deploy --only hosting
```
