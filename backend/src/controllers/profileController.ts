//Profile logic
import supabase from "../supabase/supabaseClient";

import { Request, Response } from "express";

import multer from "multer";

import formatLocalTime from "../modules/time";


// @desc Get all profiles
// @route GET /api/profiles
export const listProfiles = async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
        .from("profiles")
        .select();

        if (error) {
            console.log("Get all profiles error", error.message);
            res.status(400).json({ error: error.message});
            return;
        }
        console.log("List of profiles:", data);
        res.status(200).json(data);

    } catch (err: any) {
        console.log("Get all profiles error", err.message);
        res.status(500).json({ msg: "Get all profiles error", error: err.message });
    }
}


// @desc Get single profile
// @route GET /api/profiles/:id
export const getProfile = async (req: Request, res: Response) => {
    const id = req.params.id;

    try {
        const { data, error } = await supabase
        .from("profiles")
        .select()
        .eq("id", id)
        .single();

        if (error) {
            console.log("Get single profile error", error.message);
            res.status(400).json({ error: error.message });
            return;
        }
        console.log("Profile:", data);
        res.status(200).json(data);

    } catch (err: any) {
        console.log("Profile error", err.message);
        res.status(500).json({ msg: "Profile error", error: err.message });
    }
}


// @desc Update single profile
// @route PUT /api/profiles/:id
const upload = multer({ storage: multer.memoryStorage() });

export const updateProfile = [upload.single("avatar"), async (req: Request, res: Response) => {
    const id = req.params.id;

    const user = req.user;

    if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    // Check that the user id matches the profile id attempting to be updated
    if (id !== user.id) {
        res.status(401).json({ message: "Unauthorized" })
    }

    const { username, full_name } = req.body;

    const file = req.file as any;

    let avatarUrl: string | undefined;

    // Get user name
    const { data, error } = await supabase
    .from("profiles")
    .select()
    .eq("id", id)
    .single();

    if (error) {
        console.log("Can not get user details:", error.message);
        return;
    }

    console.log("User name:", data.username);

    const user_name = data.username;

    try{
        if (file) {
        // Check if the file is an image (starts with "image/")
        if (!file.mimetype.startsWith("image/")) {
            console.log("Invalid file type. Only images are allowed");
            res.status(400).json({ msg: "Invalid file type. Only images are allowed" });
            return;
        }

        // file name - user name : dd/mm/yyyy hh:mm:ss
        const fileName = `${user_name}:${formatLocalTime()}`;

        // Store image in avatars folder
        const { data, error } = await supabase.storage
        .from("avatars")
        .upload(
            fileName,
            file.buffer,
            {
            contentType: file.mimetype,
            upsert: false,
            }
        );
        if (error) {
            console.log("File upload error:", error.message);
            res.status(400).json({ error: error.message });
            return;
        }
        // Check if file name is correct
        console.log("Image name:", fileName);

        // Get image url
        const publicUrl = supabase
        .storage
        .from("avatars")
        .getPublicUrl(fileName);

        avatarUrl = publicUrl.data.publicUrl;

        console.log("Photo uploaded successful:", data);
        } 
    } catch (err: any) {
        console.log("Update image server error:", err.message);
        res.status(500).json({ "Update image server error": err.message });
    }


    try {
        // Check full name is only letters.
        if (!/^[^\d]+$/.test(full_name)) {
            console.log("Full name must be letters only");
            res.status(400).json("Full name must be letters only");
            return;
        }

        // Update profile
        const { data, error } = await supabase
        .from("profiles")
        .update({
            username,
            full_name,
            avatar_url: avatarUrl
        })
        .eq("id", id)
        .select();

        if (error) {
            console.log("Profile update error:", error.message);
            res.status(404).json({ "Profile update error": error.message });
            return;
        }
        console.log("Profile updated:", data);
        res.status(200).json(data);

    } catch (err: any) {
        console.log("Update profile error:", err.message);
        res.status(500).json({ msg: "Update profile error:", error: err.message });
    }
}]
