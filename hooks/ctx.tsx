import { useContext, createContext, type PropsWithChildren } from "react";
import { useStorageState } from "./useStorageState";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { createUser, getUserByGoogleId } from "@/db/user";

WebBrowser.maybeCompleteAuthSession();

// Define a user type
type GoogleUser = {
  id: string;
  email: string;
  name: string;
  givenName?: string;
  familyName?: string;
  photo?: string;
};

// Context type
type AuthContextType = {
  signIn: () => Promise<GoogleUser | null>;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  signIn: async () => null,
  signOut: () => {},
  session: null,
  isLoading: false,
});

export function useSession() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useSession must be wrapped in a <SessionProvider />");
  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState("session");

  // Google OAuth discovery and request configuration
  const discovery = AuthSession.useAutoDiscovery("https://accounts.google.com");

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!,
      redirectUri: AuthSession.makeRedirectUri({
        scheme: "your-app-scheme",
      }),
      scopes: ["openid", "profile", "email"],
    },
    discovery
  );

  // Sign in function
  const signIn = async (): Promise<GoogleUser | null> => {
    try {
      const result = await promptAsync();

      if (result.type === "success" && result.authentication?.accessToken) {
        const userInfoResponse = await fetch("https://www.googleapis.com/userinfo/v2/me", {
          headers: { Authorization: `Bearer ${result.authentication.accessToken}` },
        });

        const userInfo = await userInfoResponse.json();

        const user: GoogleUser = {
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          givenName: userInfo.given_name,
          familyName: userInfo.family_name,
          photo: userInfo.picture,
        };

        // Optionally store user session
        setSession(userInfo.email);

        return user;
      }

      return null;
    } catch (err) {
      console.error("Error signing in:", err);
      return null;
    }
  };

  const signOut = async () => {
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ signIn, signOut, session, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
