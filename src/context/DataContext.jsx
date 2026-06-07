import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  collection, 
  onSnapshot, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  query,
  where,
  getDocs,
  writeBatch
} from "firebase/firestore";
import { db, firebaseEnabled } from "../firebase/firebase";
import { useAuth } from "./AuthContext";
import { MOCK_ACTIVITIES, MOCK_PROJECTS, MOCK_ARTICLES, MOCK_TEAM } from "../constants/mockData";

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const { userProfile, logActivity } = useAuth();
  
  // Public Collections
  const [activities, setActivities] = useState([]);
  const [projects, setProjects] = useState([]);
  const [articles, setArticles] = useState([]);
  const [team, setTeam] = useState([]);
  
  // Admin-only data
  const [users, setUsers] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [systemSettings, setSystemSettings] = useState({ comingSoon: false, maintenanceMode: false });
  
  const [loading, setLoading] = useState(true);

  // Helper: Get collection array and setter based on collectionName
  const getCollectionState = (name) => {
    switch (name) {
      case "activities": return { state: activities, setter: setActivities };
      case "projects":   return { state: projects, setter: setProjects };
      case "articles":   return { state: articles, setter: setArticles };
      case "team":       return { state: team, setter: setTeam };
      default: return null;
    }
  };

  // --- 1. Real-time Listeners or Local Storage Seeding ---
  useEffect(() => {
    if (firebaseEnabled && db) {
      // Listen to public content
      const unsubActivities = onSnapshot(collection(db, "activities"), (snap) => {
        setActivities(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      const unsubProjects = onSnapshot(collection(db, "projects"), (snap) => {
        setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      const unsubArticles = onSnapshot(collection(db, "articles"), (snap) => {
        setArticles(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      const unsubTeam = onSnapshot(collection(db, "team"), (snap) => {
        setTeam(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });

      // Listen to system settings
      const unsubSettings = onSnapshot(doc(db, "settings", "website"), (docSnap) => {
        if (docSnap.exists()) {
          setSystemSettings(docSnap.data());
        } else {
          // Initialize settings doc if not exists
          setDoc(doc(db, "settings", "website"), { comingSoon: false, maintenanceMode: false });
        }
      });

      // Listen to users (if super_admin)
      let unsubUsers = () => {};
      if (userProfile?.role === "super_admin") {
        unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
          setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
      }

      // Listen to activity logs (if super_admin)
      let unsubLogs = () => {};
      if (userProfile?.role === "super_admin") {
        unsubLogs = onSnapshot(collection(db, "activity_logs"), (snap) => {
          const sortedLogs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
            .sort((a, b) => {
              const tA = a.timestamp?.seconds || new Date(a.timestamp).getTime() || 0;
              const tB = b.timestamp?.seconds || new Date(b.timestamp).getTime() || 0;
              return tB - tA; // Newest first
            });
          setActivityLogs(sortedLogs);
        });
      }

      // Listen to notifications (only authenticated users see their own notifications or super admins see submission notifications)
      let unsubNotifs = () => {};
      if (userProfile) {
        unsubNotifs = onSnapshot(
          query(
            collection(db, "notifications"),
            where("userId", "in", [userProfile.uid, "all_super_admins"])
          ),
          (snap) => {
            const sortedNotifs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
              .sort((a, b) => {
                const tA = a.createdAt?.seconds || new Date(a.createdAt).getTime() || 0;
                const tB = b.createdAt?.seconds || new Date(b.createdAt).getTime() || 0;
                return tB - tA;
              });
            setNotifications(sortedNotifs);
          }
        );
      }

      setLoading(false);

      return () => {
        unsubActivities();
        unsubProjects();
        unsubArticles();
        unsubTeam();
        unsubSettings();
        unsubUsers();
        unsubLogs();
        unsubNotifs();
      };
    } else {
      // Local Storage Fallback Mode: Seed data if empty or outdated
      const SEED_VERSION = "v3";
      if (localStorage.getItem("mock_seed_version") !== SEED_VERSION) {
        localStorage.setItem("mock_activities", JSON.stringify(MOCK_ACTIVITIES));
        localStorage.setItem("mock_projects", JSON.stringify(MOCK_PROJECTS));
        localStorage.setItem("mock_articles", JSON.stringify(MOCK_ARTICLES));
        localStorage.setItem("mock_team", JSON.stringify(MOCK_TEAM));
        localStorage.setItem("mock_seed_version", SEED_VERSION);
      }

      const localGet = (key, seed) => {
        const item = localStorage.getItem(key);
        if (!item) {
          localStorage.setItem(key, JSON.stringify(seed));
          return seed;
        }
        return JSON.parse(item);
      };

      setActivities(localGet("mock_activities", MOCK_ACTIVITIES));
      setProjects(localGet("mock_projects", MOCK_PROJECTS));
      setArticles(localGet("mock_articles", MOCK_ARTICLES));
      setTeam(localGet("mock_team", MOCK_TEAM));
      
      const settings = localGet("mock_settings", { comingSoon: false, maintenanceMode: false });
      setSystemSettings(settings);

      // Local users synchronization
      if (userProfile?.role === "super_admin") {
        setUsers(JSON.parse(localStorage.getItem("mock_users") || "[]"));
        setActivityLogs(JSON.parse(localStorage.getItem("mock_activity_logs") || "[]"));
      }

      // Sync local notifications
      if (userProfile) {
        const allNotifs = JSON.parse(localStorage.getItem("mock_notifications") || "[]");
        const userNotifs = allNotifs.filter(n => n.userId === userProfile.uid || (userProfile.role === "super_admin" && n.userId === "all_super_admins"));
        setNotifications(userNotifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }

      setLoading(false);
    }
  }, [userProfile]);

  // Sync users and logs in Local Storage mode when they change
  useEffect(() => {
    if (!firebaseEnabled && userProfile?.role === "super_admin") {
      const handleStorageChange = () => {
        setUsers(JSON.parse(localStorage.getItem("mock_users") || "[]"));
        setActivityLogs(JSON.parse(localStorage.getItem("mock_activity_logs") || "[]"));
      };
      window.addEventListener("storage", handleStorageChange);
      return () => window.removeEventListener("storage", handleStorageChange);
    }
  }, [userProfile]);

  // --- 2. System Settings & Admin Management Functions ---
  const updateSystemSettings = async (newSettings) => {
    if (firebaseEnabled && db) {
      const docRef = doc(db, "settings", "website");
      await updateDoc(docRef, newSettings);
      await logActivity("SYSTEM_SETTINGS_UPDATE", "settings", "website", newSettings);
    } else {
      localStorage.setItem("mock_settings", JSON.stringify(newSettings));
      setSystemSettings(newSettings);
      await logActivity("SYSTEM_SETTINGS_UPDATE", "settings", "website", newSettings);
    }
  };

  const toggleUserStatus = async (uid, currentStatus) => {
    const nextStatus = currentStatus === "active" ? "suspended" : "active";
    if (firebaseEnabled && db) {
      await updateDoc(doc(db, "users", uid), { status: nextStatus });
      await logActivity("ADMIN_STATUS_CHANGE", "users", uid, { from: currentStatus, to: nextStatus });
    } else {
      const usersList = JSON.parse(localStorage.getItem("mock_users") || "[]");
      const updated = usersList.map(u => u.uid === uid ? { ...u, status: nextStatus } : u);
      localStorage.setItem("mock_users", JSON.stringify(updated));
      setUsers(updated);
      await logActivity("ADMIN_STATUS_CHANGE", "users", uid, { from: currentStatus, to: nextStatus });
    }
  };

  const deleteUser = async (uid, email) => {
    if (firebaseEnabled && db) {
      await deleteDoc(doc(db, "users", uid));
      await logActivity("ADMIN_DELETE", "users", uid, { email });
    } else {
      const usersList = JSON.parse(localStorage.getItem("mock_users") || "[]");
      const updated = usersList.filter(u => u.uid !== uid);
      localStorage.setItem("mock_users", JSON.stringify(updated));
      setUsers(updated);
      await logActivity("ADMIN_DELETE", "users", uid, { email });
    }
  };

  // --- 3. Notification Helpers ---
  const sendNotification = async (userId, title, message, type, relatedId, relatedType) => {
    const notification = {
      userId,
      title,
      message,
      type,
      relatedId,
      relatedType,
      read: false,
      createdAt: firebaseEnabled ? serverTimestamp() : new Date().toISOString()
    };

    if (firebaseEnabled && db) {
      await addDoc(collection(db, "notifications"), notification);
    } else {
      const notifs = JSON.parse(localStorage.getItem("mock_notifications") || "[]");
      const newNotif = { ...notification, id: `notif-${Date.now()}-${Math.random()}` };
      notifs.unshift(newNotif);
      localStorage.setItem("mock_notifications", JSON.stringify(notifs));
      
      // Update local state if matching
      if (userProfile && (userId === userProfile.uid || (userProfile.role === "super_admin" && userId === "all_super_admins"))) {
        setNotifications(prev => [newNotif, ...prev]);
      }
    }
  };

  const markNotificationAsRead = async (id) => {
    if (firebaseEnabled && db) {
      await updateDoc(doc(db, "notifications", id), { read: true });
    } else {
      const notifs = JSON.parse(localStorage.getItem("mock_notifications") || "[]");
      const updated = notifs.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem("mock_notifications", JSON.stringify(updated));
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }
  };

  // --- 4. Custom CRUD for Public Collections ---
  const addContent = async (collectionName, data) => {
    if (!userProfile) throw new Error("Unauthorized");
    
    const isSuper = userProfile.role === "super_admin";
    const status = isSuper ? "approved" : "draft";
    const isPublished = isSuper;

    const newDoc = {
      ...data,
      status,
      isPublished,
      createdBy: userProfile.uid,
      createdByName: userProfile.fullName,
      createdAt: firebaseEnabled ? serverTimestamp() : new Date().toISOString(),
      updatedAt: firebaseEnabled ? serverTimestamp() : new Date().toISOString(),
      pendingChanges: null,
      approvedBy: isSuper ? userProfile.uid : null,
      approvedAt: isSuper ? (firebaseEnabled ? serverTimestamp() : new Date().toISOString()) : null,
      rejectionReason: null
    };

    let createdId = "";
    if (firebaseEnabled && db) {
      const docRef = await addDoc(collection(db, collectionName), newDoc);
      createdId = docRef.id;
    } else {
      const localKey = `mock_${collectionName}`;
      const list = JSON.parse(localStorage.getItem(localKey) || "[]");
      createdId = `${collectionName.slice(0, 3)}-${Date.now()}`;
      const docWithId = { id: createdId, ...newDoc };
      list.push(docWithId);
      localStorage.setItem(localKey, JSON.stringify(list));
      
      const { setter } = getCollectionState(collectionName);
      setter(list);
    }

    await logActivity(
      isSuper ? "CONTENT_CREATE" : "CONTENT_CREATE_DRAFT", 
      collectionName, 
      createdId, 
      { title: data.title || data.name }
    );

    return createdId;
  };

  const updateContent = async (collectionName, id, updates) => {
    if (!userProfile) throw new Error("Unauthorized");
    const { state, setter } = getCollectionState(collectionName);
    const original = state.find(item => item.id === id);
    if (!original) throw new Error("Document not found");

    const isSuper = userProfile.role === "super_admin";
    const isAuthor = original.createdBy === userProfile.uid;
    
    if (!isSuper && !isAuthor) throw new Error("Permission denied");

    let finalUpdates = {};
    let notificationText = "";

    // Flow for editing draft/pending content OR directly editing as Super Admin
    if (original.status === "draft" || original.status === "rejected" || isSuper) {
      finalUpdates = {
        ...updates,
        status: isSuper ? "approved" : "draft",
        isPublished: isSuper ? true : original.isPublished,
        updatedAt: firebaseEnabled ? serverTimestamp() : new Date().toISOString()
      };
      notificationText = isSuper ? "updated and published directly" : "updated as draft";
    } else {
      // Flow for Admin editing an already-approved/published document:
      // We stage changes in `pendingChanges` and set status to pending
      finalUpdates = {
        pendingChanges: updates,
        status: "pending",
        updatedAt: firebaseEnabled ? serverTimestamp() : new Date().toISOString()
      };
      notificationText = "edited (changes submitted for approval)";
      
      // Notify super admins
      await sendNotification(
        "all_super_admins",
        "Pending Changes Submitted",
        `${userProfile.fullName} edited "${original.title || original.name}". Review changes in Approval Center.`,
        "submission",
        id,
        collectionName
      );
    }

    if (firebaseEnabled && db) {
      await updateDoc(doc(db, collectionName, id), finalUpdates);
    } else {
      const localKey = `mock_${collectionName}`;
      const list = JSON.parse(localStorage.getItem(localKey) || "[]");
      const updatedList = list.map(item => {
        if (item.id === id) {
          return {
            ...item,
            ...finalUpdates,
            updatedAt: new Date().toISOString()
          };
        }
        return item;
      });
      localStorage.setItem(localKey, JSON.stringify(updatedList));
      setter(updatedList);
    }

    await logActivity(
      "CONTENT_EDIT", 
      collectionName, 
      id, 
      { title: original.title || original.name, detail: notificationText }
    );
  };

  const submitForApproval = async (collectionName, id) => {
    if (!userProfile) throw new Error("Unauthorized");
    const { state, setter } = getCollectionState(collectionName);
    const original = state.find(item => item.id === id);
    if (!original) throw new Error("Document not found");

    const finalUpdates = {
      status: "pending",
      updatedAt: firebaseEnabled ? serverTimestamp() : new Date().toISOString()
    };

    if (firebaseEnabled && db) {
      await updateDoc(doc(db, collectionName, id), finalUpdates);
    } else {
      const localKey = `mock_${collectionName}`;
      const list = JSON.parse(localStorage.getItem(localKey) || "[]");
      const updatedList = list.map(item => item.id === id ? { ...item, ...finalUpdates } : item);
      localStorage.setItem(localKey, JSON.stringify(updatedList));
      setter(updatedList);
    }

    // Notify super admins
    await sendNotification(
      "all_super_admins",
      "New Content for Approval",
      `${userProfile.fullName} submitted "${original.title || original.name}" for approval.`,
      "submission",
      id,
      collectionName
    );

    await logActivity("CONTENT_SUBMIT", collectionName, id, { title: original.title || original.name });
  };

  const deleteContent = async (collectionName, id) => {
    if (!userProfile) throw new Error("Unauthorized");
    const { state, setter } = getCollectionState(collectionName);
    const original = state.find(item => item.id === id);
    if (!original) throw new Error("Document not found");

    const isSuper = userProfile.role === "super_admin";
    const isAuthor = original.createdBy === userProfile.uid;

    // Admin can only delete drafts or rejected content
    if (!isSuper) {
      if (!isAuthor) throw new Error("Permission denied");
      if (original.status === "approved" || original.status === "pending") {
        throw new Error("Cannot delete published or pending items. Ask a Super Admin.");
      }
    }

    if (firebaseEnabled && db) {
      await deleteDoc(doc(db, collectionName, id));
    } else {
      const localKey = `mock_${collectionName}`;
      const list = JSON.parse(localStorage.getItem(localKey) || "[]");
      const filtered = list.filter(item => item.id !== id);
      localStorage.setItem(localKey, JSON.stringify(filtered));
      setter(filtered);
    }

    await logActivity("CONTENT_DELETE", collectionName, id, { title: original.title || original.name });
  };

  // --- 5. Approval Workflows (Super Admin Only) ---
  const approveContent = async (collectionName, id) => {
    if (userProfile?.role !== "super_admin") throw new Error("Unauthorized");
    const { state, setter } = getCollectionState(collectionName);
    const original = state.find(item => item.id === id);
    if (!original) throw new Error("Document not found");

    let finalUpdates = {};
    if (original.pendingChanges) {
      // Merge staged changes
      finalUpdates = {
        ...original.pendingChanges,
        pendingChanges: null,
        status: "approved",
        isPublished: true,
        approvedBy: userProfile.uid,
        approvedAt: firebaseEnabled ? serverTimestamp() : new Date().toISOString(),
        rejectionReason: null,
        updatedAt: firebaseEnabled ? serverTimestamp() : new Date().toISOString()
      };
    } else {
      // Direct approve new submission
      finalUpdates = {
        status: "approved",
        isPublished: true,
        approvedBy: userProfile.uid,
        approvedAt: firebaseEnabled ? serverTimestamp() : new Date().toISOString(),
        rejectionReason: null,
        updatedAt: firebaseEnabled ? serverTimestamp() : new Date().toISOString()
      };
    }

    if (firebaseEnabled && db) {
      await updateDoc(doc(db, collectionName, id), finalUpdates);
    } else {
      const localKey = `mock_${collectionName}`;
      const list = JSON.parse(localStorage.getItem(localKey) || "[]");
      const updatedList = list.map(item => item.id === id ? { ...item, ...finalUpdates } : item);
      localStorage.setItem(localKey, JSON.stringify(updatedList));
      setter(updatedList);
    }

    // Notify the creator
    await sendNotification(
      original.createdBy,
      "Content Approved",
      `Your submission "${original.title || original.name}" has been approved and is now live.`,
      "approval",
      id,
      collectionName
    );

    await logActivity("APPROVE", collectionName, id, { title: original.title || original.name });
  };

  const rejectContent = async (collectionName, id, reason) => {
    if (userProfile?.role !== "super_admin") throw new Error("Unauthorized");
    const { state, setter } = getCollectionState(collectionName);
    const original = state.find(item => item.id === id);
    if (!original) throw new Error("Document not found");

    const finalUpdates = {
      pendingChanges: null, // Clear staged updates
      status: "rejected",
      rejectionReason: reason,
      updatedAt: firebaseEnabled ? serverTimestamp() : new Date().toISOString()
    };

    if (firebaseEnabled && db) {
      await updateDoc(doc(db, collectionName, id), finalUpdates);
    } else {
      const localKey = `mock_${collectionName}`;
      const list = JSON.parse(localStorage.getItem(localKey) || "[]");
      const updatedList = list.map(item => item.id === id ? { ...item, ...finalUpdates } : item);
      localStorage.setItem(localKey, JSON.stringify(updatedList));
      setter(updatedList);
    }

    // Notify the creator
    await sendNotification(
      original.createdBy,
      "Content Rejected",
      `Your submission "${original.title || original.name}" was rejected. Reason: ${reason}`,
      "rejection",
      id,
      collectionName
    );

    await logActivity("REJECT", collectionName, id, { title: original.title || original.name, reason });
  };

  return (
    <DataContext.Provider value={{
      activities,
      projects,
      articles,
      team,
      users,
      activityLogs,
      notifications,
      systemSettings,
      loading,
      updateSystemSettings,
      toggleUserStatus,
      deleteUser,
      markNotificationAsRead,
      sendNotification,
      addContent,
      updateContent,
      submitForApproval,
      deleteContent,
      approveContent,
      rejectContent
    }}>
      {children}
    </DataContext.Provider>
  );
};
