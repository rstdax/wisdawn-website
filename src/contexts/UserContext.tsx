import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, type User, updateProfile } from "firebase/auth";
import { auth, hasInvalidFirebaseConfig } from "../lib/firebase";
import { getUserProfile, upsertUserProfile } from "../lib/firestore";

export interface WorkshopData {
  id: number;
  name: string;
  date: string;
  participants: number;
  tags: string[];
  hostUid?: string;
  chapters?: Array<{
    id: string;
    title: string;
    videoUrl?: string;
    youtubeUrl?: string;
    pdfUrl?: string;
    imageUrl?: string;
  }>;
  author?: string;
  authorAvatar?: string;
  location?: string;
  localityKey?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface UserData {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  institution: string;
  department: string;
  year: string;
  semester: string;
  interests: string[];
  gender: string;
  dob: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  createdWorkshops: WorkshopData[];
  joinedWorkshops: WorkshopData[];
}

interface UserContextType {
  currentUser: User | null;
  loadingAuth: boolean;
  userData: UserData;
  updateUserData: (newData: Partial<UserData>) => void;
  addCreatedWorkshop: (workshop: WorkshopData) => void;
  addJoinedWorkshop: (workshop: WorkshopData) => void;
  saveUserProfile: () => Promise<void>;
}

const initialUserData: UserData = {
  name: "",
  email: "",
  phone: "",
  avatar: "",
  institution: "",
  department: "",
  year: "",
  semester: "",
  interests: [],
  gender: "",
  dob: "",
  location: "",
  latitude: null,
  longitude: null,
  createdWorkshops: [],
  joinedWorkshops: [],
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [userData, setUserData] = useState<UserData>(initialUserData);

  useEffect(() => {
    if (hasInvalidFirebaseConfig) {
      setCurrentUser(null);
      setUserData(initialUserData);
      setLoadingAuth(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (!user) {
        setUserData(initialUserData);
        setLoadingAuth(false);
        return;
      }

      try {
        const profile = await getUserProfile(user.uid);
        const profileAvatar =
          profile && typeof profile.avatar === "string" && profile.avatar.trim().length > 0
            ? profile.avatar
            : "";
        const fallbackAvatar =
          profileAvatar ||
          user.photoURL ||
          `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(user.displayName || user.email || user.uid)}&backgroundColor=b6e3f4`;
        const fallbackName =
          profile && typeof profile.name === "string" && profile.name.trim().length > 0
            ? profile.name
            : (user.displayName ?? "");

        setUserData((prev) => ({
          ...prev,
          name: fallbackName || prev.name,
          email: user.email ?? "",
          avatar: fallbackAvatar,
          ...(profile ?? {}),
        }));
        void upsertUserProfile(user.uid, {
          name: fallbackName || user.displayName || "",
          email: user.email ?? "",
          avatar: fallbackAvatar,
        });
      } catch (error) {
        console.error("Failed to load user profile:", error);
        setUserData((prev) => ({
          ...prev,
          name: user.displayName ?? prev.name,
          email: user.email ?? "",
          avatar:
            user.photoURL ||
            prev.avatar ||
            `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(user.displayName || user.email || user.uid)}&backgroundColor=b6e3f4`,
        }));
        void upsertUserProfile(user.uid, {
          name: user.displayName ?? "",
          email: user.email ?? "",
          avatar:
            user.photoURL ||
            `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(user.displayName || user.email || user.uid)}&backgroundColor=b6e3f4`,
        });
      } finally {
        setLoadingAuth(false);
      }
    });

    return unsubscribe;
  }, []);

  const syncAuthIdentity = async (user: User, profile: Partial<UserData>) => {
    const safeName = (profile.name ?? "").trim();
    const safeAvatar = (profile.avatar ?? "").trim();
    const updates: { displayName?: string; photoURL?: string } = {};

    if (safeName && safeName !== (user.displayName ?? "")) {
      updates.displayName = safeName;
    }
    if (safeAvatar && safeAvatar !== (user.photoURL ?? "")) {
      updates.photoURL = safeAvatar;
    }

    if (Object.keys(updates).length === 0) {
      return;
    }

    try {
      await updateProfile(user, updates);
    } catch (error) {
      console.error("Failed to sync Firebase Auth profile:", error);
    }
  };

  const persistProfile = async (data: Partial<UserData>) => {
    if (!currentUser) {
      return;
    }

    const mergedProfile: Partial<UserData> = {
      ...userData,
      ...data,
      email: currentUser.email ?? data.email ?? userData.email,
    };

    try {
      await upsertUserProfile(currentUser.uid, mergedProfile);
      await syncAuthIdentity(currentUser, mergedProfile);
    } catch (error) {
      console.error("Failed to save profile:", error);
    }
  };

  const updateUserData = (newData: Partial<UserData>) => {
    let nextData: UserData | null = null;
    setUserData((prev) => {
      nextData = { ...prev, ...newData };
      return nextData;
    });
    if (nextData) {
      void persistProfile(nextData);
    }
  };

  const addCreatedWorkshop = (workshop: WorkshopData) => {
    let nextCreatedWorkshops: WorkshopData[] = [];
    setUserData((prev) => {
      nextCreatedWorkshops = [workshop, ...prev.createdWorkshops];
      return {
      ...prev,
      createdWorkshops: nextCreatedWorkshops,
    };
    });
    void persistProfile({ createdWorkshops: nextCreatedWorkshops });
  };

  const addJoinedWorkshop = (workshop: WorkshopData) => {
    let nextJoinedWorkshops: WorkshopData[] = [];
    let didAddWorkshop = false;
    setUserData((prev) => {
      const alreadyJoined = prev.joinedWorkshops.some((item) => item.id === workshop.id);
      if (alreadyJoined) {
        nextJoinedWorkshops = prev.joinedWorkshops;
        return prev;
      }

      nextJoinedWorkshops = [workshop, ...prev.joinedWorkshops];
      didAddWorkshop = true;
      return {
        ...prev,
        joinedWorkshops: nextJoinedWorkshops,
      };
    });

    if (didAddWorkshop) {
      void persistProfile({ joinedWorkshops: nextJoinedWorkshops });
    }
  };

  const saveUserProfile = async () => {
    if (!currentUser) {
      return;
    }
    await persistProfile({
      ...userData,
      email: currentUser.email ?? userData.email,
    });
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        loadingAuth,
        userData,
        updateUserData,
        addCreatedWorkshop,
        addJoinedWorkshop,
        saveUserProfile,
      }}
    >
      {!loadingAuth && children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
