// Photo and Audio logic
import supabase from "../supabase/supabaseClient";

import { Request, Response } from "express";

import multer from "multer";

import formatLocalTime from "../modules/time";

const upload = multer({ storage: multer.memoryStorage() });


// @desc Update single profile picture
// @route PUT /api/media/avatar/:id
export const profileAvatar = [upload.single("avatar"), async (req: Request, res: Response) => {
    const id = req.params.id;

    const file = req.file as any;

    let avatarUrl: string | undefined = undefined;
    let user_name: string | null;

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
    user_name = data.username;


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
        // Update profile with image
        const { data, error } = await supabase
        .from("profiles")
        .update({
            avatar_url: avatarUrl
        })
        .eq("id", id)
        .select();

        if (error) {
            console.log("Profile avatar error:", error.message);
            res.status(404).json({ error: error.message });
            return;
        }
        console.log("Profile avatar updated:", data);
        res.status(200).json(data);

    } catch (err: any) {
    console.log("Update profile avatar error:", err.message);
    res.status(500).json({ msg: "Update profile avatar error:", error: err.message });
    }
}]
