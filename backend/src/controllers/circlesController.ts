// Circles logic
import { Request, Response } from "express";

import supabase from "../supabase/supabaseClient";


// @desc Create circle
// @route POST /api/circles/:id
export const createCircle = async (req: Request, res: Response) => {
    const { name, owner_id, visibility } = req.body;

    try {
        const { data, error } = await supabase
        .from("circles")
        .insert({
            name,
            owner_id,
            visibility
        })
        .select();

        if (error) {
            console.log("Create circle error:", error.message);
            res.status(400).json({ "Create circle error": error.message });
            return;
        }
        console.log("Created circle:", data);
        res.status(201).json({ "Created circle": data });

    } catch (err: any) {
        console.log("Create circle server error:", err.message);
        res.status(500).json({ "Create circle server error": err.message });
    }
}

// @desc List circles
// @route GET /api/circles/
export const listCircles = async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
        .from("circles")
        .select();

        if (error) {
            console.log("List circles error:", error.message);
            res.status(400).json({ "List circles error": error.message });
            return;
        }
        console.log("List of circles:", data);
        res.status(200).json({ "List of circles": data });

    } catch (err: any) {
        console.log("List circles server error:", err.message);
        res.status(500).json({ "List circles server error": err.message });
    }
}


// @desc Get single circle
// @route GET /api/circles/:circleId
export const getCircle = async (req: Request, res: Response) => {
    const circle_id = req.params.circleId;

    try {
        const { data, error } = await supabase
        .from("circles")
        .select()
        .eq("id", circle_id)
        .single();

        if (error) {
            console.log("Get single circle error:", error.message);
            res.status(400).json({ "Get single circle error": error.message });
            return;
        }
        console.log("Circle:", data);
        res.status(200).json({ "Circle": data });

    } catch (err: any) {
        console.log("Get single circle server error:", err.message);
        res.status(500).json({ "Get single circle server error": err.message });
    }
}


// @desc Update circle
// @route PUT /api/circles/:circleId
export const updateCircle = async (req: Request, res: Response) => {
    const circle_id = req.params.circleId;

    const { name, owner_id, visibility } = req.body;

    try {
        const { data, error } = await supabase
        .from("circles")
        .update({
            name,
            owner_id,
            visibility
        })
        .eq('id', circle_id)
        .select();

        if (error) {
            console.log("Update circle error:", error.message);
            res.status(400).json({ "Update circle error": error.message });
            return;
        }
        console.log("Updated circle:", data);
        res.status(200).json({ "Updated circle": data });

    } catch (err: any) {
        console.log("Update circle server error:", err.message);
        res.status(500).json({ "Update circle server error": err.message});
    }
}


// @desc Delete circle
// @route DELETE /api/circles/:circleId
export const deleteCircle = async (req: Request, res: Response) => {
    const circle_id = req.params.circleId;

    try {
        const { error } = await supabase
        .from("circles")
        .delete()
        .eq("id", circle_id);

        if (error) {
            console.log("Delete circle error:", error.message);
            res.status(400).json({ "Delete circle error": error.message });
            return;
        }
        console.log(`Circle: ${circle_id} deleted`);
        res.status(200).json(`Circle: ${circle_id} deleted`);

    } catch (err: any) {
        console.log("Delete circle server error:", err.message);
        res.status(500).json({ "Delete circle server error": err.message });
    }
}
