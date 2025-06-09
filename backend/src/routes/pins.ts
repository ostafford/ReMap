// Pins routes
import { Router, Request, Response } from "express";

import multer from "multer";

import supabase from "../supabase/supabaseClient";

import formatLocalTime from "../modules/time";

const router = Router();

// temporarily saves incoming files in buffer
const upload = multer({ storage: multer.memoryStorage() });

// Create pins
router.post("/:id",
    upload.fields([
        { name: "image" },
        { name: "audio" }
    ]),
    async (req: Request, res: Response) => {
        const id = req.params.id;

        const imageFile = (req.files as any)?.image?.[0];
        const audioFile = (req.files as any)?.audio?.[0];

        let imageUrl: string | undefined = undefined;
        let audioUrl: string | undefined = undefined;

        let user_name: string | null;

        // Get user name and id
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
        let user_id = data.id;


        try {
            // First, upload file to Supabase storage
            if (imageFile) {
                // Check if the file is an image (starts with "image/")
                if (!imageFile.mimetype.startsWith("image/")) {
                    console.log("Invalid file type. Only images are allowed");
                    res.status(400).json({ msg: "Invalid file type. Only images are allowed" });
                    return;
                }

                const { buffer, mimetype } = imageFile;

                // image name - user name : dd/mm/yyyy hh:mm:ss
                const imageName = `${user_name}:${formatLocalTime()}`;

                const { error } = await supabase.storage
                .from("images")
                .upload(
                    imageName,
                    buffer,
                    {
                        contentType: mimetype,
                        upsert: false // prevent overwriting
                    }
                );

                if (error) {
                    console.log(`Error uploading image file: ${error.message}`);
                    res.status(404).json({ error: error.message});
                }

                const { data: { publicUrl } } = supabase.storage.from("images").getPublicUrl(imageName);

                imageUrl = publicUrl;
            }
        } catch (err: any) {
            console.log("Update image server error", err.message);
            res.status(500).json({ "Update image server error": err.message });
        }

        try {
            if (audioFile) {
                // Check if the file is an image (starts with "audio/")
                if (!audioFile.mimetype.startsWith("audio/")) {
                    console.log("Invalid file type. Only audios are allowed");
                    res.status(400).json({ msg: "Invalid file type. Only audios are allowed" });
                    return;
                }

                const { buffer, mimetype } = audioFile;

                // audio name - user name : dd/mm/yyyy hh:mm:ss
                const audioName = `${user_name}:${formatLocalTime()}`;

                const { error } = await supabase.storage
                .from("audio")
                .upload(
                    audioName,
                    buffer,
                    {
                        contentType: mimetype,
                        upsert: false // prevent overwriting
                    }
                );

                if (error) {
                    console.log(`Error uploading audio file: ${error.message}`);
                    res.status(404).json({ error: error.message});
                }

                const { data: { publicUrl } } = supabase.storage.from("audio").getPublicUrl(audioName);

                audioUrl = publicUrl;
            }
        } catch (err: any) {
            console.log("Upload audio server error", err.message);
            res.status(500).json({ msg: "Upload audio server error", error: err.message });
        }

            // TODO: add owner_id
            // TODO: validate req body
        try {
            const { data, error } = await supabase
            .from("pins")
            .insert({
                name: req.body.name,
                description: req.body.description,
                latitude: req.body.latitude,
                longitude: req.body.longitude,
                image_urls: [imageUrl],
                audio_url: audioUrl,
                owner_id: user_id
            })
            .select();

            if (error) {
                console.log("Create pin error:", error.message);
                res.status(404).json({"Create pin error": error.message});
                return;
            }
            console.log("Create Pin:", data);
            res.status(201).json({"Create Pin:": data});

        } catch (err: any) {
            console.log("Create pin server error", err.message);
            res.status(500).json({ "Create pin server error": err.message });
        }
    }
)

// Get all pins
router.get("/", async (req: Request, res: Response) => {
    try {
    const { data, error } = await supabase
    .from("pins")
    .select();

    if (error) {
        res.status(404).json({msg: error.message});
        return;
    }
    console.log("List of pins", data);
    res.status(200).json(data);
    } catch (err: any) {
        res.status(500).json({ msg: "Get all pins error", error: err.message });
    }
})

// Get single pin
router.get("/:pinId", async (req: Request, res: Response) => {
    const pin_id = req.params.pinId;

    try {
        const { data, error } = await supabase
        .from("pins")
        .select()
        .eq("id", pin_id)
        .single();

        if (error) {
            res.status(404).json({msg: error.message});
            return;
        }
        console.log("Get pin:", data);
        res.status(200).json(data);
    } catch (err: any) {
        res.status(500).json({ msg: "Get pin error", error: err.message });
    }
})

// Update pins
router.put("/:pinId", async (req: Request, res: Response) => {
    const pin_id = req.params.pinId;
    const {
        description,
        latitude,
        longitude,
        audio_url,
        image_urls
    } = req.body;

    try {
        const { data, error } = await supabase
        .from("pins")
        .update({
            description,
            latitude,
            longitude,
            audio_url,
            image_urls
        })
        .eq("id", pin_id)
        .select();

        if (error) {
            res.status(404).json({msg: error.message});
            return;
        }
        console.log("Pin updated:", data);
        res.status(201).json(data);
    } catch (err: any) {
        res.status(500).json({ msg: "Update pin error", error: err.message });
    }
})

// Delete pins
router.delete("/:pinId", async (req: Request, res: Response) => {
    const pin_id = req.params.pinId;

    try {
        const { data, error } = await supabase
        .from("pins")
        .delete()
        .eq("id", pin_id)
        .select()

        if (error) {
            res.status(404).json({msg: error.message});
        }
        console.log("Pin deleted", data);
        res.status(200).json(data);
    } catch (err: any) {
        res.status(500).json({ msg: "Delete pin error", error: err.message });
    }
})

export default router;
