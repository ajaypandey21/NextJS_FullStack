import { resend } from "@/lib/resend";
import { ApiResponse } from "@/types/ApiResponse";
import VerificationEmail from "../../emails/VerificationEmail";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: email,
      subject: "Mystery Message || Verification Code",
      react: VerificationEmail({ username, otp: verifyCode }), // TODO: CHECK THIS DESTRUCTION
    });
    return {
      message: "Verification message sent Successfully",
      success: true,
    };
  } catch (error) {
    console.log("Error at sending verification email", error);
    return {
      message: "failed sending verification email",
      success: false,
    };
  }
}
