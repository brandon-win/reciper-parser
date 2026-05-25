import {GoogleAuthProvider, signInWithCredential, signOut} from 'firebase/auth/web-extension';
import {initFirebase} from './firebase.ts'
import {getWebsiteInfo} from './background-helpers/url-parser.ts'

const {auth} = initFirebase()

const getGoogleToken = () => {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, async (token) => {
      if (chrome.runtime.lastError || !token) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(token);
      }
    });
  });
};

const signIn = async () => {
  const token = await getGoogleToken();
  await chrome.storage.local.set({googleAccessToken: token});
  const credential = GoogleAuthProvider.credential(null, token);
  const res = await signInWithCredential(auth, credential);
  const user = res.user;
  return { uid: user.uid, email: user.email, displayName: user.displayName };
};

const signOutUser = async () => {
    const token = await getGoogleToken();
    if (token) {
        chrome.identity.removeCachedAuthToken({token})
    }
    await signOut(auth)
}

const getRecipeMetadata = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.id) {
        throw new Error("No active tab found");
    }

    const [tabInfo] = await chrome.scripting.executeScript({ 
        target: { tabId: tab.id },
        func: () => (document.querySelector('script[type="application/ld+json"]')?.innerText ?? null)
    });

    if (!tabInfo) {
      throw new Error('No metadata found')
    }

    const body = tabInfo.result    
    return getWebsiteInfo({body, link: tab.url})
}

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
    if (request.action === "SIGN_IN") {
        signIn()
            .then(user => sendResponse({ success: true, user }))
            .catch(error => sendResponse({ success: false, error: `Failed to sign in: ${error.message}` }));
    }

    if (request.action === "SIGN_OUT") {
        signOutUser()
            .then(() => sendResponse({ success: true }))
            .catch(error => sendResponse({ success: false, error: `Failed to sign out: ${error.message}` }));
    }

    if (request.action === "GET_USER") {
        const user = auth.currentUser;
        if (user) {
            sendResponse({
                success: true, 
                user: { 
                    uid: user.uid, 
                    email: user.email, 
                    displayName: user.displayName 
                } 
            });
        } else {
            sendResponse({success: false, error: "No user signed in."});
        }
    }

    if (request.action === "PARSE_SITE") {
      getRecipeMetadata()
        .then((data) => sendResponse({success: true, data}))
        .catch((error) => sendResponse({success: false, error: `Failed to get recipe data. ${error.message}`}))
    }

    if (request.action === "APPEND_TO_SHEET") {
      const { spreadsheetId, metadata } = request;
      new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({
          interactive: true,
          scopes: [
            "https://www.googleapis.com/auth/spreadsheets"
          ]
        }, (token) => {
          if (chrome.runtime.lastError || !token) reject(chrome.runtime.lastError);
          else resolve(token);
        });
      })
        .then(async (token) => {
          const metaRes = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const metaData = await metaRes.json();
          const firstSheet = metaData.sheets?.[0]?.properties?.title ?? "Sheet1";
          const range = encodeURIComponent(firstSheet);
          const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`;
          const row = [
            metadata.recipeName,
            metadata.category ?? "",
            metadata.cuisine ?? "",
            "",
            metadata.link
          ];
          const res = await fetch(url, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ values: [row] })
          });
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error?.message ?? `HTTP ${res.status}`);
          }
          sendResponse({ success: true });
        })
        .catch((error) => sendResponse({ success: false, error: `Failed to append to sheet: ${error.message}` }));
    }

    if (request.action === "LIST_DRIVE_FILES") {
      new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({
          interactive: true,
          scopes: [
            "https://www.googleapis.com/auth/drive.readonly"
          ]
        }, (token) => {
          if (chrome.runtime.lastError || !token) reject(chrome.runtime.lastError);
          else resolve(token);
        });
      })
        .then(async (token) => {
          const query = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
          const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)&orderBy=modifiedTime desc`;
          const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          sendResponse({ success: true, files: data.files });
        })
        .catch((error) => sendResponse({ success: false, error: `Failed to list Drive files: ${error.message}` }));
    }

    return true
})

