import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@radix-ui/react-label";
import { useState } from "react";
import emailvalidator from "email-validator";
import { LoaderCircle } from "lucide-react";

interface SignInCardProps {
  onSubmit: ({ email }: { email: string }) => void;
  isLoading?: boolean;
}

export default function SignInCard({ onSubmit, isLoading }: SignInCardProps) {
  const [email, setEmail] = useState("");

  const handleSubmit = () => {
    if (!isLoading && emailvalidator.validate(email)) {
      onSubmit({ email });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card className="h-fit w-fit">
      <div>
        <span className="text-midnight-gray-900 block text-center text-lg leading-[27px] font-[700] tracking-[-0.26px]">
          Sign in to your account
        </span>
        <span className="text-midnight-gray-600 block text-center">
          Get started with your email address.
        </span>
      </div>
      <div className="w-[386px]">
        <Label className="text-midnight-gray-900 mb-2 block text-sm">
          Email
        </Label>
        <Input
          placeholder="Email address"
          className="h-[40px]"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          onKeyDown={handleKeyDown}
        />
      </div>
      <Button
        className="h-[40px] w-full"
        onClick={handleSubmit}
        disabled={!emailvalidator.validate(email)}
        isLoading={isLoading}
      >
        Continue
      </Button>
      <span className="text-midnight-gray-600 w-full text-center">
        Dont have an account? <span className="text-silicon">Sign up</span>
      </span>
    </Card>
  );
}
