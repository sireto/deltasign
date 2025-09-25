import Logo from "@/components/icons/logo";
import { Button } from "../ui/button";

export default function NavBar(){
    return (
        <div className="w-full flex justify-between px-4 py-3 bg-white">
            <div className="flex gap-2 items-center">
              <Logo />
              <span className="font-[700] text-xl text-silicon tracking-[-0.26px]">
                Delta Sign
            </span>
            </div>
            <div className="flex gap-2">
                <Button variant={"outline"}>
                    Sign Up
                </Button>
                <Button>
                    Login
                </Button>
            </div>
        </div>
    )
}