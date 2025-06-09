// src/express.d.ts

import { User } from '@supabase/supabase-js';

declare global {
  namespace Express {
    interface Request {
      user?: User;  // Add `user` property of type `User` (or any other type you're using for the user)
    }
  }
}
