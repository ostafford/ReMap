// Photo and Audio logic
import supabase from "../supabase/supabaseClient";

import { Request, Response } from "express";

import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

// @desc Update single profile
// @route PUT /api/profiles/:id
export const profileAvatar = [upload.single("avatar"), async (req: Request, res: Response) => {
    const id = req.params.id;

    const file = req.file as any;

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

        console.log("file buffer after:", file.buffer);

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
            avatar_url: avatarUrl
        })
        .eq("id", id)
        .select();

        if (profileError) {
            console.log("Profile avatar error:", profileError.message);
            res.status(404).json({ error: profileError.message });
            return;
        }
        console.log("Profile avatar updated:", profileData);
        res.status(200).json(profileData);
    } catch (err: any) {
        console.log("Update profile avatar error:", err.message);
        res.status(500).json({ msg: "Update profile avatar error:", error: err.message });
    }
}]
