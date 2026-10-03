import { createClient } from "@supabase/supabase-js";

function isValidSupabaseKey(value: string | undefined): value is string {
  if (!value) return false;
  if (/^sb_publishable_[A-Za-z0-9_-]{20,}$/.test(value)) return true;
  if (!value.startsWith("eyJ")) return false;

  try {
    const payload = value.split(".")[1];
    if (!payload) return false;
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return decoded.role === "anon";
  } catch {
    return false;
  }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isValidUrl =
  typeof supabaseUrl === "string" &&
  /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(supabaseUrl);

export const isSupabaseConfigured = isValidUrl && isValidSupabaseKey(supabaseKey);
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;
