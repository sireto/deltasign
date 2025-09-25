import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { useState } from "react";
import emailvalidator from "email-validator";

interface SignInCardProps {
    onSubmit: ({email }: {email: string}) => void
}

export default function SignInCard({onSubmit}: SignInCardProps) {

    const [email , setEmail] = useState("")

    return (
        <Card className="w-fit h-fit">
            <div>
                <span className="block text-center text-midnight-gray-900 font-[700] text-lg leading-[27px] tracking-[-0.26px]">Sign in to your account</span>
                <span className="block text-center text-midnight-gray-600">Get started with your email address.</span>
            </div>
            <div className="w-[386px]">
                <Label className="mb-2 block text-sm text-midnight-gray-900">Email</Label>
                <Input placeholder="Email address" className="h-[40px]"
                 value={email} onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <Button className="w-full h-[40px]" onClick={() => onSubmit({email})} disabled={!emailvalidator.validate(email)}>Continue</Button>
            <span className="text-center w-full text-midnight-gray-600">Dont have an account? <span className="text-silicon">Sign up</span></span>
        </Card>
    )
}