'use client';

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function SignIn() {
  return (
    <div className="flex h-[calc(50vh-2.5rem)] items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Gotta sign in
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in to manage your transactions
        </p>
        <Button onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
          Continue with Google
        </Button>
      </div>
    </div>
  );
}
