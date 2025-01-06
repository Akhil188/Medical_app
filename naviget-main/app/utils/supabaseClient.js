import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPADB_URL,
  process.env.NEXT_PUBLIC_SUPADB_API_KEY
);
