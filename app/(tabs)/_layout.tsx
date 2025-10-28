import { Redirect, router, Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useSession } from '@/hooks/ctx';
import { useRepos } from '@/db/index';
import { ProfilePic } from '@/components/ProfilePic';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import useProfile from '@/hooks/useProfile';
import { initDB } from '@/db/init';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { session, isLoading } = useSession();
  const { profile } = useProfile();
  const { profiles } = useRepos();

  useEffect(() => {
    
    if (!session) return; 
    const loadProfile = async () => {
      try {
        const res = await profiles.getUserAndProfileByEmail(session);
        if (res && session) router.push("/(tabs)");
        else router.push("/onboarding");
      } catch (err) {
        console.error(err);
      }
    };
    loadProfile();
  }, [session]);

  if (isLoading) return null;
  if (!session) return <Redirect href="/auth" />;

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
