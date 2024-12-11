'use client'

import { Button } from "@/components/ui/button";
import {signIn, signOut, useSession} from 'next-auth/react'

export function SignInButton() {
    const {data: session} = useSession();

    if(session && session.user) {
        return (
            <div className="flex gap-4 ml-auto">
                <Button onClick={() => signOut()} variant="outline">Sign Out</Button>
                <p className="text-bold mt-1">{session.user.name}</p>
            </div>
        );
    }

    return (
        <Button onClick={() => signIn(undefined, { callbackUrl: '/dashboard' })} variant="ghost">
          Sign In
        </Button>
    );
}