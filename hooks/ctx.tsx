import {
  useContext,
  createContext,
  type PropsWithChildren,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  GoogleSignin,
  statusCodes,
  isSuccessResponse,
} from "@react-native-google-signin/google-signin";
import { Platform } from "react-native";
import { useStorageState } from "./useStorageState";
import { createUser, getUserByGoogleId } from "@/db/user";

// 👇 Store backend JWT securely
import * as SecureStore from "expo-secure-store";

const API_BASE_URL =
  __DEV__
    ? Platform.OS === "android"
      ? "http://10.0.2.2:8080"
      : "http://localhost:8080"
    : "https://cst438-d5640ff12bdc.herokuapp.com";

type User = {
  g_id: string;
  username: string;
  email: string;
  profile_pic: string | null;
};

type GoogleUser = {
  id: string;
  email: string;
  name: string;
  givenName?: string;
  familyName?: string;
  photo?: string;
};

type AuthContextType = {
  signIn: () => Promise<User | null>;
  signOut: () => Promise<void>;
  session?: string | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  signIn: async () => null,
  signOut: async () => {},
  session: null,
  isLoading: false,
});

export function useSession() {
  const value = useContext(AuthContext);
  if (!value)
    throw new Error("useSession must be wrapped in a <SessionProvider />");
  return value;
}

const mapGoogleToUser = (g: GoogleUser): User => ({
  g_id: g.id,
  username: g.name,
  email: g.email,
  profile_pic: g.photo ?? null,
});

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState("session");
  const isSigningInRef = useRef(false); // prevent concurrent sign-ins

  // ✅ Configure Google Sign-In once
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true,
      forceCodeForRefreshToken: false,
      profileImageSize: 128,
    });
  }, []);

  const signIn = useCallback(async (): Promise<User | null> => {
    if (isSigningInRef.current) {
      console.warn("Sign-in already in progress, ignoring duplicate call");
      return null;
    }

    isSigningInRef.current = true;

    try {
      if (Platform.OS === "android") {
        await GoogleSignin.hasPlayServices({
          showPlayServicesUpdateDialog: true,
        });
      }

      const res = await GoogleSignin.signIn(); // opens native Google UI
      if (!isSuccessResponse(res)) return null;

      const { user, idToken } = res.data;

      if (!idToken) {
        console.error("❌ No ID token returned from Google");
        return null;
      }

      // 👇 Send the ID token to your backend for verification
      const verifyRes = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: idToken }),
      });

      if (!verifyRes.ok) {
        const msg = await verifyRes.text();
        console.error("❌ Backend verification failed:", msg);
        return null;
      }

      const verifyData = await verifyRes.json();
      const backendJWT = verifyData.access_token;
      console.log("🎟️ Backend JWT:", backendJWT);

      // ✅ Save your backend JWT securely
      await SecureStore.setItemAsync("jwt", backendJWT);

      const gUser: GoogleUser = {
        id: user.id ?? "",
        email: user.email ?? "",
        name: user.name ?? "",
        givenName: user.givenName ?? undefined,
        familyName: user.familyName ?? undefined,
        photo: user.photo ?? undefined,
      };

      if (!gUser.id || !gUser.email) {
        console.warn("Google user missing id/email");
        return null;
      }

      // ✅ Upsert user in your local DB
      let dbUser = await getUserByGoogleId(gUser.id);
      if (!dbUser) dbUser = await createUser(mapGoogleToUser(gUser));

      // ✅ Store email in session for UI display
      setSession(gUser.email);

      return dbUser;
    } catch (e: any) {
      if (e.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("User cancelled Google Sign-In");
      } else if (e.code === statusCodes.IN_PROGRESS) {
        console.log("Google Sign-In already in progress");
      } else if (e.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.error("Play Services not available:", e);
      } else {
        console.error("Google Sign-In error:", e);
      }
      return null;
    } finally {
      isSigningInRef.current = false;
    }
  }, [setSession]);

  const signOut = useCallback(async () => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      await SecureStore.deleteItemAsync("jwt");
    } finally {
      setSession(null);
    }
  }, [setSession]);

  return (
    <AuthContext.Provider value={{ signIn, signOut, session, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
