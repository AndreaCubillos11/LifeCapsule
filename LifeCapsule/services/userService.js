import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../services/firebaseconfig";

export const getUserData = async () => {
    const user = auth.currentUser;
    if (!user) return null;
    const docRef = doc(db, "users", user.uid);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? snapshot.data() : null;
};
