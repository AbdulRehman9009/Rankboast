"use client";

import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/Themetoggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LogOut, User } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Topbar() {
    const { data: session } = useSession();

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-30 px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="text-muted-foreground hover:text-foreground hover:bg-accent" />
                <div className="w-px h-4 bg-border mx-2" />
                {/* Breadcrumb or title placeholder could go here */}
                <span className="text-sm font-medium text-muted-foreground hidden sm:inline-block">
                    Dashboard Overview
                </span>
            </div>

            <div className="flex items-center gap-4">
                <ThemeToggle />

                {session?.user && (
                    <DropdownMenu>
                        <DropdownMenuTrigger className="focus:outline-none">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-brand font-bold uppercase ring-1 ring-brand/20 hover:bg-brand/20 transition-colors shadow-sm cursor-pointer">
                                {session.user.name?.[0] || session.user.email?.[0] || 'U'}
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 mt-2">
                            <DropdownMenuLabel className="flex flex-col gap-1">
                                <span className="font-semibold">{session.user.name || "User"}</span>
                                <span className="text-xs text-muted-foreground font-normal line-clamp-1">{session.user.email}</span>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer text-muted-foreground">
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                                className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </header>
    );
}
