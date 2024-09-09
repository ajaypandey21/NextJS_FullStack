import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User.model";

export async function POST(request: Request) {
  try {
    dbConnect();
    const { username, code } = await request.json();
    const decodedUsername = decodeURIComponent(username);
    const user = await UserModel.findOne({ username: decodedUsername });
    if (!user) {
      return Response.json(
        { success: false, message: "user not found" },
        { status: 400 }
      );
    }
    const isCodeValid = user.verifyCode === code;
    const isCodeExpired = new Date(user.verifyCodeExpiry) > new Date();
    if (isCodeExpired && isCodeValid) {
      user.isVerified = true;
      await user.save();
      return Response.json(
        {
          success: true,
          message: "User Verified Successfully",
        },
        { status: 200 }
      );
    } else if (!isCodeExpired) {
      return Response.json(
        {
          success: false,
          message: "Code is expired, Please Sign up again",
        },
        { status: 410 }
      );
    } else {
      return Response.json(
        {
          success: false,
          message: "Incorrect Verification Code",
        },
        { status: 400 }
      );
    }
  } catch (error) {}
}
