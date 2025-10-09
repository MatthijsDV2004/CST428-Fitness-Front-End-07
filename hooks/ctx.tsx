import { useContext, createContext, type PropsWithChildren, useEffect, useCallback } from "react";
import { GoogleSignin, statusCodes, isSuccessResponse, isErrorWithCode } from "@react-native-google-signin/google-signin";import { Platform } from "react-native";
import { useStorageState } from "./useStorageState";
import { createUser, getUserByGoogleId } from "@/db/user";

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
  if (!value) throw new Error("useSession must be wrapped in a <SessionProvider />");
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

  // Configure once
  useEffect(() => {
    GoogleSignin.configure({
      // Web client is necessary if you want tokens/refresh tokens and server verification
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      // Optional but good to set explicitly:
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      // On Android, the native SDK identifies by package + keystore (no explicit androidClientId param here)
      offlineAccess: true,               // to get serverAuthCode/refresh token
      forceCodeForRefreshToken: false,   // set true if you want code flow
      profileImageSize: 128,
    });
  }, []);

  const signIn = useCallback(async (): Promise<User | null> => {
    try {
      // Google Play Services check (Android)
      if (Platform.OS === "android") {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }

      const res = await GoogleSignin.signIn(); // opens native Google UI
      if (!isSuccessResponse(res)) {
        // user cancelled or no saved credential
        return null;
      }
      // result contains: user, idToken, serverAuthCode (if enabled)
      // You can also fetch accessToken if you set webClientId:
      // const { accessToken } = await GoogleSignin.getTokens();
      const { user, idToken, serverAuthCode } = res.data;
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

      // Upsert in your DB
      let dbUser = await getUserByGoogleId(gUser.id);
      if (!dbUser) dbUser = await createUser(mapGoogleToUser(gUser));

      setSession(gUser.email);
      return dbUser;
    } catch (e: any) {
      if (e.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled
        return null;
      }
      if (e.code === statusCodes.IN_PROGRESS) {
        // already running
        return null;
      }
      if (e.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.error("Play Services not available:", e);
        return null;
      }
      console.error("Google sign-in error:", e);
      return null;
    }
  }, [setSession]);

  const signOut = useCallback(async () => {
    try {
      // revoke refresh token + sign out locally
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
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
