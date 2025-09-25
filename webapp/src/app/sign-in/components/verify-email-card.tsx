import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useEffect, useState } from "react";

interface VerifyEmailCardProps {
  email: string;
  onVerify: (integer: number) => void;
  onChangeEmail: () => void;
}

export default function VerifyEmailCard({ email, onVerify, onChangeEmail }: VerifyEmailCardProps) {
  const [timer, setTimer] = useState(59);

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval); // cleanup to avoid multiple intervals
  }, [timer]);

  return (
    <Card className="items-center">
      <div className="flex flex-col gap-1">
        <span className="block text-center text-midnight-gray-900 font-[700] text-lg leading-[27px] tracking-[-0.26px]">
          Verify your email
        </span>
        <div>
          <span className="block text-center text-midnight-gray-900">
            We've sent a 6-digit code to ({email})
          </span>
          <span className="block text-center text-midnight-gray-900">
            Please enter it below.{" "}
            <span
              className="text-silicon font-[600] hover:cursor-pointer"
              onClick={onChangeEmail}
            >
              Change Email?
            </span>
          </span>
        </div>
      </div>

      <div>
        <InputOTP maxLength={6}>
          <InputOTPGroup className="w-full flex justify-center gap-4">
            {[...Array(6)].map((_, index) => (
              <InputOTPSlot key={index} index={index} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>

      <div className="w-[386px] gap-3 flex flex-col h-[96px] text-midnight-gray-600">
        <Button className="w-full h-[40px]" disabled>
          Verify
        </Button>
        <div>
          <span className="text-silicon font-[600] block text-center">
            Resend OTP again:
          </span>
          <span className="block text-center">
            You can request a new code in 00:{timer.toString().padStart(2, "0")} seconds
          </span>
        </div>
      </div>
    </Card>
  );
}
