import dbConnect from "@/lib/dbConnect";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "@/models/User.model";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { email, password } = await request.json();

    // Find user by email
    const user = await UserModel.findOne({ email });

    if (!user) {
      return Response.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return Response.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check if user is verified (if you're keeping this feature)
    if (!user.isVerified) {
      return Response.json(
        { success: false, message: "Please verify your email first" },
        { status: 403 }
      );
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        username: user.username,
      },
      JWT_SECRET,
      { expiresIn: "1d" } // Token expires in 1 day
    );

    return Response.json(
      {
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isAcceptingMessage: user.isAcceptingMessage,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during login", error);
    return Response.json(
      { success: false, message: "An error occurred during login" },
      { status: 500 }
    );
  }
}
