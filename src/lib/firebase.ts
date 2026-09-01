import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase App safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Helper for Google Popup Sign In
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Save/update user profile in Firestore
    if (user) {
      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        {
          uid: user.uid,
          displayName: user.displayName || "User",
          email: user.email || "",
          photoURL: user.photoURL || "",
          lastLogin: new Date().toISOString()
        },
        { merge: true }
      );
    }
    return user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
}

// Sign out helper
export async function signOutUser() {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
}

// Save user OS preferences (wallpaper, brightness) to Firestore
export async function saveUserPreferences(uid: string, prefs: Record<string, any>) {
  try {
    const userRef = doc(db, "users", uid);
    await setDoc(userRef, { ...prefs, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    console.error("Error saving preferences to Firestore:", error);
  }
}

// Fetch user OS preferences from Firestore
export async function getUserPreferences(uid: string) {
  try {
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (error) {
    console.error("Error fetching user preferences:", error);
  }
  return null;
}

// Save a note to Firestore
export async function saveUserNote(uid: string, title: string, content: string) {
  try {
    const notesRef = collection(db, "user_notes");
    const newNote = await addDoc(notesRef, {
      uid,
      title,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return newNote.id;
  } catch (error) {
    console.error("Error saving note to Firestore:", error);
    throw error;
  }
}

// Fetch user notes from Firestore
export async function getUserNotes(uid: string) {
  try {
    const notesRef = collection(db, "user_notes");
    const q = query(notesRef, where("uid", "==", uid));
    const querySnapshot = await getDocs(q);
    const notes: any[] = [];
    querySnapshot.forEach((docSnap) => {
      notes.push({ id: docSnap.id, ...docSnap.data() });
    });
    return notes;
  } catch (error) {
    console.error("Error loading notes from Firestore:", error);
    return [];
  }
}

// Back up a file to Firestore cloud storage
export async function syncFileToCloud(
  uid: string,
  fileData: { fileName: string; filePath: string; fileSize: string; fileType: string; content?: string }
) {
  try {
    const backupRef = collection(db, "backed_up_files");
    const docRef = await addDoc(backupRef, {
      uid,
      fileName: fileData.fileName,
      filePath: fileData.filePath,
      fileSize: fileData.fileSize,
      fileType: fileData.fileType,
      content: fileData.content || "// Backed up binary payload",
      backedUpAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error backing up file to Firestore:", error);
    throw error;
  }
}

// Fetch backed up cloud files for user
export async function getBackedUpFiles(uid: string) {
  try {
    const backupRef = collection(db, "backed_up_files");
    const q = query(backupRef, where("uid", "==", uid));
    const querySnapshot = await getDocs(q);
    const files: any[] = [];
    querySnapshot.forEach((docSnap) => {
      files.push({ id: docSnap.id, ...docSnap.data() });
    });
    return files;
  } catch (error) {
    console.error("Error fetching backed up files:", error);
    return [];
  }
}

// Delete a backed up file from Firestore
export async function deleteBackedUpFileFromCloud(docId: string) {
  try {
    const { deleteDoc: firestoreDeleteDoc } = await import("firebase/firestore");
    const docRef = doc(db, "backed_up_files", docId);
    await firestoreDeleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting cloud file backup:", error);
    throw error;
  }
}

export { onAuthStateChanged, type User };
