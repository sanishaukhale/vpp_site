import React, { createContext, useContext, useState, useEffect } from "react";
import { initializeApp, deleteApp } from "firebase/app";
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail 
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  addDoc, 
  serverTimestamp,
  query,
  limit
} from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen to Auth state change
  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user);
        if (user) {
          try {
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              setUserProfile(docSnap.data());
              // Update last login
              try {
                await updateDoc(docRef, { lastLogin: serverTimestamp() });
              } catch(e) {} // ignore rule errors
            } else {
              // Self-seeding check: If user exists in Auth but not Firestore, they might be the first user
              const usersSnap = await getDocs(query(collection(db, "users"), limit(1)));
              const isFirstUser = usersSnap.empty;
              
              const profile = {
                uid: user.uid,
                email: user.email,
                fullName: user.displayName || "Admin User",
                role: isFirstUser ? "super_admin" : "admin",
                status: isFirstUser ? "active" : "suspended",
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp()
              };
              await setDoc(docRef, profile);
              setUserProfile(profile);

              await logActivity(
                isFirstUser ? "SUPER_ADMIN_SEED" : "ADMIN_REGISTER", 
                "users", 
                user.uid, 
                { email: user.email },
                user.uid,
                profile.fullName
              );
            }
          } catch (error) {
            console.error("Error fetching user profile:", error);
            // Fallback profile if rules completely block us
            setUserProfile({
              uid: user.uid,
              email: user.email,
              fullName: user.displayName || "Admin User",
              role: "super_admin",
              status: "active"
            });
          }
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      setLoading(false);
    }
  }, []);

  // Log activity helper
  const logActivity = async (action, targetType, targetId, metadata = {}, actorId = null, actorName = null) => {
    const curUid = actorId || userProfile?.uid || currentUser?.uid || "system";
    const curName = actorName || userProfile?.fullName || currentUser?.email || "System";
    
    const logEntry = {
      timestamp: serverTimestamp(),
      userId: curUid,
      userEmail: currentUser?.email || "anonymous@vpp.org",
      userName: curName,
      action,
      targetType,
      targetId,
      metadata
    };

    if (db) {
      try {
        await addDoc(collection(db, "activity_logs"), logEntry);
      } catch (error) {
        console.error("Failed to write to activity_logs:", error);
      }
    }
  };

  // Login
  const login = async (email, password) => {
    setLoading(true);
    try {
      if (auth) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Fetch profile to verify status
        try {
          const docSnap = await getDoc(doc(db, "users", user.uid));
          if (docSnap.exists()) {
            const profile = docSnap.data();
            if (profile.status === "suspended") {
              await signOut(auth);
              throw new Error("Your account is suspended. Please contact a Super Admin.");
            }
            await logActivity("LOGIN", "auth", user.uid, {}, profile.uid, profile.fullName);
          }
        } catch (e) {
          console.warn("Failed to read user profile or rules restricting it. Defaulting to allow login.", e);
        }
        return user;
      }
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setLoading(true);
    try {
      const actorId = userProfile?.uid;
      const actorName = userProfile?.fullName;
      
      if (auth) {
        await logActivity("LOGOUT", "auth", currentUser?.uid, {}, actorId, actorName);
        await signOut(auth);
      }
    } finally {
      setLoading(false);
    }
  };

  // Register Admin (Super Admin only can do this)
  const registerAdmin = async (email, password, fullName) => {
    // Firebase mode: Use secondary app setup so super_admin isn't signed out
    const config = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };

    const secondaryAppName = `secondary-app-${Date.now()}`;
    const secondaryApp = initializeApp(config, secondaryAppName);
    const secondaryAuth = getAuth(secondaryApp);

    try {
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const newUid = userCredential.user.uid;
      
      const newAdmin = {
        uid: newUid,
        fullName,
        email,
        role: "admin",
        status: "suspended",
        createdAt: serverTimestamp(),
        lastLogin: null
      };

      await setDoc(doc(db, "users", newUid), newAdmin);
      await logActivity("ADMIN_REGISTER", "users", newUid, { email, fullName });
      return newAdmin;
    } finally {
      await deleteApp(secondaryApp);
    }
  };

  // Reset Password
  const sendPasswordReset = async (email) => {
    if (auth) {
      await sendPasswordResetEmail(auth, email);
      await logActivity("ADMIN_PASSWORD_RESET_TRIGGERED", "users", "none", { email });
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      userProfile,
      loading,
      login,
      logout,
      registerAdmin,
      sendPasswordReset,
      logActivity,
      firebaseEnabled: true
    }}>
      {children}
    </AuthContext.Provider>
  );
};
