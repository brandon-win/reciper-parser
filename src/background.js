import {GoogleAuthProvider, signInWithCredential, signOut} from 'firebase/auth/web-extension';
import {initFirebase} from './firebase.ts'

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
  GoogleAuthProvider.addScope('email')
  GoogleAuthProvider.addScope('profile')
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
            sendResponse({success: false, error: "No user signed in"});
        }
    }

    return true
})

