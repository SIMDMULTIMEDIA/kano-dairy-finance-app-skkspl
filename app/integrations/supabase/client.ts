import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://mmrcgnuwxxpiddukmtio.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tcmNnbnV3eHhwaWRkdWttdGlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5MTY0OTIsImV4cCI6MjA3NjQ5MjQ5Mn0.rDcy-rah4PlmGps2XUq1k2E9KxzJLwlp_wJ8p2cHWy0";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
