import { useState, useEffect } from "react";
import { useRepos } from "@/db/index";
import { useSession } from "./ctx";
import type { User, Profile } from "@/types/types";

interface ProfileData {
  user: User;
  profile: Profile | null;
}

const useProfile = () => {
  const { session } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const { profiles } = useRepos();
  useEffect(() => {
    if (!session) return;

    profiles
          .getUserAndProfileByEmail(session)
          .then((res) => {
            if (res) setProfile(res);
          })
          .catch((err) => console.error(err));
  }, [session]);

  return { profile };
};

export default useProfile;
