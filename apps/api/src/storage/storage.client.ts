import { createClient, SupabaseClient } from '@supabase/supabase-js';

const client: SupabaseClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export const supabaseStorage: SupabaseClient['storage'] = client.storage;
