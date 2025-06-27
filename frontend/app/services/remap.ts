/** Handles logic to communicate to backend */

import { supabase } from "@/lib/supabase";
import type { Tables } from "@/types/database";

const getApiBaseUrl = (): string => {
    const url = process.env.EXPO_PUBLIC_BACKEND_URL;

    if (!url) {
        throw new Error("Backend url not defined");
    }

    return url;
  };
  
// Put ip address here
const API_BASE_URL = getApiBaseUrl();

export default class RemapClient {
    private baseUrl;

    constructor() {
        if (!API_BASE_URL) {
            throw new Error("api base not defined");
        }

        this.baseUrl = API_BASE_URL;
    }

    async makeAuthRequest(endpoint: string, method: string, body?: any) {
        const { data, error: authError } = await supabase
        .auth.getSession()

        const token = data.session?.access_token;
        
        const response = await fetch(`${this.baseUrl}/api/${endpoint}`, {
            headers: {
                "Content-type": 'application/json',
                "Authorization": `Bearer ${token}`
            },
            method,
            body
        });

        if (response.status == 403) {
            throw new Error("Protected endpoint");
        }

        if (!response.ok) {
            throw new Error("API error");
        }

        return await response.json();
    }



    async getUserId() {
        const { data, error } = await supabase
        .auth.getUser();

        return data.user?.id;
    }

    async getProfile(): Promise<Tables<"profiles"> & { pins: number; }> {
        const userId = await this.getUserId();

        if (!userId) {
            throw new Error("No user id found");
        }

        const response = await this.makeAuthRequest(
            `profiles/${userId}`,
            "GET",
        );

        return response;
    }

    async getCircles(): Promise<{ id: string; name: string }[]> {
        return await this.makeAuthRequest("circles", "GET");
    }
}
