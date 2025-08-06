import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bcpqwitmeqldyubiiucb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjcHF3aXRtZXFsZHl1YmlpdWNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NTk4NzMsImV4cCI6MjA3MDAzNTg3M30.MLYU7OGZzntsk5KPj0j51y43P275xJy1IIIyB_bOd3Y';

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);