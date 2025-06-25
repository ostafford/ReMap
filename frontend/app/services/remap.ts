/** Handles logic to communicate to backend */

import { supabase } from "@/lib/supabase";
import type { Tables } from "@/types/database";

const getApiBaseUrl = (): string => {
    // In React Native, we can access Expo's debugging information
    // The Metro bundler URL contains the correct IP address
    if (typeof global !== 'undefined' && global.__DEV__) {
      try {
        // Try to extract IP from Metro's source maps URL or other debugging info
        // This is a common pattern in React Native development
        const metroUrl = global.__METRO_ORIGIN__;
        if (metroUrl) {
          const url = new URL(metroUrl);
          return `http://${url.hostname}:3000`;
        }
      } catch (error) {
        console.log('[HealthService] Could not extract IP from Metro URL:', error);
      }
    }
  
    // Fallback: Try to detect from the current networking context
    // In Expo managed workflow, we can sometimes access this information
    if (typeof window !== 'undefined' && window.location && window.location.hostname !== 'localhost') {
      return `http://${window.location.hostname}:3000`;
    }
  
    // Final fallback - this will need to be manually configured
    console.warn('[HealthService] Using localhost fallback - mobile devices may not connect');
    return 'http://localhost:3000';
  };
  
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

        const response = await fetch(`${this.baseUrl}/${endpoint}`, {
            headers: {
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
        const userId = this.getUserId();

        if (!userId) {
            throw new Error("No user id found");
        }

        const response = await this.makeAuthRequest(
            `${this.baseUrl}/profiles/${userId}`,
            "GET",
        );

        return response;
    }
}
