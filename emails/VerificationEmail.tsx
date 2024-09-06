import React from "react";
import { Html, Body, Text } from "@react-email/components";

interface MailTemplateProps {
  username: string;
  otp: string;
}

export default function VerificationEmail({
  username,
  otp,
}: MailTemplateProps): JSX.Element {
  return (
    <Html>
      <Body className="bg-gray-100 p-6 font-sans">
        <Text className="text-lg font-bold">Hello {username},</Text>
        <Text className="text-base">Your OTP for verification is:</Text>
        <Text className="text-2xl font-semibold text-red-500 my-2">{otp}</Text>
        <Text className="text-sm">
          If you did not request this, please ignore this email.
        </Text>
        <Text className="mt-4 text-sm">Thank you,</Text>
        <Text className="text-sm">The Support Team</Text>
      </Body>
    </Html>
  );
}
