"use client";

import { Home, Users, CheckSquare, LineChart, Airplay, User, LogOut, Loader2, FileText } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { TooltipProvider } from "@/components/ui/tooltip"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { Button } from "./ui/button";

// Menu items.
const items = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
    },
    {
        title: "Competitors",
        url: "/competitors",
        icon: Users,
    },
    {
        title: "Audit",
        url: "/audit",
        icon: CheckSquare,
    },
    {
        title: "Analytics",
        url: "/analytics",
        icon: LineChart,
    },
    {
        title: "Content Generator",
        url: "/contentgenerator",
        icon: FileText,
    },
    {
        title: "Visualizer",
        url: "/visualizer",
        icon: Airplay ,
    },
    {
        title: "Profile",
        url: "/profile",
        icon: User,
    }
];

export function AppSidebar() {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const { isMobile, setOpenMobile } = useSidebar();

    const handleLinkClick = () => {
        if (isMobile) {
            setOpenMobile(false);
        }
    };

    return (
        <TooltipProvider>
            <Sidebar variant="inset" className="border-r border-border bg-sidebar text-sidebar-foreground">
                <SidebarHeader className="p-4 border-b border-border">
                    <Link href="/" className="flex items-center gap-2 px-2" onClick={handleLinkClick}>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-xl">
                            R
                        </div>
                        <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                            RankBoast
                        </span>
                    </Link>
                </SidebarHeader>

                <SidebarContent className="bg-sidebar">
                    <SidebarGroup>
                        <SidebarGroupLabel className="text-muted-foreground font-semibold px-4 pt-4 pb-2 text-xs uppercase tracking-wider">
                            Menu
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {items.map((item) => {
                                    const isActive = pathname === item.url || pathname?.startsWith(item.url + "/");
                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={isActive}
                                                tooltip={item.title}
                                                className={`hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors py-5 ${isActive
                                                    ? "bg-sidebar-accent text-indigo-500 font-medium border-r-2 border-indigo-500 rounded-none rounded-l-md"
                                                    : "text-muted-foreground"
                                                    }`}
                                            >
                                                <Link href={item.url} onClick={handleLinkClick} className="flex items-center gap-3">
                                                    <item.icon className={`h-5 w-5 ${isActive ? "text-indigo-500" : "text-muted-foreground"}`} />
                                                    <span className="text-base">{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>

                <SidebarFooter className="border-t border-border p-4 bg-sidebar">
                    {status === "loading" ? (
                        <div className="flex items-center justify-center py-2">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : session ? (
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col px-2">
                                <span className="text-sm font-medium text-foreground line-clamp-1">{session.user?.name}</span>
                                <span className="text-xs text-muted-foreground line-clamp-1">{session.user?.email}</span>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full justify-start gap-2 border-border bg-sidebar text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
                                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                            >
                                <LogOut className="h-4 w-4" />
                                Sign Out
                            </Button>
                        </div>
                    ) : null}
                </SidebarFooter>
            </Sidebar>
        </TooltipProvider>
    );
}
