import supabase from "../supabase/supabaseClient"
import { Request, Response, NextFunction } from "express"

const checkUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const headers = req.headers;
        const authorization = headers["authorization"];

        if (!authorization) {
            res.status(400).json({ message: "Token not provided" });
            return;
        }

        const token = authorization.split(" ")[1];

        const { data: { user }, error } = await supabase.auth.getUser(token);

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
