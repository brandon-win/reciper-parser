import {initializeApp} from 'firebase/app'
import {getAuth} from 'firebase/auth/web-extension'
import FIREBASE_CONFIG from './firebase-config.ts'

const setupGoogleAuth = (app) => {
    const auth = getAuth(app)
    auth.useDeviceLanguage()
    return auth
}

const initFirebase = () => {
    const app = initializeApp(FIREBASE_CONFIG)
    const auth = setupGoogleAuth(app)

    return {
        auth,
    }
}

export {initFirebase}