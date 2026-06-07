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
import { auth, db, firebaseEnabled } from "../firebase/firebase";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Pre-seeded local users for fallback mode
const MOCK_SUPER_ADMIN = {
  uid: "mock-super-admin-uid",
  fullName: "Super Admin User",
  email: "superadmin@vpp.org",
  role: "super_admin",
  status: "active",
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString()
};

const MOCK_ADMIN = {
  uid: "mock-admin-uid",
  fullName: "Volunteer Admin",
  email: "admin@vpp.org",
  role: "admin",
  status: "active",
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString()
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize mock users in localStorage if not exists
  useEffect(() => {
    if (!firebaseEnabled) {
      const storedUsers = localStorage.getItem("mock_users");
      if (!storedUsers) {
        localStorage.setItem("mock_users", JSON.stringify([MOCK_SUPER_ADMIN, MOCK_ADMIN]));
      }
    }
  }, []);

  // Listen to Auth state change
  useEffect(() => {
    if (firebaseEnabled && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user);
        if (user) {
          try {
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              setUserProfile(docSnap.data());
              // Update last login
              await updateDoc(docRef, { lastLogin: serverTimestamp() });
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
          }
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // Local Storage Fallback Mode
      const localUser = sessionStorage.getItem("logged_in_mock_user");
      if (localUser) {
        const parsed = JSON.parse(localUser);
        setCurrentUser(parsed);
        setUserProfile(parsed);
      }
      setLoading(false);
    }
  }, []);

  // Log activity helper
  const logActivity = async (action, targetType, targetId, metadata = {}, actorId = null, actorName = null) => {
    const curUid = actorId || userProfile?.uid || currentUser?.uid || "system";
    const curName = actorName || userProfile?.fullName || currentUser?.email || "System";
    
    const logEntry = {
      timestamp: firebaseEnabled ? serverTimestamp() : new Date().toISOString(),
      userId: curUid,
      userEmail: currentUser?.email || "anonymous@vpp.org",
      userName: curName,
      action,
      targetType,
      targetId,
      metadata
    };

    if (firebaseEnabled && db) {
      try {
        await addDoc(collection(db, "activity_logs"), logEntry);
      } catch (error) {
        console.error("Failed to write to activity_logs:", error);
      }
    } else {
      const logs = JSON.parse(localStorage.getItem("mock_activity_logs") || "[]");
      logs.unshift({ ...logEntry, id: `log-${Date.now()}-${Math.random()}` });
      localStorage.setItem("mock_activity_logs", JSON.stringify(logs.slice(0, 1000))); // Keep last 1000 logs
    }
  };

  // Login
  const login = async (email, password) => {
    setLoading(true);
    try {
      if (firebaseEnabled && auth) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Fetch profile to verify status
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          const profile = docSnap.data();
          if (profile.status === "suspended") {
            await signOut(auth);
            throw new Error("Your account is suspended. Please contact a Super Admin.");
          }
          await logActivity("LOGIN", "auth", user.uid, {}, profile.uid, profile.fullName);
        }
        return user;
      } else {
        // Local storage login
        const users = JSON.parse(localStorage.getItem("mock_users") || "[]");
        const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (!foundUser || password !== "password") { // Allow any user to sign in with "password"
          throw new Error("Invalid email or password");
        }
        
        if (foundUser.status === "suspended") {
          throw new Error("Your account is suspended. Please contact a Super Admin.");
        }

        const updatedUser = {
          ...foundUser,
          lastLogin: new Date().toISOString()
        };
        
        // Update user in lists
        const updatedUsers = users.map(u => u.uid === foundUser.uid ? updatedUser : u);
        localStorage.setItem("mock_users", JSON.stringify(updatedUsers));
        
        sessionStorage.setItem("logged_in_mock_user", JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
        setUserProfile(updatedUser);
        
        await logActivity("LOGIN", "auth", updatedUser.uid, {}, updatedUser.uid, updatedUser.fullName);
        return updatedUser;
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
      
      if (firebaseEnabled && auth) {
        await logActivity("LOGOUT", "auth", currentUser?.uid, {}, actorId, actorName);
        await signOut(auth);
      } else {
        await logActivity("LOGOUT", "auth", currentUser?.uid, {}, actorId, actorName);
        sessionStorage.removeItem("logged_in_mock_user");
        setCurrentUser(null);
        setUserProfile(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Register Admin (Super Admin only can do this)
  const registerAdmin = async (email, password, fullName) => {
    if (!firebaseEnabled) {
      const users = JSON.parse(localStorage.getItem("mock_users") || "[]");
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error("Email already registered");
      }
      
      const newAdmin = {
        uid: `mock-user-${Date.now()}`,
        fullName,
        email,
        role: "admin",
        status: "suspended", // Defaults to suspended until approved/activated
        createdAt: new Date().toISOString(),
        lastLogin: null
      };
      
      users.push(newAdmin);
      localStorage.setItem("mock_users", JSON.stringify(users));
      await logActivity("ADMIN_REGISTER", "users", newAdmin.uid, { email, fullName });
      return newAdmin;
    }

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
    if (firebaseEnabled && auth) {
      await sendPasswordResetEmail(auth, email);
      await logActivity("ADMIN_PASSWORD_RESET_TRIGGERED", "users", "none", { email });
    } else {
      // Mock reset
      await logActivity("ADMIN_PASSWORD_RESET_TRIGGERED", "users", "none", { email, mock: true });
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
      firebaseEnabled
    }}>
      {children}
    </AuthContext.Provider>
  );
};
