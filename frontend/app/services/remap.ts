/** Handles logic to communicate to backend */

import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/database';

const getApiBaseUrl = (): string => {
	const url = process.env.EXPO_PUBLIC_BACKEND_URL;

	if (!url) {
		throw new Error('Backend url not defined');
	}

	return url;
};

// Put ip address here
const API_BASE_URL = getApiBaseUrl();

export default class RemapClient {
	private baseUrl;

	constructor() {
		if (!API_BASE_URL) {
			throw new Error('api base not defined');
		}

		this.baseUrl = API_BASE_URL;
	}

	async makeAuthRequest(
		endpoint: string,
		method: string,
		body?: any,
		isFormData?: boolean
	) {
		// Get Supabase session
		const { data, error: authError } = await supabase.auth.getSession();

		const token = data.session?.access_token;

		// Build headers with token
		const headers: Record<string, string> = {
			Authorization: `Bearer ${token}`,
		};

		// Handle content types
		if (isFormData) {
			// Let browser set boundary automatically
		} else {
			headers['Content-Type'] = 'application/json';
		}

		// Make request
		const response = await fetch(`${this.baseUrl}/api/${endpoint}`, {
			headers,
			method,
			body,
		});

		// Handle errors
		if (response.status == 403) {
			throw new Error('Protected endpoint');
		}

		if (!response.ok) {
			throw new Error('API error');
		}

		return await response.json();
	}

	async getUserId() {
		const { data, error } = await supabase.auth.getUser();

		return data.user?.id;
	}

	async getProfile(): Promise<Tables<'profiles'> & { pins: number }> {
		const userId = await this.getUserId();

		if (!userId) {
			throw new Error('No user id found');
		}

		const response = await this.makeAuthRequest(
			`profiles/${userId}`,
			'GET'
		);

		return response;
	}

	async getCircles(): Promise<{ id: string; name: string }[]> {
		return await this.makeAuthRequest('circles', 'GET');
	}

	// ===================
	//   PIN CRUD METHODS
	// ===================

	// CREATE
	async createPin(pinData: FormData): Promise<any> {
		return await this.makeAuthRequest('pins/user', 'POST', pinData, true);
	}

	// READ
	async getUserPins(): Promise<any> {
		return await this.makeAuthRequest('pins/user', 'GET');
	}

	async getPublicPins(): Promise<any> {
		return await this.makeAuthRequest('pins', 'GET');
	}

	async getPin(pinId: string): Promise<any> {
		return await this.makeAuthRequest(`pins/user/${pinId}`, 'GET');
	}

	// UPDATE
	async updatePin(pinId: string, pinData: FormData): Promise<any> {
		return await this.makeAuthRequest(
			`pins/user/${pinId}`,
			'PUT',
			pinData,
			true
		);
	}

	// DELETE
	async deletePin(pinId: string): Promise<any> {
		return await this.makeAuthRequest(`pins/user/${pinId}`, 'DELETE');
	}
}
