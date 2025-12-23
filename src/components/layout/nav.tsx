'use client'

import Link from "next/link";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { SignInButton } from "@/components/auth/signin-button";
import { Separator } from "@/components/ui/separator";
import { usePathname } from "next/navigation";
import { PiggyBank, CircleDollarSign } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";

export function Nav() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isFlipped, setIsFlipped] = useState(false);
    const [showCoin, setShowCoin] = useState(false);
    const [canAnimate, setCanAnimate] = useState(true);
    const { data: session } = useSession();

    const handleMouseEnter = () => {
        if (canAnimate) {
            setIsFlipped(true);
            setCanAnimate(false);
            setTimeout(() => {
                setShowCoin(true);
            }, 500); 
        }
    };

    const handleCoinAnimationEnd = () => {
        setShowCoin(false);
        setIsFlipped(false);
        setTimeout(() => {
            setCanAnimate(true);
        }, 100); 
    };

    return(
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" role="navigation" aria-label="Main navigation">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-6 md:gap-10">
                        <div className="flex items-center space-x-2">
                            <div
                                className="relative cursor-pointer"
                                onMouseEnter={handleMouseEnter}
                            >
                                <PiggyBank 
                                    className={`h-5 w-5 ${isFlipped ? 'animate-pig-flip' : ''}`}
                                    aria-hidden="true" 
                                />
                                {showCoin && (
                                    <CircleDollarSign 
                                        className="absolute left-1 -translate-x-1/2 top-full h-3 w-3 text-yellow-400 animate-coin-drop" 
                                        aria-hidden="true"
                                        onAnimationEnd={handleCoinAnimationEnd}
                                    />
                                )}
                            </div>
                            <Link 
                                href="/" 
                                className="transition-colors hover:text-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                aria-label={`${siteConfig.name} home`}
                            >
                                <span className="inline-block text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                    {siteConfig.name}
                                </span>
                            </Link>
                        </div>
                        
                        <button 
                            className="md:hidden rounded-md p-2 hover:bg-accent"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle menu"
                            aria-expanded={isMobileMenuOpen}
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d={isMobileMenuOpen 
                                        ? "M6 18L18 6M6 6l12 12" 
                                        : "M4 6h16M4 12h16M4 18h16"
                                    } 
                                />
                            </svg>
                        </button>

                        <nav className="hidden md:flex gap-2" aria-label="Main">
                            {session && siteConfig.mainNav.map((item) => (
                                <Button
                                    key={item.href}
                                    variant={pathname === item.href ? "secondary" : "ghost"}
                                    className="text-sm font-medium transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    asChild
                                >
                                    <Link 
                                        href={item.href}
                                        aria-current={pathname === item.href ? "page" : undefined}
                                    >
                                        {item.title}
                                    </Link>
                                </Button>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <SignInButton />
                        <Separator orientation="vertical" className="h-6 bg-border/60" decorative />
                        <ThemeToggle />
                    </div>
                </div>

                {isMobileMenuOpen && (
                    <div className="absolute top-16 left-0 right-0 bg-background border-b md:hidden">
                        <nav className="flex flex-col p-4 space-y-2" aria-label="Mobile navigation">
                            {siteConfig.mainNav.map((item) => (
                                <Button
                                    key={item.href}
                                    variant={pathname === item.href ? "secondary" : "ghost"}
                                    className="w-full justify-start text-md font-medium"
                                    asChild
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <Link 
                                        href={item.href}
                                        aria-current={pathname === item.href ? "page" : undefined}
                                    >
                                        {item.title}
                                    </Link>
                                </Button>
                            ))}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    )
}