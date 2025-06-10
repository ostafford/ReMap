// Pins logic
import { Request, Response } from "express";

import multer from "multer";

import supabase from "../supabase/supabaseClient";

import formatLocalTime from "../modules/time";


// @desc Create pin
// @route POST /api/pins/:id

// temporarily saves incoming files in buffer
const upload = multer({ storage: multer.memoryStorage() });

export const createPin = [upload.fields([
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
                    res.status(400).json({ error: error.message});
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
                    res.status(400).json({ error: error.message});
                }

                const { data: { publicUrl } } = supabase.storage.from("audio").getPublicUrl(audioName);

                audioUrl = publicUrl;
            }
        } catch (err: any) {
            console.log("Upload audio server error", err.message);
            res.status(500).json({ msg: "Upload audio server error", error: err.message });
        }

        const { name, description, latitude, longitude } = req.body;

        // Checks latitude and longitude is number
        const numberRegex = /^-?\d+(\.\d+)?$/;
        if (!numberRegex.test(latitude)) {
            console.log("Latitude must be a number");
            res.status(400).json("Latitude must be a number");
            return;
        }

        if (!numberRegex.test(longitude)) {
            console.log("Longitude must be a number");
            res.status(400).json("Longitude must be a number");
            return;
        }

        // Checks latitude is within range
        const lat = parseFloat(latitude);
        if (isNaN(lat)) {
            console.log("Latitude must be a valid number");
            res.status(400).json("Latitude must be a valid number");
            return;
        }
        if (lat < -90 || lat > 90) {
            console.log("Latitude must be between -90 and 90");
            res.status(400).json("Latitude must be between -90 and 90");
            return;
        }

        // Checks longitude is within range
        const lon = parseFloat(longitude);
        if (isNaN(lon)) {
            console.log("Longitude must be a valid number");
            res.status(400).json("Longitude must be a valid number");
            return;
        }
        if (lon < -180 || lon > 180) {
            console.log("Longitude must be between -180 and 180");
            res.status(400).json("Longitude must be between -180 and 180");
            return;
        }

        try {
            const { data, error } = await supabase
            .from("pins")
            .insert({
                name,
                description,
                latitude,
                longitude,
                image_urls: [imageUrl],
                audio_url: audioUrl,
                owner_id: user_id
            })
            .select();

            if (error) {
                console.log("Create pin error:", error.message);
                res.status(400).json({"Create pin error": error.message});
                return;
            }
            console.log("Created Pin:", data);
            res.status(201).json({"Created Pin:": data});

        } catch (err: any) {
            console.log("Create pin server error", err.message);
            res.status(500).json({ "Create pin server error": err.message });
        }
}]


// @desc Get all pins
// @route GET /api/pins/
export const listPins = async (req: Request, res: Response) => {
    let current_userId: any | undefined = undefined;

    try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            console.log("User session error:", error.message);
            res.status(400).json({ "User session error": error.message });
            return;
        }
        console.log("User session:", data.session?.user.id);
        current_userId = data.session?.user.id;

    } catch (err: any) {
        console.log("User session server error:", err.message);
        res.status(500).json({ "User session server error": err.message });            
    }

    try {
        const { data: pins, error } = await supabase
        .from("pins")
        .select()
        .eq("owner_id", current_userId); // check current user id is owner_id

        if (error) {
            console.log("List pins error:", error.message);
            res.status(400).json({ "List pins error": error.message });
            return;
        }
        console.log("List pins:", pins);
        res.status(200).json({ "List pins": pins });

    } catch (err: any) {
        console.log("List pins server error", err.message);
        res.status(500).json({ "List pins server error": err.message });
    }
}


// @desc Get single pin
// @route GET /api/pins/:pinId
export const getPin = async (req: Request, res: Response) => {
    const pin_Id = req.params.pinId;

    let current_userId: any | undefined = undefined;

    try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            console.log("User session error:", error.message);
            res.status(400).json({ "User session error": error.message });
            return;
        }
        console.log("User session:", data.session?.user.id);
        current_userId = data.session?.user.id;

    } catch (err: any) {
        console.log("User session server error:", err.message);
        res.status(500).json({ "User session server error": err.message });            
    }

    try {
        const { data: pins, error } = await supabase
        .from("pins")
        .select()
        .eq("id", pin_Id)
        .eq("owner_id", current_userId) // check current user id is owner_id
        .single();

        if (error) {
            console.log("Get single pin error:", error.message);
            res.status(400).json({ "Get single pin error": error.message });
            return;
        }
        console.log("Pin:", pins);
        res.status(200).json({ "Pin": pins });

    } catch (err: any) {
        console.log("Get single pin server error", err.message);
        res.status(500).json({ "Get single pin server error": err.message });
    }
}


