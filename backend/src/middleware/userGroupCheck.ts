import supabase from "../supabase/supabaseClient";

// Check if user already a member in group
export const checkMember = async (userId: any, circleId: any) => {
        const { data, error } = await supabase
        .from("members")
        .select()
        .eq("user_id", userId)
        .eq("circle_id", circleId)

        if (error) {
            console.log("Circle not found:", error.message);
            return { error: error.message};
        }
        
        // Check if no rows exist, which means the user is not a member
        if (data.length > 0) {
            return { error: "User already a member of this circle" };
        }
        
        return { data };
}
