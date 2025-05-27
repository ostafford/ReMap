import { supabase } from "@/lib/supabase";

export async function signUp(
    credentials : {
        email: string;
        password: string;
    }
) {
    const { data, error } = await supabase.auth.signUp(credentials);

    if (error) {
        throw new Error(`Error signing up: ${error.message}`);
    }

    return data;
}

export async function signIn(
    credentials : {
        email: string;
        password: string;
    }
) {
    const { data, error } = await supabase.auth.signInWithPassword(credentials);

        if (error) {
        throw new Error(`Error signing in: ${error.message}`);
    }

    return data;
}