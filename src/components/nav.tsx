'use client'

import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import { siteConfig } from "@/config/site";
import { SignInButton } from "@/components/auth/signin-button";
import { Separator } from "@/components/ui/separator";
import { usePathname } from "next/navigation";
import { PiggyBank } from "lucide-react";

export function Nav() {
    const pathname = usePathname();

    return(
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-6 md:gap-10">
                        <Link href="/" className="flex items-center space-x-2 transition-colors hover:text-foreground/80">
                            <PiggyBank className="h-5 w-5" />
                            <span className="inline-block text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                {siteConfig.name}
                            </span>
                        </Link>
                        <nav className="hidden md:flex gap-2">
                            {siteConfig.mainNav.map((item) => (
                                <Button
                                    key={item.href}
                                    variant={pathname === item.href ? "secondary" : "ghost"}
                                    className="text-sm font-medium transition-colors hover:text-primary"
                                    asChild
                                >
                                    <Link href={item.href}>
                                        {item.title}
                                    </Link>
                                </Button>
                            ))}
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <SignInButton />
                        <Separator orientation="vertical" className="h-6 bg-border/60"/>
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </header>
    )
}