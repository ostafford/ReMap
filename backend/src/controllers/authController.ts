// Authorisation logic
import supabase from "../supabase/supabaseClient";

import { Request, Response } from "express";


// @desc Get all users
// @route GET /api/auths/users
export const listUsers = async (req: Request, res: Response) => {
    try {
        const { data: { users }, error } = await supabase.auth.admin.listUsers();
        
        if (error) {
            res.status(404).json({msg: error.message});
            return;
        }
        console.log("List all users successful:", users);
        res.status(200).json(users);

    } catch (err: any) {
        console.log("List all users server error:", err.message);
        res.status(500).json({ "List all users server error": err.message });
    }
}


// @desc Retrieve an user
// @route GET /api/auths/users/:id
export const getUser = async (req: Request, res: Response) => {
    const id = req.params.id;
    try {
        const { data, error } = await supabase.auth.admin.getUserById(id);
        
        if (error) {
            console.log("Retrieve an user:", error.message);
            res.status(404).json({"Retrieve an user": error.message});
            return;
        }
        console.log("Retrieve an user successful", data.user);
        res.status(200).json(data.user);

    } catch (err: any) {
        console.log("Retrieve an user server error:", err.message);
        res.status(500).json({ "Retrieve an user server error": err.message });
    }
}


// @desc Sign up new user
// @route POST /api/auths/signUp
export const signUp = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    
    const { data, error } = await supabase.auth.getSession();

    try {
        if (data.session?.user.email === email) {
            console.log("Email already registered:", error?.message);
            res.status(400).json({ "Email registered": error?.message });
            return;
        }
        console.log("New email:", email);

    } catch (err: any) {
        console.log("User session server error:", err.message);
        res.status(500).json({ "User session server error": err.message });
    }

    try {
        const { data, error } = await supabase.auth
        .signUp({
            email, password
        });

        if (error) {
            console.log("Sign up failed:", error.message);
            res.status(400).json({"Sign up failed": error.message});
            return;
        }
        console.log("Signed up successful:", data.user?.id);
        res.status(201).json(data.user?.id);

    } catch (err: any) {
        console.log("Signed up server error:", err.message);        
        res.status(500).json({ "Sign up server error":err.message });
    }
}


// @desc Sign in user
// @route POST /api/auths/signIn
export const signIn = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    
    const { data, error } = await supabase.auth.getSession();

    try {
        if (data) {
            console.log("User already logged in. Log out for new user:", error?.message);
            res.status(400).json({ "User already logged in. Log out for new user": error?.message });
            return;
        }
        console.log("New user:", data);

    } catch (err: any) {
        console.log("User session server error:", err.message);
        res.status(500).json({ "User session server error": err.message });
    }

    try {        
        const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        });

        if (error) {
            console.log("Sign in failed:", error.message);
            res.status(400).json({"Sign in failed": error.message});
            return;
        }
        console.log("signed in successful:", data.user.confirmed_at);
        res.status(200).json(data);

    } catch (err: any) {
        console.log("Signed in server error:", err.message);
        res.status(500).json({ msg: "Sign in server error", error: err.message });
    }
}


// @desc Sign out user
// @route POST /api/auths/signOut
export const logOut = async (req: Request, res: Response) => {
    const { error } = await supabase.auth.signOut();

    try {
        if (error) {
            console.log("User sign out error:", error.message);
            res.status(400).json({"User sign out error": error.message});
            return;
        }
        console.log("User signed out");
        res.status(200).json({msg: "User signed out"});

    } catch (err: any) {
        console.log("Sign out server error:", err.message);
        res.status(500).json({ msg: "Sign out server error", error: err.message });
    }
}


// @desc Update email
// @route PUT /api/auths/email/:id
export const updateEmail = async (req: Request, res: Response) => {    
    try {
        const { data, error } = await supabase.auth.updateUser({
        email: req.body.email
        });
        
        if (error) {
            console.log("Email could not update error:", error.message);
            res.status(404).json({"Email could not update error": error.message});
            return;
        }
        console.log("Email updated:", data);
        res.status(201).json({"Email updated": data});
    } catch (err: any) {
        console.log("Update email server error:", err.message);
        res.status(500).json({ "Update email server error": err.message });        
    }
}


// @desc Update password
// @route PUT /api/auths/password/
export const updatePassword = async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase.auth.updateUser({
        password: req.body.password
        });
        
        if (error) {
            console.log("Password could not update error:", error.message);
            res.status(404).json({"Password could not update error": error.message});
            return;
        }
        console.log("Password updated:", data.user.confirmed_at);
        res.status(201).json(data.user.confirmed_at);
    } catch (err: any) {
        console.log("Password update server error:", err.message);
        res.status(500).json({ "Password update server error": err.message });        
    }
}


// Delete account
// @route DELETE /api/auths/users/
export const deleteUser = async (req: Request, res: Response) => {
    const id = req.params.id;
    const { data, error } = await supabase.auth.admin.deleteUser(id);

    try {
        if (error) {
            console.log("Delete user error:", error.message);
            res.status(404).json({"Delete user error": error.message});
            return;
        }
        console.log("Deleted user");
        res.status(200).json(data);

    } catch (err: any) {
        console.log("Delete user server error:", err.message);
        res.status(500).json({ "Delete user server error":err.message });
    }
}
