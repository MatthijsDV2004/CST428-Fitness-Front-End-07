import { useState, useEffect } from "react";
import { getProfile } from "@/db/profile";
import { useSession } from "./ctx";
import type { User, Profile } from "@/types/types";

interface ProfileData {
  user: User;
  profile: Profile | null;
}

const useProfile = () => {
  const { session } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    if (!session) return;

    getProfile(session)
      .then((res) => {
        if (res) {
          setProfile(res); // ✅ now perfectly typed
        }
      })
      .catch((err) => console.error(err));
  }, [session]);

  return { profile };
};

export default useProfile;
