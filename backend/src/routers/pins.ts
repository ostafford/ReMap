// Pins routes
import { Router, type Request, type Response } from 'express';

import multer from 'multer';

import supabase from '../supabaseClient';

const router = Router();

// temporarily saves incoming files in buffer
const upload = multer({ storage: multer.memoryStorage() });


// Get all pins
router.get('/', async (req, res) => {
    const { data, error } = await supabase
    .from("pins")
    .select();

    if (error) {
        res.status(400).json({msg: error.message});
        return;
    }

    res.status(200).json(data);
})

// Get single pin
router.get('/:id', async (req: Request, res: Response) => {
    const id = req.params.id;

    const { data, error } = await supabase
    .from('pins')
    .select()
    .eq('id', id)
    .single();

    if (error) {
        res.status(400).json({msg: error.message});
        return;
    }

    res.status(200).send(data);
})

// Create pins
router.post(
    '/',
    upload.fields([
        { name: 'image' },
        { name: 'audio', }
    ]),
    async (req, res) => {
        const imageFile = (req.files as any)?.image?.[0];
        const audioFile = (req.files as any)?.audio?.[0];

        let imageUrl: string | undefined = undefined;
        let audioUrl: string | undefined = undefined;

        // First, upload file to Supabase storage
        if (imageFile) {
            const { buffer, mimetype } = imageFile;

            // TODO: name this properly, should probably name this using a combination of user name and timestamp (so it's unique)
            const imageName = "test";

            const { error } = await supabase.storage
            .from('images')
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
                throw new Error(`Error uploading file: ${error.message}`);
            }

            const { data: { publicUrl } } = supabase.storage.from("images").getPublicUrl(imageName);

            imageUrl = publicUrl;
        }

        if (audioFile) {
            const { buffer, mimetype } = audioFile;

            // TODO: name this properly, should probably name this using a combination of user name and timestamp (so it's unique)
            const audioName = "test";

            const { error } = await supabase.storage
            .from('audio')
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
        .from('pins')
        .insert({
            description: req.body.description,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            audio_url: audioUrl,
            image_urls: [imageUrl],
        })
        .select();
    }
)

// Update pins

// Delete pins

export default router;
