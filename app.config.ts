import 'dotenv/config';

export default {
  expo: {
    name: "Fitness",
    slug: "fitness-app",
    scheme: "fitness-app", // fine to keep; not used by this lib
    android: { package: "com.mattdv2004.fitnessapp" },
    ios: { bundleIdentifier: "com.mattdv2004.fitnessapp" },
    plugins: [
      // The library’s config plugin wires native bits on iOS/Android
      "@react-native-google-signin/google-signin",
    ],
    extra: {
      expoPublic: {
        GOOGLE_ANDROID_CLIENT_ID: process.env.GOOGLE_ANDROID_CLIENT_ID, // Android OAuth client
        // GOOGLE_IOS_CLIENT_ID: process.env.GOOGLE_IOS_CLIENT_ID,         // iOS OAuth client
        GOOGLE_WEB_CLIENT_ID: process.env.GOOGLE_WEB_CLIENT_ID,         // Web OAuth client
      },
    },
  },
};
