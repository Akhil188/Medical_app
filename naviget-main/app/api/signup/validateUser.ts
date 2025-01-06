import {
  signupValidationSchemaB2BS,
  signupValidationSchemaB2CS,
} from "@/app/utils/validationSchemas";
interface FormData {
  email: string;
  companyName: string;
  password: string;
}
export async function validateUser(formData: FormData, b2b_customer: boolean) {
  try {
    if (b2b_customer) await signupValidationSchemaB2BS.validate(formData);
    else await signupValidationSchemaB2CS.validate(formData);
  } catch (err: any) {
    throw err;
  }
}
