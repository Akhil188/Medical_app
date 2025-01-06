import { supabase } from "@/app/utils/supabaseClient";

interface FormData {
  email: string;
  companyName: string;
}

export const handleSignupDb = async (
  formData: FormData,
  userId: string,
  b2b_customer: boolean
) => {
  try {
    const values = {
      email: formData.email,
      company_name: formData.companyName,
      user_id: userId,
      b2b_customer,
      s3_folder_name: `users/${userId}/`,
    };
    const { error } = await supabase.from("users").insert([values]);
    if (error) throw error;
  } catch (err) {
    throw err;
  }
};
