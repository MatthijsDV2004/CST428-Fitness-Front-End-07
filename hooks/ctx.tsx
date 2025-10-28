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
import { useRepos } from "@/db/index";
import * as SecureStore from "expo-secure-store";

import type { User, NewUser, GoogleUser } from "@/types/types";

const API_BASE_URL =
  (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_URL) ??
  "https://cst438-d5640ff12bdc.herokuapp.com";

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

const mapGoogleToUser = (g: GoogleUser): NewUser => ({
  g_id: g.id,
  username: g.name,
  email: g.email,
  profile_pic: g.photo ?? null,
});

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState("session");
  const isSigningInRef = useRef(false);
  const { users, db } = useRepos();

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

      const res = await GoogleSignin.signIn();
      if (!isSuccessResponse(res)) return null;

      const { user, idToken } = res.data;

      if (!idToken) {
        console.error("No ID token returned from Google");
        return null;
      }

      const verifyRes = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: idToken }),
      });

      if (!verifyRes.ok) {
        const msg = await verifyRes.text();
        console.error("Backend verification failed:", msg);
        return null;
      }
      //here we log the jwt token
      await SecureStore.setItemAsync("jwt", idToken);
      console.log("JWT token:", idToken);

      const gUser: GoogleUser = {
        id: user.id ?? "",
        email: user.email ?? "",
        name: user.name ?? "",
        givenName: user.givenName ?? undefined,
        familyName: user.familyName ?? undefined,
        photo: user.photo ?? undefined,
      };

      await SecureStore.setItemAsync("googleId", gUser.id);

      if (!gUser.id || !gUser.email) {
        console.warn("Google user missing id/email");
        return null;
      }

      
      let dbUser = await users.getByGoogleId(gUser.id);
            if (!dbUser) {
              await db.withTransactionAsync(async () => {
                dbUser = await users.create(mapGoogleToUser(gUser));
              });
            }

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
