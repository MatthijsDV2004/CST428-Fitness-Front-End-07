export interface GoogleUser {
    id: string;
    name: string;
    givenName?: string;
    familyName?: string;
    email: string;
    photo?: string | null | undefined;
  }
  

  export interface GoogleUser {
    id: string;
    name: string;
    givenName?: string;
    familyName?: string;
    email: string;
    photo?: string | null | undefined;
  }
  
  export interface User {
    id: number;
    g_id: string;
    username: string;
    email: string;
    profile_pic: string | null;
  }
  
  export type NewUser = Omit<User, "id">;
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
    AddWorkout: { day: string; workoutPlanName: string };
    WorkoutDay: { day: string; workout: string };
    EditWorkout: { day: string };
    Explore: undefined;
    ExerciseDetail: { exercise: Exercise };
    Profile: undefined;
    Onboarding: undefined;
  };
