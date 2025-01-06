import { supabase } from "@/app/utils/supabaseClient";
interface USERDATA {}
export async function getUser(userId: FormDataEntryValue | null) {
  try {
    const { data: userData, error } = await supabase
      .from("users")
      .select("*")
      .eq("user_id", userId);
    if (error) {
      throw error;
    }
    return userData[0];
  } catch (err) {
    throw err;
  }
}
