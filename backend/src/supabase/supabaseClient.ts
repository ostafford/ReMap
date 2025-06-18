import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

import type { Database } from './types';


const supabaseUrl = process.env.SUPABASE_URL ?? "";

const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export default supabase;
