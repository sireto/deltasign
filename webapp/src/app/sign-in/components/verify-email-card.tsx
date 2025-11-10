import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/shared/ui/input-otp";
import { useEffect, useState } from "react";
import {toast , Bounce} from "react-toastify";

interface VerifyEmailCardProps {
  email: string;
  onVerify: (code: string) => void;
  onChangeEmail: () => void;
  onResendEmail: (email : string) => void; 
  isLoading?: boolean;
  disableVerifyBtn : boolean
}

export default function VerifyEmailCard({
  email,
  onVerify,
  onChangeEmail,
  onResendEmail,
  isLoading,
  disableVerifyBtn
}: VerifyEmailCardProps) {
  const [timer, setTimer] = useState(59);

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const [otp, setOtp] = useState("");

   const handleResendEmail = () => {
    if (timer <= 0) {
      onResendEmail(email);
      toast.success("✅ A new verification code has been sent to your email.", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        transition: Bounce,
      });
      setTimer(59); // reset timer after resending
    }
  };

  return (
    <Card className="items-center">
      <div className="flex flex-col gap-1">
        <span className="text-midnight-gray-900 block text-center text-lg leading-[27px] font-[700] tracking-[-0.26px]">
          Verify your email
        </span>
        <div>
          <span className="text-midnight-gray-900 block text-center">
            We have sent a 6-digit code to ({email})
          </span>
          <span className="text-midnight-gray-900 block text-center">
            Please enter it below.{" "}
            <span
              className="text-silicon font-[600] hover:cursor-pointer hover:underline"
              onClick={onChangeEmail}
            >
              Change Email?
            </span>
          </span>
        </div>
      </div>

      <div>
        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
          <InputOTPGroup className="flex w-full justify-center gap-4">
            {[...Array(6)].map((_, index) => (
              <InputOTPSlot key={index} index={index} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>

      <div className="text-midnight-gray-600 flex h-[96px] w-[386px] flex-col gap-3">
        <Button
          className="h-[40px] w-full"
          onClick={() => onVerify(otp)}
          disabled={!(otp.length == 6) || isLoading || disableVerifyBtn}
          isLoading={isLoading}
        >
          Verify
        </Button>
        <div>
          <span className="text-midnight-gray-400 block text-center font-[600]" onClick={handleResendEmail}>
            Resend OTP again:
          </span>
          <span className="block text-center">
            You can request a new code in 00:{timer.toString().padStart(2, "0")}{" "}
            seconds
          </span>
        </div>
      </div>
    </Card>
  );
}
