// firebase.js
import { initializeApp } from 'firebase/app';
import {
    GoogleAuthProvider,
    getAuth,
    signInWithPopup,
    signOut,
} from 'firebase/auth';
import { getFirestore, getDoc, doc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);


// Access a specific collection (for example, 'watchlist')
// const watchlistRef = collection(db, "watchlist");

// Example: Fetch documents from the 'watchlist' collection
export const getWatchlistData = async (userId: string) => {
    try {
        // Reference to the user's watchlist document
        const userWatchlistRef = doc(db, "watchlist", userId); // This points to the user's watchlist document
        const docSnap = await getDoc(userWatchlistRef);

        if (docSnap.exists()) {
            // If the document exists, get the 'stocks' field (array of strings)
            const stocks = docSnap.data().stocks; // Assuming 'stocks' is an array of strings
            return stocks;
        } else {
            console.log("No such document!");
            return [];
        }
    } catch (e) {
        console.error("Error getting documents: ", e);
        return [];
    }
};



// Example: Add a new stock to the 'watchlist'
// const addStockToWatchlist = async (userId, stock) => {
//     try {
//         const docRef = await addDoc(collection(db, "watchlist", userId, "stocks"), {
//             stock: stock,
//         });
//         console.log("Document written with ID: ", docRef.id);
//     } catch (e) {
//         console.error("Error adding document: ", e);
//     }
// };

// Call these functions as needed
// getWatchlistData();
// addStockToWatchlist("userId123", "AAPL");

export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, new GoogleAuthProvider());
        const user = result.user;

        // window.alert(`Signed in with ${user.email}`);
    } catch (e) {
        window.alert(e.message);
    }
};

export const signOutFromGoogle = async () => {
    try {
        await signOut(auth);

        // window.alert('Signed out!');

    } catch (e) {
        window.alert(e.message);
    }
};