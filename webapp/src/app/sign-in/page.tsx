'use client';
import SignInCard from './components/sign-in-card';
import { useState } from 'react';
import VerifyEmailCard from './components/verify-email-card';
import { usePostLoginCodeMutation, useRequestLoginCodeMutation } from '../../shared/store/api/user-auth';
import { useRouter} from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setUser } from '@/shared/store/slice/user-slice';

export default function Page() {
  const [email, setEmail] = useState('');
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  const [requestLoginCode, { isLoading : requestLoginCodeLoading  }] = useRequestLoginCodeMutation();
  const [postLoginCode , { isLoading : postLoginCodeLoading }] = usePostLoginCodeMutation();

  const router = useRouter()
  const dispatch = useDispatch()

  const handleRequestCode = async ({ email }: { email: string }) => {
    try {
      setEmail(email);
      const { data } = await requestLoginCode({ email }).unwrap();
      setCurrentStep(2);
    } catch (error) {
      console.log(error);
    }
  };

  const handleVerifyCode = async ( code: string ) => {
    try {
      const { full_name , uuid  } = await postLoginCode({ email , code}).unwrap();
      dispatch(setUser({full_name , uuid}))
      router.push('/documents');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex h-full w-full flex-1 items-center justify-center">
      {currentStep === 1 ? (
        <SignInCard onSubmit={handleRequestCode} isLoading={requestLoginCodeLoading}/>
      ) : (
        <VerifyEmailCard
          email={email}
          onVerify={handleVerifyCode}
          onChangeEmail={() => {
            setCurrentStep(1);
          }}
          isLoading={postLoginCodeLoading}
        />
      )}
    </div>
  );
}
