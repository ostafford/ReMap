import supabase from "../supabase/supabaseClient"
import { Request, Response, NextFunction } from "express"

const checkUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            console.log("No user, please sign in again.");
            res.status(401).json({ message: "Unauthorized. Please log in." });
            return;
        }
        req.user = user;
        console.log("User authenticated:", user.id);
        next();

    } catch (err: any) {
        console.log("Check user server error", err.message);
        res.status(500).json({ message: "Check user middleware Server Error" });
    }
}

export default checkUser;
