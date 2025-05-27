import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// docs https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native
// make sure these are defined in a .env in root of frontend folder
// see .env.example
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(
    supabaseUrl ?? "",
    supabaseAnonKey ?? "",
    {
        auth: {
            storage: AsyncStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
        },
    }
);