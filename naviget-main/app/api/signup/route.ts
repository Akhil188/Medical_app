import { NextResponse } from "next/server";
import { handleSignupDb } from "./handleSignupDb";
import { validateUser } from "./validateUser";
import { createUserS3Folder } from "./createUserS3Folder";

interface FormData {
  email: string;
  companyName: string;
  password: string;
}
export async function POST(request: Request) {
  try {
    const { email, password, companyName, userId, b2b_customer } =
      await request.json();
    const formData: FormData = { email, password, companyName };
    await validateUser(formData, b2b_customer);

    await handleSignupDb(formData, userId, b2b_customer);

    // Create user folder in S3
    const err = await createUserS3Folder(userId);
    if (err) return NextResponse.json({ error: err }, { status: 500 });

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
