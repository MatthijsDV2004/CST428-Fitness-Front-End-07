export interface GoogleUser {
    id: string;
    name: string;
    givenName?: string;
    familyName?: string;
    email: string;
    photo?: string | null | undefined;
  }
  
  export interface User {
    g_id: string;
    username: string;
    email: string;
    profile_pic: string | null;
  }
  
  export interface Profile {
    user_id: number;
    age: number;
    weight: number;
    height: number;
    skill_level?: string;
  }
  
  export interface OnboardingForm {
    heightFeet: number;
    heightInches: number;
    weight: number;
    age: number;
  }
  
  export interface Exercise {
    workoutID: number;
    workoutName: string;
    muscleGroup: string;
    workoutDesc: string;
    videoUrl: string;
  }

  export type RootStackParamList = {
    Home: undefined;
    AddWorkout: { day: string; userId: number; workoutPlanName: string };
    WorkoutDetail: { workoutId: number };
    WorkoutDay: { day: string; workout: string };
    Profile: undefined;
    Onboarding: undefined;
    Explore: undefined;
    ExerciseDetail: { exercise: Exercise };
  };
