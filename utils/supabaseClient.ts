
// Placeholder for Supabase client
// User needs to enable Supabase in Natively and configure it

export const supabaseEnabled = false;

// Mock functions for when Supabase is not enabled
export const mockSupabase = {
  from: (table: string) => ({
    select: () => ({
      order: () => Promise.resolve({ data: [], error: null }),
    }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => ({
      eq: () => Promise.resolve({ data: null, error: null }),
    }),
    delete: () => ({
      eq: () => Promise.resolve({ data: null, error: null }),
    }),
  }),
};

// Instructions for user
export const SUPABASE_SETUP_MESSAGE = `
To enable database functionality:

1. Press the Supabase button in Natively
2. Connect to your Supabase project
3. Run the SQL commands provided in the setup instructions
4. Restart the app

For now, the app will work with local storage only.
`;
