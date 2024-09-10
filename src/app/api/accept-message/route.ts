import jwt, { JwtPayload } from "jsonwebtoken"; // Import JwtPayload
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User.model";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// Extend JwtPayload to include userId
interface CustomJwtPayload extends JwtPayload {
  userId: string;
}

export async function POST(request: Request) {
  try {
    dbConnect();
    const authHeader = request.headers.get("authorization");
    const { acceptMessages } = await request.json();

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json(
        { success: false, message: "Unauthorized, no token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    // Verify the JWT and cast to CustomJwtPayload
    const decoded = jwt.verify(token, JWT_SECRET) as CustomJwtPayload;
    const userId = decoded.userId; // Now TypeScript knows userId exists

    // Update user status
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isAcceptingMessage: acceptMessages },
      { new: true }
    );

    if (!updatedUser) {
      return Response.json(
        {
          success: false,
          message: "Failed to update the user status to accept messages",
        },
        { status: 401 }
      );
    }

    // Send success response
    return Response.json(
      {
        success: true,
        message: "Status updated successfully",
        updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error at updating the accepting message status", error);
    return Response.json(
      {
        success: false,
        message: "Error at updating user message accepting status",
      },
      { status: 500 }
    );
  }
}
export async function GET(request: Request) {
  dbConnect();

  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json(
        { success: false, message: "Unauthorized, no token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as CustomJwtPayload;
    const userId = decoded.userId;

    const foundUser = await UserModel.findById(userId);

    if (!foundUser) {
      return Response.json(
        {
          success: false,
          message: "Failed to found the user to send status",
        },
        { status: 401 }
      );
    }

    // Send success response
    return Response.json(
      {
        success: true,
        message: foundUser.isAcceptingMessage,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error in getting message accepting status", error);
    return Response.json(
      {
        success: false,
        message: "Error in getting message accepting status",
      },
      { status: 500 }
    );
  }
}
