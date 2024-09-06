import dbConnect from "@/lib/dbConnect";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import bcrypt from "bcryptjs";
import UserModel from "@/models/User.model";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, email, password } = await request.json();
    const existingUserVerifiedByUserName = await UserModel.findOne({
      username,
      isVerified: true,
    });
    if (existingUserVerifiedByUserName) {
      return Response.json(
        { success: false, message: "username is already taken" },
        { status: 400 }
      );
    }
    const existedUserByEmail = await UserModel.findOne({ email });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (existedUserByEmail) {
      if (existedUserByEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: "User already Registered with this email",
          },
          { status: 400 }
        );
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        existedUserByEmail.password = hashedPassword;
        existedUserByEmail.verifyCode = verifyCode;
        existedUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
        await existedUserByEmail.save();
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessage: true,
        message: [],
      });
      await newUser.save();
    }

    // Send Verification Mail
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );
    if (!emailResponse.success) {
      return Response.json(
        { success: false, message: emailResponse.message },
        { status: 500 }
      );
    }
    return Response.json(
      {
        success: true,
        message: "User Registered Successfully,Please verify your email",
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("Error Registering user", error);
    return Response.json(
      { success: false, message: "Error Registering User" },
      { status: 500 }
    );
  }
}
