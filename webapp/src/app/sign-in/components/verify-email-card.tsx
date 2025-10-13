import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/shared/ui/input-otp';
import { useEffect, useState } from 'react';

interface VerifyEmailCardProps {
  email: string;
  onVerify: (integer: number) => void;
  onChangeEmail: () => void;
}

export default function VerifyEmailCard({
  email,
  onVerify,
  onChangeEmail,
}: VerifyEmailCardProps) {
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
        <span className="text-midnight-gray-900 block text-center text-lg leading-[27px] font-[700] tracking-[-0.26px]">
          Verify your email
        </span>
        <div>
          <span className="text-midnight-gray-900 block text-center">
            We've sent a 6-digit code to ({email})
          </span>
          <span className="text-midnight-gray-900 block text-center">
            Please enter it below.{' '}
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
          <InputOTPGroup className="flex w-full justify-center gap-4">
            {[...Array(6)].map((_, index) => (
              <InputOTPSlot key={index} index={index} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>

      <div className="text-midnight-gray-600 flex h-[96px] w-[386px] flex-col gap-3">
        <Button className="h-[40px] w-full" disabled>
          Verify
        </Button>
        <div>
          <span className="text-silicon block text-center font-[600]">
            Resend OTP again:
          </span>
          <span className="block text-center">
            You can request a new code in 00:{timer.toString().padStart(2, '0')}{' '}
            seconds
          </span>
        </div>
      </div>
    </Card>
  );
}
