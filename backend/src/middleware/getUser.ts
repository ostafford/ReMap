import supabase from "../supabase/supabaseClient"
import { Request, Response, NextFunction } from "express"
const getUser = async (req: Request, res: Response, next: NextFunction) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user !== null) {
        console.log("User in session:", user.id);
        res.status(200);
        return;
    }
    console.log("No User, Sign in again:", user);
    res.status(404);
    next();
}

export default getUser;
