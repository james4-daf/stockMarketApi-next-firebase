// firebase.js
import { initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { Portfolio, WatchlistDoc } from '@/lib/types';
import {
  collection,
  doc,
  getDoc,
  getFirestore,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';

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

const DEFAULT_PORTFOLIO: Portfolio = {
  id: 'default',
  name: 'Core',
  stocks: [],
};

function normalizeTicker(ticker: string) {
  return ticker.trim().toUpperCase();
}

async function migrateLegacyWatchlist(
  userId: string,
  legacyStocks: string[],
): Promise<WatchlistDoc> {
  const migrated: WatchlistDoc = {
    portfolios: [
      {
        ...DEFAULT_PORTFOLIO,
        stocks: legacyStocks.map(normalizeTicker),
      },
    ],
    activePortfolioId: DEFAULT_PORTFOLIO.id,
  };
  const userWatchlistRef = doc(db, 'watchlist', userId);
  await setDoc(userWatchlistRef, migrated);
  return migrated;
}

export const getWatchlistDoc = async (
  userId: string,
): Promise<WatchlistDoc> => {
  const userWatchlistRef = doc(db, 'watchlist', userId);
  const docSnap = await getDoc(userWatchlistRef);

  if (!docSnap.exists()) {
    return {
      portfolios: [{ ...DEFAULT_PORTFOLIO }],
      activePortfolioId: DEFAULT_PORTFOLIO.id,
    };
  }

  const data = docSnap.data();

  if (Array.isArray(data.stocks)) {
    return migrateLegacyWatchlist(userId, data.stocks);
  }

  const portfolios = (data.portfolios as Portfolio[]) || [
    { ...DEFAULT_PORTFOLIO },
  ];
  const activePortfolioId =
    data.activePortfolioId || portfolios[0]?.id || DEFAULT_PORTFOLIO.id;

  return { portfolios, activePortfolioId };
};

export const setActivePortfolio = async (
  userId: string,
  portfolioId: string,
): Promise<void> => {
  const userWatchlistRef = doc(db, 'watchlist', userId);
  const docData = await getWatchlistDoc(userId);
  await setDoc(userWatchlistRef, { ...docData, activePortfolioId: portfolioId });
};

export const createPortfolio = async (
  userId: string,
  name: string,
): Promise<Portfolio> => {
  const docData = await getWatchlistDoc(userId);
  const newPortfolio: Portfolio = {
    id: doc(collection(db, 'dummy')).id,
    name: name.trim() || 'New list',
    stocks: [],
  };
  const userWatchlistRef = doc(db, 'watchlist', userId);
  await setDoc(userWatchlistRef, {
    portfolios: [...docData.portfolios, newPortfolio],
    activePortfolioId: newPortfolio.id,
  });
  return newPortfolio;
};

export const addStockToPortfolio = async (
  userId: string,
  portfolioId: string,
  ticker: string,
): Promise<string[]> => {
  const normalized = normalizeTicker(ticker);
  const docData = await getWatchlistDoc(userId);
  const portfolios = docData.portfolios.map((p) => {
    if (p.id !== portfolioId) return p;
    if (p.stocks.some((s) => s.toUpperCase() === normalized)) return p;
    return { ...p, stocks: [...p.stocks, normalized] };
  });
  const userWatchlistRef = doc(db, 'watchlist', userId);
  await setDoc(userWatchlistRef, { ...docData, portfolios });
  return portfolios.find((p) => p.id === portfolioId)?.stocks ?? [];
};

export const removeStockFromPortfolio = async (
  userId: string,
  portfolioId: string,
  ticker: string,
): Promise<string[]> => {
  const normalized = normalizeTicker(ticker);
  const docData = await getWatchlistDoc(userId);
  const portfolios = docData.portfolios.map((p) =>
    p.id === portfolioId
      ? {
          ...p,
          stocks: p.stocks.filter((s) => s.toUpperCase() !== normalized),
        }
      : p,
  );
  const userWatchlistRef = doc(db, 'watchlist', userId);
  await setDoc(userWatchlistRef, { ...docData, portfolios });
  return portfolios.find((p) => p.id === portfolioId)?.stocks ?? [];
};

export const isStockInActivePortfolio = async (
  userId: string,
  ticker: string,
): Promise<boolean> => {
  const docData = await getWatchlistDoc(userId);
  const active = docData.portfolios.find(
    (p) => p.id === docData.activePortfolioId,
  );
  const normalized = normalizeTicker(ticker);
  return (
    active?.stocks.some((s) => s.toUpperCase() === normalized) ?? false
  );
};

export const toggleStockInActivePortfolio = async (
  userId: string,
  ticker: string,
): Promise<boolean> => {
  const docData = await getWatchlistDoc(userId);
  const portfolioId = docData.activePortfolioId;
  const active = docData.portfolios.find((p) => p.id === portfolioId);
  const normalized = normalizeTicker(ticker);
  const exists =
    active?.stocks.some((s) => s.toUpperCase() === normalized) ?? false;

  if (exists) {
    await removeStockFromPortfolio(userId, portfolioId, normalized);
    return false;
  }
  await addStockToPortfolio(userId, portfolioId, normalized);
  return true;
};

// Backward-compatible: returns stocks from active portfolio
export const getWatchlistData = async (userId: string) => {
  try {
    const docData = await getWatchlistDoc(userId);
    const active = docData.portfolios.find(
      (p) => p.id === docData.activePortfolioId,
    );
    return active?.stocks ?? [];
  } catch (e) {
    console.error('Error getting documents: ', e);
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
    await signInWithPopup(auth, new GoogleAuthProvider());

    // window.alert(`Signed in with ${user.email}`);
  } catch (e) {
    window.alert((e as Error).message);
  }
};

export const signOutFromGoogle = async () => {
  try {
    await signOut(auth);

    // window.alert('Signed out!');
  } catch (e) {
    window.alert((e as Error).message);
  }
};

// Notes functions
export interface Note {
  id: string; // Unique ID for the note within the user's array
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

type FirestoreNote = Omit<Note, 'createdAt' | 'updatedAt'> & {
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export const getNotesByUserId = async (userId: string): Promise<Note[]> => {
  try {
    const notesDocRef = doc(db, 'notes', userId);
    const docSnap = await getDoc(notesDocRef);

    if (docSnap.exists()) {
      // The 'notes' field contains the array of note objects
      const data = docSnap.data();
      // Firestore timestamps need to be converted to JS Date objects
      return data.notes
        .map((note: FirestoreNote) => ({
          ...note,
          createdAt: note.createdAt.toDate(),
          updatedAt: note.updatedAt.toDate(),
        }))
        .sort(
          (a: Note, b: Note) => b.createdAt.getTime() - a.createdAt.getTime(),
        );
    } else {
      // No notes document for this user yet
      return [];
    }
  } catch (e) {
    console.error('Error getting notes: ', e);
    return [];
  }
};

export const addNote = async (
  content: string,
  userId: string,
): Promise<string> => {
  const notesDocRef = doc(db, 'notes', userId);
  const docSnap = await getDoc(notesDocRef);

  const newNote: Note = {
    id: doc(collection(db, 'dummy')).id, // Generate a unique ID
    content,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    if (docSnap.exists()) {
      const notes = docSnap.data().notes || [];
      await updateDoc(notesDocRef, {
        notes: [...notes, newNote],
      });
    } else {
      await setDoc(notesDocRef, {
        notes: [newNote],
      });
    }
    return newNote.id;
  } catch (e) {
    console.error('Error adding note: ', e);
    throw e;
  }
};

export const updateNote = async (
  userId: string, // Changed from noteId
  noteId: string,
  content: string,
): Promise<void> => {
  const notesDocRef = doc(db, 'notes', userId);

  try {
    const docSnap = await getDoc(notesDocRef);
    if (!docSnap.exists()) {
      throw new Error("User's notes document not found");
    }

    const notes = docSnap.data().notes || [];
    const noteIndex = notes.findIndex((note: Note) => note.id === noteId);

    if (noteIndex === -1) {
      throw new Error('Note not found');
    }

    notes[noteIndex] = {
      ...notes[noteIndex],
      content,
      updatedAt: new Date(),
    };

    await updateDoc(notesDocRef, { notes });
  } catch (e) {
    console.error('Error updating note: ', e);
    throw e;
  }
};

export const deleteNote = async (
  userId: string,
  noteId: string,
): Promise<void> => {
  // Changed from noteId
  const notesDocRef = doc(db, 'notes', userId);

  try {
    const docSnap = await getDoc(notesDocRef);
    if (!docSnap.exists()) {
      throw new Error("User's notes document not found");
    }

    const notes = docSnap.data().notes || [];
    const updatedNotes = notes.filter((note: Note) => note.id !== noteId);

    await updateDoc(notesDocRef, { notes: updatedNotes });
  } catch (e) {
    console.error('Error deleting note: ', e);
    throw e;
  }
};

export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;
    return user;
  } catch (e) {
    console.error('Error signing up with email: ', e);
    throw e;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;
    return user;
  } catch (e) {
    console.error('Error signing in with email: ', e);
    throw e;
  }
};

export const removeStockFromWatchlist = async (
  userId: string,
  stock: string,
) => {
  try {
    const docData = await getWatchlistDoc(userId);
    return removeStockFromPortfolio(
      userId,
      docData.activePortfolioId,
      stock,
    );
  } catch (e) {
    console.error('Error removing stock from watchlist: ', e);
    throw e;
  }
};
