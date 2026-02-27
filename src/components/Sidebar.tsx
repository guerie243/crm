"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Settings, LogOut } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Prospects', href: '/prospects', icon: Users },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-screen w-64 flex-col bg-card border-r border-border">
            <div className="flex h-16 items-center px-6">
                <span className="text-xl font-bold tracking-tight text-primary">
                    Premium Launch
                </span>
            </div>

            <nav className="flex-1 space-y-1 px-3 py-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-secondary text-primary"
                                    : "text-muted-foreground hover:bg-secondary/50 hover:text-primary"
                            )}
                        >
                            <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-border p-4">
                <div className="flex items-center px-2 py-2 text-sm font-medium text-muted-foreground">
                    <Settings className="mr-3 h-5 w-5" />
                    Paramètres
                </div>
            </div>
        </div>
    );
}
