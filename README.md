# Brandon's Recipe Parser

A Chrome extension that extracts recipe metadata from any recipe webpage and appends it to a Google Sheet — great for building a personal recipe database.

## Features

- **One-click metadata extraction** — reads structured JSON-LD data embedded in recipe pages to pull the recipe name, cuisine, category, and URL
- **Google account integration** — authenticates via Chrome's Identity API and Firebase Auth
- **Google Drive browser** — lists your Google Sheets so you can pick a destination without leaving the popup
- **Append to sheet** — writes a new row (name, category, cuisine, link) directly to the first sheet of your chosen spreadsheet

## How it works

1. Navigate to any recipe page in Chrome
2. Open the extension popup
3. Click **Get Recipe Metadata** — the extension reads the page's `<script type="application/ld+json">` tag and parses the `Recipe` entry from the `@graph` array
4. Connect your Google account if you haven't already
5. Click **Browse Google Sheets** and select a destination spreadsheet
6. Click **Append to [file]** to write the row

The selected spreadsheet is cached in `localStorage` so you don't have to re-pick it each session.

## Tech stack

| Layer | Technology |
|---|---|
| UI | React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Build | Vite 8 |
| Auth | Firebase Auth + Chrome Identity API |
| Extension | Chrome Manifest V3 |
| APIs | Google Sheets API v4, Google Drive API v3 |

## Project structure

```
src/
├── App.tsx                        # Root component and app-level state
├── GoogleFileBrowser.tsx          # Auth UI + Drive file picker
├── UrlParser.tsx                  # Metadata display + trigger button
├── background.js                  # Service worker — handles all Chrome messages
├── background-helpers/
│   └── url-parser.ts              # JSON-LD parsing logic
├── contexts/
│   └── AuthContext.tsx            # Firebase auth state context
├── hooks/
│   └── useAuth.ts                 # Auth hook
├── firebase.ts                    # Firebase app initialization
├── firebase-config.ts             # Firebase project config
└── types.ts                       # Shared TypeScript types
public/
└── manifest.json                  # Chrome extension manifest
```

## Prerequisites

- Node.js 18+
- A Google Cloud project with the following APIs enabled:
  - Google Sheets API
  - Google Drive API
- A Firebase project with **Google sign-in** enabled
- A Chrome OAuth2 client ID configured for a Chrome extension

## Installation

### 1. Clone the repo

```bash
git clone <repo-url>
cd recipe-parser
npm install
```

### 2. Configure Firebase

Update `src/firebase-config.ts` with your Firebase project credentials:

```ts
const FIREBASE_CONFIG = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
}
```

### 3. Configure the OAuth2 client ID

In `public/manifest.json`, replace the `oauth2.client_id` value with your own Chrome extension OAuth2 client ID from the Google Cloud Console:

```json
"oauth2": {
  "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
  "scopes": [
    "openid",
    "email",
    "profile",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/drive"
  ]
}
```

> **Note:** To get a Chrome extension OAuth2 client ID, go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → Create Credentials → OAuth client ID → Chrome Extension. You will need your extension's ID, which is assigned when you first load it unpacked.

### 4. Build the extension

```bash
npm run build
```

This outputs to the `build/` directory.

### 5. Load in Chrome

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `build/` directory

The extension icon will appear in your toolbar.

## Development

```bash
npm run dev     # Vite dev server (for UI development)
npm run build   # Production build
npm run lint    # ESLint
```

> Note: The full extension functionality (Chrome APIs, Google auth) only works when loaded as an unpacked extension. Use `npm run dev` for iterating on UI layout only.

## Google Sheet format

Each append writes a single row in this column order:

| A | B | C | D | E |
|---|---|---|---|---|
| Recipe Name | Category | Cuisine | *(empty)* | URL |
