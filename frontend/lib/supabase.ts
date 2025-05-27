import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';


// docs https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native
// make sure these are defined in a .env in root of frontend folder
// see .env.example
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(
    supabaseUrl ?? "https://wlntadopalsjqcwsevjr.supabase.co",
    supabaseAnonKey ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsbnRhZG9wYWxzanFjd3NldmpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxODU3OTMsImV4cCI6MjA2Mjc2MTc5M30.Wm3Vgz59n6Qr_WYqQ-qrRRwW1OmChiHlx1RVLxRrLT8",
    {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});