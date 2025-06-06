// Pins routes
import { Router, Request, Response } from "express";

import multer from "multer";

import supabase from "../supabase/supabaseClient";

const router = Router();

// temporarily saves incoming files in buffer
const upload = multer({ storage: multer.memoryStorage() });

// Create pins
router.post("/",
    upload.fields([
        { name: "image" },
        { name: "audio", }
    ]),
    async (req: Request, res: Response) => {
        const imageFile = (req.files as any)?.image?.[0];
        const audioFile = (req.files as any)?.audio?.[0];

        let imageUrl: string | undefined = undefined;
        let audioUrl: string | undefined = undefined;

        try {
            // First, upload file to Supabase storage
            if (imageFile) {
                const { buffer, mimetype } = imageFile;

                // TODO: name this properly, should probably name this using a combination of user name and timestamp (so it"s unique)
                const imageName = "test";

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
                    // TO DO: wrap this whole thing in a try catch and handle errors properly
                    console.log(`Error uploading file: ${error.message}`);
                    res.status(400).json({ error: error.message});
                }

                const { data: { publicUrl } } = supabase.storage.from("images").getPublicUrl(imageName);

                imageUrl = publicUrl;
            }

            if (audioFile) {
                const { buffer, mimetype } = audioFile;

                // TODO: name this properly, should probably name this using a combination of user name and timestamp (so it"s unique)
                const audioName = "test";

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
                    // TO DO: wrap this whole thing in a try catch and handle errors properly
                    throw new Error(`Error uploading file: ${error.message}`);
                }

                const { data: { publicUrl } } = supabase.storage.from("audio").getPublicUrl(audioName);

                audioUrl = publicUrl;
            }

            // TODO: add owner_id
            // TODO: validate req body

            const { data, error } = await supabase
            .from("pins")
            .insert({
                description: req.body.description,
                latitude: req.body.latitude,
                longitude: req.body.longitude,
                audio_url: audioUrl,
                image_urls: [imageUrl],
            })
            .select();
        } catch (err: any) {
        res.status(500).json({ msg: "Update profile error", error: err.message });
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
