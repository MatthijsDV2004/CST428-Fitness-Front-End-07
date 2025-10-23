import { Redirect, router, Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useSession } from '@/hooks/ctx';
import { getProfile } from '@/db/profile';
import { ProfilePic } from '@/components/ProfilePic';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import useProfile from '@/hooks/useProfile';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { session, isLoading } = useSession();
  const { profile } = useProfile();
  

  // 2️⃣ declare every other hook *before* any return
  useEffect(() => {
    if (!session) return; // safe to guard inside the hook
    const loadProfile = async () => {
      try {
        const res = await getProfile(session);
        if (res && session) router.push("/(tabs)");
        else router.push("/onboarding");
      } catch (err) {
        console.error(err);
      }
    };
    loadProfile();
  }, [session]);

  // 3️⃣ only conditional rendering after hooks
  if (isLoading) return null;
  if (!session) return <Redirect href="/auth" />;

  // 4️⃣ main UI
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: { position: "absolute" },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: () => <ProfilePic uri={profile?.user?.profile_pic ?? null} />,
        }}
      />
    </Tabs>
  );
}
