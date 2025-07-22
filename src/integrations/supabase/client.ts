import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fdvpmommvnakoxggnjvt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkdnBtb21tdm5ha294Z2duanZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxOTY5NzksImV4cCI6MjA2ODc3Mjk3OX0.e0If8rVOojKkosEUu34AyyxKFL8-nDYibVOa1wo9pjU';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});