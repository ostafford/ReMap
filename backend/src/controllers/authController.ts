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
    try {
        const { email, password } = req.body;

        const { data, error } = await supabase.auth
        .signUp({
            email, password
        });

        if (error) {
            console.log("Sign up failed:", error.message);
            res.status(400).json({"Sign up failed": error.message});
            return;
        }
        console.log("Signed up successful:", data);
        res.status(201).json(data);

    } catch (err: any) {
        console.log("Signed up server error:", err.message);        
        res.status(500).json({ "Sign up server error":err.message });
    }
}


// @desc Sign in user
// @route POST /api/auths/signIn
export const signIn = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        
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
        res.status(201).json(data);

    } catch (err: any) {
        console.log("Signed in server error:", err.message);
        res.status(500).json({ msg: "Sign in server error", error: err.message });
    }
}

// @desc Log out user
// @route POST /api/auths/signOut
export const logOut = async (req: Request, res: Response) => {
    const { error } = await supabase.auth.signOut();

    try {
        if (error) {
            res.status(400).json({msg: error.message});
            return;
        }
        console.log("User logged out");
        res.status(201).json({msg: "User logged out"});

    } catch (err: any) {
        console.log("Sign out server error:", err.message);
        res.status(500).json({ msg: "Sign out server error", error: err.message });
    }
}

// @desc Update email
// @route PUT /api/auths/email/:id
// export const updateEmail = async (req: Request, res: Response) => {
//     const id = req.params.id;
    
//     try {
//         const { data: user, error } = await supabase.auth.admin.updateUserById(id,
//         { email: req.body.email }
//         );
        
//         if (error) {
//             res.status(404).json({msg: error.message});
//             return;
//         }
//         console.log("email updated");
//         res.status(201).json(user);
//     } catch (err: any) {
//         res.status(500).json({ msg: "update email error", error: err.message });        
//     }
// }

// @desc Update password
// @route PUT /api/auths/password/:id
// export const updatePassword = async (req: Request, res: Response) => {
//     const id = req.params.id;

//     try {
//         const { data: user, error } = await supabase.auth.admin.updateUserById(id,
//         { password: req.body.password }
//         );
        
//         if (error) {
//             res.status(404).json({msg: error.message});
//             return;
//         }
//         console.log("password updated");
//         res.status(201).json(user);
//     } catch (err: any) {
//         res.status(500).json({ msg: "update password error", error: err.message });        
//     }
// }

// Delete account
// @route DELETE /api/auths/users/:id
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
