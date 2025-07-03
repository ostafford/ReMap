// ================
//   CORE IMPORTS
// ================
import { useState } from 'react';

// ====================
//   TYPE DEFINITIONS
// ====================
export interface FormData {
	fullname: string;
	email: string;
	password: string;
	confirmPassword: string;
}

export interface ValidationResult {
	isValid: boolean;
	errorMessage: string;
}

// ========================
//   COMPONENT DEFINITION
// ========================
export const useFormValidation = () => {
	const [formData, setFormData] = useState<FormData>({
		fullname: '',
		email: '',
		password: '',
		confirmPassword: '',
	});

	const updateFormField = <Field extends keyof FormData>(
		field: Field,
		value: FormData[Field]
	) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const resetForm = () => {
		setFormData({
			fullname: '',
			email: '',
			password: '',
			confirmPassword: '',
		});
	};

	//	== CLIENT SIDE VALIDATION ==
	const validateFormData = (): ValidationResult => {
		const { email, password, confirmPassword, fullname } = formData;

		if (!fullname.trim()) {
			return {
				isValid: false,
				errorMessage: 'Please enter your full name.',
			};
		}

		if (!email.trim()) {
			return {
				isValid: false,
				errorMessage: 'Please enter your email address.',
			};
		}

		if (!email.includes('@') || email.length < 5) {
			return {
				isValid: false,
				errorMessage: 'Please enter a valid email address.',
			};
		}

		if (password.length < 6) {
			return {
				isValid: false,
				errorMessage: 'Password must be at least 6 characters long.',
			};
		}

		if (password !== confirmPassword) {
			return { isValid: false, errorMessage: 'Passwords do not match.' };
		}

		return { isValid: true, errorMessage: '' };
	};

	return {
		formData,
		updateFormField,
		resetForm,
		validateFormData,
	};
};
