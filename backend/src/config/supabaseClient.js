
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://wlntadopalsjqcwsevjr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsbnRhZG9wYWxzanFjd3NldmpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxODU3OTMsImV4cCI6MjA2Mjc2MTc5M30.Wm3Vgz59n6Qr_WYqQ-qrRRwW1OmChiHlx1RVLxRrLT8';
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
