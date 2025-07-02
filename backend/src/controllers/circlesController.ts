// Circles logic
import { Request, Response } from "express";

import supabase from "../supabase/supabaseClient";

import { checkMember } from "../middleware/userGroupCheck";


const ACCESS_CODE_LENGTH = 6;

function generateCode() {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    const code: string[] = [];

    for (let i=0; i<ACCESS_CODE_LENGTH; i++) {
        const index = Math.round(Math.random() * (chars.length - 1));
        const char = chars[index];
        code.push(char);
    }

    return code.join("");
}


/* -------------- Circle Table ---------------- */
// @desc Create circle
// @route POST /api/circles/
export const createCircle = async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    try {
        const { name, visibility } = req.body;

        const checkString = ["public", "social", "private"];

        const exists = checkString.includes(visibility);

        if (!exists) {
            console.log("visibility must be set to public, social or private.");
            res.status(400).json("visibility must be set to public, social or private.");
            return;
        }

        const code = generateCode();

        const { data, error } = await supabase
        .from("circles")
        .insert({
            name,
            access_code: code,
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
        const { data, error } = await supabase
        .from("members")
        .select("circle_id, circles(id, name)")
        .eq("user_id", user.id);

        if (error) {
            console.log("List circles error:", error.message);
            res.status(400).json({ "List circles error": error.message });
            return;
        }

        const circles = data.map(entry => entry.circles);
        
        console.log("User's Circles:", data);
        res.status(200).json( circles );

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
        // Fetch circle details and member user_ids
        const { data, error } = await supabase
        .from("circles")
        .select(`id, name, members (user_id)`)
        .eq("id", circle_id);

        if (error) {
            console.log("Get single circle error:", error.message);
            res.status(400).json({ "Get single circle error": error.message });
            return;
        }

        // Check circle exists
        if (!data || data.length === 0) {
            res.status(404).json("Circle not found.");
            return;
        }

        // Get user_ids of the members of the circle
        // creates a new array
        const memberIds = data[0].members.map(( member: any ) => member.user_id);

        // Fetch the usernames of all members from profiles
        const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", memberIds);

        if (profileError) {
            console.log("(Circle) Get profiles error:", profileError.message);
            res.status(400).json({ "(Circle) Get profiles error": profileError.message });
            return;
        }

        // Get member username from profiles - creates a new array 
        const memberNames = profiles.map(( profile: any ) => profile.username);

        // Print new result
        console.log({ "Circle": {
            id: data[0].id,
            name: data[0].name,
            members: memberNames
        }});
        res.status(200).json({
            id: data[0].id,
            name: data[0].name,
            members: memberNames
        });

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

    const checkString = ["public", "social", "private"];

    const exists = checkString.includes(visibility);

    if (!exists) {
        console.log("visibility must be set to public, social or private.");
        res.status(400).json("visibility must be set to public, social or private.");
        return;
    }

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


/* -------------- Member Table ---------------- */
// @desc Add members to circle
// @route POST /api/circles/members
export const addMember = async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const { user_id, circle_id, access_code } = req.body;

    try {
        // Check if user exists
        const { error: userError } = await supabase
        .from("profiles")
        .select()
        .eq("id", user.id)
        .single();

        if (userError) {
            console.log("User not found:", userError.message);
            res.status(400).json({ "User not found": userError.message });
        }

        // Check if circle exists
        const { data: circleData, error: circleError } = await supabase
        .from("circles")
        .select("id, access_code")
        .eq("id", circle_id)
        .single();
        
        if (circleError) {
            console.log("Circle not found:", circleError);
            res.status(400).json({ "Circle not found": circleError });
            return;
        }

        if (circleData.access_code !== access_code) {
            console.log("Access code does not match.");
            res.status(400).json({ message: "Access code does not match" });
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
        res.status(201).json({ data });

    } catch (err: any) {
        console.log("Add member to circle server error:", err.message);
        res.status(500).json({ "Add member to circle server error": err.message });
    }
}


// @desc List members in circle
// @route GET /api/circles/members/:circleId
export const listMembers = async (req: Request, res: Response) => {
    const circle_id = req.params.circleId;

    const user = req.user;

    if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    try {
        const { data, error } = await supabase
        .from("members")
        .select()
        .eq("circle_id", circle_id)

        if (error) {
            console.log("List member error:", error.message);
            res.status(400).json({"List member error": error.message});
            return;
        }
        console.log("List members:", data);
        res.status(200).json({ "List members": data });

    } catch (err: any) {
        console.log("List members server error:", err.message);
        res.status(500).json({ "List members server error": err.message });
    }
}


// @desc Delete member
// @route DELETE /api/circles/members/:circleId
export const deleteMember = async (req: Request, res: Response) => {
    const circle_id = req.params.circleId;

    const user = req.user;

    if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    try {
        const { error } = await supabase
        .from("members")
        .delete()
        .eq("circle_id", circle_id)
        .eq("user_id", user.id);

        if (error) {
            console.log(`Delete member: ${circle_id} error: ${error.message}`);
            res.status(400).json(`Delete member: ${circle_id} error: ${error.message}`);
            return;
        }
        console.log(`Member: ${user.id} deleted from circle ${circle_id}`);
        res.status(200).json(`Member: ${user.id} deleted from circle ${circle_id}`);

    } catch (err: any) {
        console.log("Delete member server error", err.message);
        res.status(500).json({ "Delete member server error": err.message });
    }
}
