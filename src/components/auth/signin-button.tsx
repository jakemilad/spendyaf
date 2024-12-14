'use client'

import { Button } from "@/components/ui/button";
import {signIn, signOut, useSession} from 'next-auth/react'

export function SignInButton() {
    const {data: session} = useSession();

    if (!session) {
        return (
            <div className="flex gap-4 ml-auto">
                <Button 
                    onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                    variant="outline"
                    className="hover:bg-primary hover:text-primary-foreground"
                >
                    Sign In
                </Button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-4 ml-auto">
            <Button 
                onClick={() => signOut({ callbackUrl: "/" })} 
                variant="outline"
                className="hover:bg-destructive hover:text-destructive-foreground"
            >
                Sign Out
            </Button>
            <span className="text-sm font-medium">{session?.user?.name}</span>
        </div>
    );
}