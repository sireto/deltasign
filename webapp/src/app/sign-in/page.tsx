'use client';
import SignInCard from './components/sign-in-card';
import { useState } from 'react';
import VerifyEmailCard from './components/verify-email-card';

export default function Page() {
  const [email, setEmail] = useState('');
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  const handleSubmit = ({ email }: { email: string }) => {
    setEmail(email);
    setCurrentStep(2);
  };

  return (
    <div className="flex h-full w-full flex-1 items-center justify-center">
      {currentStep === 1 ? (
        <SignInCard onSubmit={handleSubmit} />
      ) : (
        <VerifyEmailCard
          email={email}
          onVerify={() => {}}
          onChangeEmail={() => {
            setCurrentStep(1);
          }}
        />
      )}
    </div>
  );
}
