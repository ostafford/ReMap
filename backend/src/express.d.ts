src / express.d.ts;

// Declaration file. It is used to provide type information about existing JavaScript code or libraries that don't have built-in TypeScript support.
import { User } from '@supabase/supabase-js';

declare global {
	namespace Express {
		interface Request {
			user?: User; // Add `user` property of type `User` (or any other type you're using for the user)
		}
	}
}
