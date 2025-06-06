//Profile logic
import supabase from "../supabase/supabaseClient";

import { Request, Response } from "express";

import multer from "multer";

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

const upload = multer({ storage: multer.memoryStorage() });

// @desc Update single profile
// @route PUT /api/profiles/:id
export const updateProfile = [upload.single("avatar"), async (req: Request, res: Response) => {
    const id = req.params.id;
    const { username, full_name } = req.body;

    const file = req.file as Express.Multer.File;

    // Check if a file was uploaded
    if (!file) {
        console.log("No image file uploaded");
        res.status(400).json({ msg: "No image file uploaded" });
        return;
    }

    // Check if the file is an image (starts with "image/")
    if (!file.mimetype.startsWith("image/")) {
        console.log("Invalid file type. Only images are allowed");
        res.status(400).json({ msg: "Invalid file type. Only images are allowed" });
        return;
    }

    let avatarUrl: string | undefined = undefined;

    try {
        // file name
        const fileName = `profile-${Date.now()}`;

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

        const publicUrl = supabase
        .storage
        .from("avatars")
        .getPublicUrl(fileName);

        avatarUrl = publicUrl.data.publicUrl;

        console.log("Photo uploaded successful:", data);

        const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .update({
            username,
            full_name,
            avatar_url: avatarUrl
        })
        .eq("id", id)
        .select();

        if (profileError) {
            console.log("Profile update error:", profileError.message);
            res.status(404).json({ error: profileError.message });
            return;
        }
        console.log("Profile updated:", profileData);
        res.status(200).json(profileData);
    } catch (err: any) {
        console.log("Update profile error", err.message);
        res.status(500).json({ msg: "Update profile error", error: err.message });
    }
}]
