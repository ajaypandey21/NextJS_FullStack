import jwt, { JwtPayload } from "jsonwebtoken"; // Import JwtPayload
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User.model";
import mongoose from "mongoose";
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// Extend JwtPayload to include userId
interface CustomJwtPayload extends JwtPayload {
  userId: string;
}
export async function GET(request: Request) {
  try {
    dbConnect();

    const authHeader = request.headers.get("authorization");
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
    const userIdForAggregate = new mongoose.Types.ObjectId(userId);
    const user = await UserModel.aggregate([
      {
        $match: { id: userIdForAggregate },
      },
      { $unwind: "$messages" },
      { $sort: { "messages.createdAt": -1 } },
      { $group: { _id: "$_id", messages: { $push: "$messages" } } },
    ]);
    if (!user || user.length === 0) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 401 }
      );
    }
    return Response.json(
      {
        success: true,
        message: user[0].messages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error at updating the accepting message status", error);
    return Response.json(
      {
        success: false,
        message: "Error at fetching user messages",
      },
      { status: 500 }
    );
  }
}