// @desc Update single pin
// @route PUT /api/pins/:pinId
export const updatePin = [upload.fields([
        { name: "image" },
        { name: "audio" }
    ]),
    async (req: Request, res: Response) => {
        const id = req.params.id;

        let current_userId: any | undefined = undefined;

        try {
            const { data, error } = await supabase.auth.getSession();

            if (error) {
                console.log("User session error:", error.message);
                res.status(400).json({ "User session error": error.message });
                return;
            }
            console.log("User session:", data.session?.user.id);
            current_userId = data.session?.user.id;

        } catch (err: any) {
            console.log("User session server error:", err.message);
            res.status(500).json({ "User session server error": err.message });            
        }
        
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
        .eq("owner_id", current_userId) // check current user id is owner_id
        .single();

        if (error) {
            console.log("Can not get user details:", error.message);
            res.status(400).json({ "Can not get user details:": error.message });
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
                    res.status(400).json({ error: error.message});
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
                    res.status(400).json({ error: error.message});
                }

                const { data: { publicUrl } } = supabase.storage.from("audio").getPublicUrl(audioName);

                audioUrl = publicUrl;
            }
        } catch (err: any) {
            console.log("Upload audio server error", err.message);
            res.status(500).json({ msg: "Upload audio server error", error: err.message });
        }

        const { name, description, latitude, longitude } = req.body;

        // Checks latitude and longitude is number
        const numberRegex = /^-?\d+(\.\d+)?$/;
        if (!numberRegex.test(latitude)) {
            console.log("Latitude must be a number");
            res.status(400).json("Latitude must be a number");
            return;
        }

        if (!numberRegex.test(longitude)) {
            console.log("Longitude must be a number");
            res.status(400).json("Longitude must be a number");
            return;
        }

        // Checks latitude is within range
        const lat = parseFloat(latitude);
        if (isNaN(lat)) {
            console.log("Latitude must be a valid number");
            res.status(400).json("Latitude must be a valid number");
            return;
        }
        if (lat < -90 || lat > 90) {
            console.log("Latitude must be between -90 and 90");
            res.status(400).json("Latitude must be between -90 and 90");
            return;
        }

        // Checks longitude is within range
        const lon = parseFloat(longitude);
        if (isNaN(lon)) {
            console.log("Longitude must be a valid number");
            res.status(400).json("Longitude must be a valid number");
            return;
        }
        if (lon < -180 || lon > 180) {
            console.log("Longitude must be between -180 and 180");
            res.status(400).json("Longitude must be between -180 and 180");
            return;
        }

        try {
            const { data, error } = await supabase
            .from("pins")
            .update({
                name,
                description,
                latitude,
                longitude,
                image_urls: [imageUrl],
                audio_url: audioUrl,
                owner_id: user_id
            })
            .select();

            if (error) {
                console.log("Update pin error:", error.message);
                res.status(400).json({"Update pin error": error.message});
                return;
            }
            console.log("Updated Pin:", data);
            res.status(200).json({"Updated Pin:": data});

        } catch (err: any) {
            console.log("Update pin server error", err.message);
            res.status(500).json({ "Update pin server error": err.message });
        }
}]


// @desc Delete single pin
// @route DELETE /api/pins/:pinId
export const deletePin = async (req: Request, res: Response) => {
    const pin_id = req.params.pinId;

    try {
        const { error } = await supabase
        .from("pins")
        .delete()
        .eq("id", pin_id);

        if (error) {
            console.log(`Delete pin: ${pin_id} error: ${error.message}`);
            res.status(400).json(`Delete pin: ${pin_id} error: ${error.message}`);
            return;
        }
        console.log(`Pin: ${pin_id} deleted`);
        res.status(200).json(`Pin: ${pin_id} deleted`);
        
    } catch (err: any) {
        console.log("Delete pin server error", err.message);
        res.status(500).json({ "Delete pin server error": err.message });
    }
}
