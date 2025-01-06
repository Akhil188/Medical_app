import axios from "axios";

interface Params {
  to_email?: string;
  user_email?: string;
  user_folder?: string;
}
interface USERDATA {
  email: string;
  s3_folder_name: string;
}

export async function sendEmail(userData: USERDATA) {
  const serviceId = process.env.SERVICE_ID;
  const adminTemplateId = process.env.ADMIN_TMP_ID;
  const userTemplateId = process.env.USER_TMP_ID;
  const userId = process.env.EMAIL_USER_ID;
  const accessToken = process.env.ACCESS_TOKEN;
  const missingCredentials =
    !serviceId || !adminTemplateId || !userId || !userTemplateId;

  if (missingCredentials) {
    throw new Error("Missing email service credentials");
  }

  const adminTemplateParams: Params = {
    to_email: process.env.ADMIN_EMAIL,
    user_email: userData.email,
    user_folder: userData.s3_folder_name,
  };

  const userTemplateParams: Params = {
    to_email: userData.email,
  };

  const emailData = {
    service_id: serviceId,
    template_id: adminTemplateId,
    user_id: userId,
    template_params: adminTemplateParams,
    accessToken: accessToken,
  };

  try {
    await axios.post("https://api.emailjs.com/api/v1.0/email/send", emailData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    emailData.template_id = userTemplateId;
    emailData.template_params = userTemplateParams;

    await axios.post("https://api.emailjs.com/api/v1.0/email/send", emailData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    throw error;
  }
}
