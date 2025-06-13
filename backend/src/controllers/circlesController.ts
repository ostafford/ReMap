// Circles logic
import { Request, Response } from "express";

import supabase from "../supabase/supabaseClient";
import { checkExists, checkMember } from "../middleware/userGroupCheck";


/* --------------------------------- Circle Table ----------------------------------------- */
// @desc Create circle
// @route POST /api/circles/
export const createCircle = async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    try {
        const { name, access_code, visibility } = req.body;

        const { data, error } = await supabase
        .from("circles")
        .insert({
            name,
            access_code,
            owner_id: user.id,
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
    const user = req.user;

    if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    try {
        // Many-to-many joins
        const { data, error } = await supabase
        .from("circles")
        .select(`id,
            name,
            profiles (id, username)`
        )
        .eq("user_id", user.id);

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

    const user = req.user;

    if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    try {
        const { data, error } = await supabase
        .from("circles")
        .select()
        .eq("id", circle_id)
        .eq(`profiles (id)`, user.id)
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

    const user = req.user;

    if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const { name, visibility } = req.body;

    try {
        const { data, error } = await supabase
        .from("circles")
        .update({
            name,
            visibility
        })
        .eq('id', circle_id)
        .eq("owner_id", user.id)
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

    const user = req.user;

    if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    try {
        const { error } = await supabase
        .from("circles")
        .delete()
        .eq("id", circle_id)
        .eq("owner_id", user.id);

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


/* --------------------------------- Member Table ----------------------------------------- */
// @desc Add members to circle
// @route POST /api/circles/members
export const addMember = async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const { user_id, circle_id } = req.body;

    try {
        // Check if user exists
        const { error: userError } = await checkExists("profiles", user_id);
        if (userError) {
            console.log("User not found:", userError);
            res.status(400).json({ "User not found": userError });
            return;
        }

        // Check if circle exists
        const { error: circleError } = await checkExists("circles", circle_id);
        if (circleError) {
            console.log("Circle not found:", circleError);
            res.status(400).json({ "Circle not found": circleError });
            return;
        }

        // Check if the user is already a member of the circle
        const { error: memberError } = await checkMember(user_id, circle_id);
        if (memberError) {
            console.log("User already a member:", memberError);
            res.status(400).json({ "User already a member": memberError });
            return;
        }

        //Add user to member table
        const { data, error } = await supabase
        .from("members")
        .insert({
            user_id,
            circle_id
        })
        .select();

        if (error) {
            console.log("Add member error:", error.message);
            res.status(400).json({"Add member error": error.message});
            return;
        }
        console.log(`Added ${user_id} to ${circle_id}`);
        res.status(201).json({ "Added member": data });

    } catch (err: any) {
        console.log("Add member to circle server error:", err.message);
        res.status(500).json({ "Add member to circle server error": err.message });
    }
}
