import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User.model";
import { z } from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";

const UserNameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const queryParam = {
      username: searchParams.get("username"),
    };
    const result = UserNameQuerySchema.safeParse(queryParam);
    console.log("Result ", result);
    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      return Response.json(
        {
          success: false,
          message:
            usernameErrors?.length > 0
              ? usernameErrors.join(",")
              : "Invalid Query Parameter",
        },
        { status: 400 }
      );
    }
    const { username } = result.data;
    const existingUser = await UserModel.findOne({
      username,
      isVerified: true,
    });
    if (existingUser) {
      return Response.json(
        {
          success: false,
          message: "Username already taken",
        },
        { status: 400 }
      );
    }
    return Response.json(
      {
        success: true,
        message: "Username is Unique",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error Checking Username -->", error);
    return Response.json(
      {
        success: false,
        message: "Error Checking username",
      },
      { status: 500 }
    );
  }
}
