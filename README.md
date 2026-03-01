# 🏥 MediCore — Clinical Companion PWA

A Progressive Web App for nurses and medical students. Features diagnosis search, interactive lab interpretation, medication reference grouped by treatment role, and nursing considerations — backed by Firebase Firestore.

---

## 🚀 Deploy to Render (Step-by-Step)

### 1. Clone & Push to GitHub

```bash
git init
git add .
git commit -m "Initial MediCore commit"
# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/medicore.git
git push -u origin main
```

### 2. Create Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → name it `medicore`
3. Go to **Firestore Database** → Create database → Start in **test mode**
4. Go to **Project Settings** → **Your apps** → **Add app** → Web
5. Copy the `firebaseConfig` values — you'll need them in step 4

### 3. Populate Firestore

Use the Firebase Console or the Admin SDK to add documents following this schema:

| Collection | Fields |
|---|---|
| `diagnoses` | `name`, `description` |
| `diagnosis_types` | `diagnosis_id`, `type_name`, `cause` |
| `lab_tests` | `diagnosis_type_id`, `test_name`, `normal_min`, `normal_max`, `unit`, `critical_high` (opt), `critical_low` (opt) |
| `medications` | `diagnosis_type_id`, `drug_name`, `drug_class`, `treatment_role`, `contraindications`, `monitoring_required`, `guideline_source` |
| `medication_dosages` | `medication_id`, `dose`, `form`, `frequency`, `route`, `renal_adjustment`, `pediatric_adjustment` |
| `side_effects` | `medication_id`, `effect` |
| `nursing_considerations` | `diagnosis_type_id`, `consideration` |

> **Note:** The app ships with full mock data for Diabetes Mellitus, Hypertension, and Pneumonia. You can use it immediately — just swap mock data fetches for the Firebase helpers in `src/firebase.js` when ready.

### 4. Deploy on Render

#### Option A — Blueprint (easiest)
1. Go to [render.com](https://render.com) → **New** → **Blueprint**
2. Connect your GitHub repo
3. Render reads `render.yaml` and auto-configures everything
4. Click **Apply**

#### Option B — Manual
1. Go to [render.com](https://render.com) → **New** → **Static Site**
2. Connect your GitHub repo
3. Set:
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. Click **Advanced** → **Add Environment Variable** — add all 6 variables:

```
VITE_FIREBASE_API_KEY         = your_api_key
VITE_FIREBASE_AUTH_DOMAIN     = your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID      = your_project_id
VITE_FIREBASE_STORAGE_BUCKET  = your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID = your_sender_id
VITE_FIREBASE_APP_ID          = your_app_id
```

5. Click **Create Static Site**

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local
# Fill in your Firebase credentials in .env.local

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📁 Project Structure

```
medicore/
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx          ← Main app (all UI components)
│   ├── firebase.js      ← Firebase init + Firestore helpers
│   └── main.jsx         ← React entry point
├── index.html
├── vite.config.js       ← Vite + PWA plugin config
├── render.yaml          ← Render Blueprint (auto-deploy)
├── package.json
├── .env.example         ← Copy to .env.local
└── .gitignore
```

---

## 🔥 Switching from Mock Data to Firebase

In `src/App.jsx`, find the `MOCK_DATA` section and the `getTypeDetails` function.  
Replace them with calls to the helpers exported from `src/firebase.js`:

```js
import { fetchDiagnoses, fetchTypes, fetchTypeDetails } from './firebase.js'

// In your useEffect or event handlers:
const diagnoses = await fetchDiagnoses()
const types     = await fetchTypes(diagnosisId)
const details   = await fetchTypeDetails(typeId)
```

---

## ⚕️ Disclaimer

For educational support only. Not a substitute for clinical judgment. Always verify with authoritative clinical sources before application.
