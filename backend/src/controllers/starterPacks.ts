// Starter packs logic
import { Request, Response } from "express";

import supabase from "../supabase/supabaseClient";


// @desc List Starter packs
// @route GET /api/packs/
export const listStarterPacks = async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
        .from("StarterPacks")
        .select();

        if (error) {
            console.log("List starter packs error:", error.message);
            res.status(400).json({ "List starter packs error": error.message });
            return;
        }
        console.log("Starter packs:", data);
        res.status(400).json({ "Starter packs": data });

    } catch (err: any) {
        console.log("List starter packs error", err.message);
        res.status(500).json({ "List starter packs": err.message });
    }
}

// @desc Get single starter pack
// @route GET /api/packs/:spId
export const getStarterPacks = async (req: Request, res: Response) => {
    const starter_id = req.params.spId;

    try {
        const { data, error } = await supabase
        .from("StarterPacks")
        .select()
        .eq("id", starter_id)
        .single();

        if (error) {
            console.log("Get starter pack error:", error.message);
            res.status(400).json({ "Get starter pack error": error.message });
            return;
        }
        console.log("Starter pack:", data);
        res.status(400).json({ "Starter pack": data });

    } catch (err: any) {
        console.log("Get starter pack server error", err.message);
        res.status(500).json({ "Get starter pack server error": err.message });
    }
}
