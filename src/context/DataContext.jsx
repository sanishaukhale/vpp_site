import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc,
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

  // --- 1. Real-time Listeners ---
  useEffect(() => {
    if (db) {
      const q = (colName) => userProfile 
        ? collection(db, colName) 
        : query(collection(db, colName), where("status", "==", "approved"), where("isPublished", "==", true));

      // Listen to public content
      const unsubActivities = onSnapshot(q("activities"), (snap) => {
        setActivities(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }, (error) => console.error("Activities fetch error:", error));
      
      const unsubProjects = onSnapshot(q("projects"), (snap) => {
        setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }, (error) => console.error("Projects fetch error:", error));
      
      const unsubArticles = onSnapshot(q("articles"), (snap) => {
        setArticles(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }, (error) => console.error("Articles fetch error:", error));
      
      const unsubTeam = onSnapshot(q("team"), (snap) => {
        setTeam(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }, (error) => console.error("Team fetch error:", error));

      // Listen to system settings
      const unsubSettings = onSnapshot(doc(db, "settings", "website"), (docSnap) => {
        if (docSnap.exists()) {
          setSystemSettings(docSnap.data());
        } else {
          setDoc(doc(db, "settings", "website"), { comingSoon: false, maintenanceMode: false }).catch(console.error);
        }
      }, (error) => console.error("Settings fetch error:", error));

      // Listen to users (if super_admin)
      let unsubUsers = () => {};
      if (userProfile?.role === "super_admin") {
        unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
          setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }, (error) => console.error("Users fetch error:", error));
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
        }, (error) => console.error("Logs fetch error:", error));
      }

      // Listen to notifications
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
          }, (error) => console.error("Notifs fetch error:", error)
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
      setLoading(false);
    }
  }, [userProfile]);

  // --- 2. System Settings & Admin Management Functions ---
  const updateSystemSettings = async (newSettings) => {
    if (db) {
      const docRef = doc(db, "settings", "website");
      await updateDoc(docRef, newSettings);
      await logActivity("SYSTEM_SETTINGS_UPDATE", "settings", "website", newSettings);
    }
  };

  const toggleUserStatus = async (uid, currentStatus) => {
    const nextStatus = currentStatus === "active" ? "suspended" : "active";
    if (db) {
      await updateDoc(doc(db, "users", uid), { status: nextStatus });
      await logActivity("ADMIN_STATUS_CHANGE", "users", uid, { from: currentStatus, to: nextStatus });
    }
  };

  const deleteUser = async (uid, email) => {
    if (db) {
      await deleteDoc(doc(db, "users", uid));
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
      createdAt: serverTimestamp()
    };

    if (db) {
      await addDoc(collection(db, "notifications"), notification);
    }
  };

  const markNotificationAsRead = async (id) => {
    if (db) {
      await updateDoc(doc(db, "notifications", id), { read: true });
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
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      pendingChanges: null,
      approvedBy: isSuper ? userProfile.uid : null,
      approvedAt: isSuper ? serverTimestamp() : null,
      rejectionReason: null
    };

    let createdId = "";
    if (db) {
      const docRef = await addDoc(collection(db, collectionName), newDoc);
      createdId = docRef.id;
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
    const { state } = getCollectionState(collectionName);
    const original = state.find(item => item.id === id);
    if (!original) throw new Error("Document not found");

    const isSuper = userProfile.role === "super_admin";
    const isAuthor = original.createdBy === userProfile.uid;
    
    if (!isSuper && !isAuthor) throw new Error("Permission denied");

    let finalUpdates = {};
    let notificationText = "";

    if (original.status === "draft" || original.status === "rejected" || isSuper) {
      finalUpdates = {
        ...updates,
        status: isSuper ? "approved" : "draft",
        isPublished: isSuper ? true : original.isPublished,
        updatedAt: serverTimestamp()
      };
      notificationText = isSuper ? "updated and published directly" : "updated as draft";
    } else {
      finalUpdates = {
        pendingChanges: updates,
        status: "pending",
        updatedAt: serverTimestamp()
      };
      notificationText = "edited (changes submitted for approval)";
      
      await sendNotification(
        "all_super_admins",
        "Pending Changes Submitted",
        `${userProfile.fullName} edited "${original.title || original.name}". Review changes in Approval Center.`,
        "submission",
        id,
        collectionName
      );
    }

    if (db) {
      await updateDoc(doc(db, collectionName, id), finalUpdates);
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
    const { state } = getCollectionState(collectionName);
    const original = state.find(item => item.id === id);
    if (!original) throw new Error("Document not found");

    const finalUpdates = {
      status: "pending",
      updatedAt: serverTimestamp()
    };

    if (db) {
      await updateDoc(doc(db, collectionName, id), finalUpdates);
    }

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
    const { state } = getCollectionState(collectionName);
    const original = state.find(item => item.id === id);
    if (!original) throw new Error("Document not found");

    const isSuper = userProfile.role === "super_admin";
    const isAuthor = original.createdBy === userProfile.uid;

    if (!isSuper) {
      if (!isAuthor) throw new Error("Permission denied");
      if (original.status === "approved" || original.status === "pending") {
        throw new Error("Cannot delete published or pending items. Ask a Super Admin.");
      }
    }

    if (db) {
      await deleteDoc(doc(db, collectionName, id));
    }

    await logActivity("CONTENT_DELETE", collectionName, id, { title: original.title || original.name });
  };

  // --- 5. Approval Workflows (Super Admin Only) ---
  const approveContent = async (collectionName, id) => {
    if (userProfile?.role !== "super_admin") throw new Error("Unauthorized");
    const { state } = getCollectionState(collectionName);
    const original = state.find(item => item.id === id);
    if (!original) throw new Error("Document not found");

    let finalUpdates = {};
    if (original.pendingChanges) {
      finalUpdates = {
        ...original.pendingChanges,
        pendingChanges: null,
        status: "approved",
        isPublished: true,
        approvedBy: userProfile.uid,
        approvedAt: serverTimestamp(),
        rejectionReason: null,
        updatedAt: serverTimestamp()
      };
    } else {
      finalUpdates = {
        status: "approved",
        isPublished: true,
        approvedBy: userProfile.uid,
        approvedAt: serverTimestamp(),
        rejectionReason: null,
        updatedAt: serverTimestamp()
      };
    }

    if (db) {
      await updateDoc(doc(db, collectionName, id), finalUpdates);
    }

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
    const { state } = getCollectionState(collectionName);
    const original = state.find(item => item.id === id);
    if (!original) throw new Error("Document not found");

    const finalUpdates = {
      pendingChanges: null, // Clear staged updates
      status: "rejected",
      rejectionReason: reason,
      updatedAt: serverTimestamp()
    };

    if (db) {
      await updateDoc(doc(db, collectionName, id), finalUpdates);
    }

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
