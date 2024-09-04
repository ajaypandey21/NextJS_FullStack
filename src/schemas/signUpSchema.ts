import { z } from "zod";

export const usernameValidation = z
  .string()
  .min(2, "Username must contain 2 characters")
  .max(10, "Username must not be more than 10 characters")
  .regex(/^[a-zA-Z0-9]+$/, "Username must not contain special character");

export const emailValidation = z
  .string()
  .email({ message: "Invalid Email Address" });

export const passwordValidation = z
  .string()
  .min(6, "Password must be atleast 6 characters");

export const signUpSchema = z.object({
  username: usernameValidation,
  email: emailValidation,
  password: passwordValidation,
});
