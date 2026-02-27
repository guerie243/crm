"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Settings, LogOut, AlertCircle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Prospects', href: '/prospects', icon: Users },
    { name: 'Recommandations', href: '/recommendations', icon: AlertCircle },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex md:h-screen w-full md:w-64 flex-row md:flex-col bg-card border-t md:border-t-0 md:border-r border-border fixed bottom-0 md:relative z-50">
            <div className="hidden md:flex h-16 items-center px-6">
                <span className="text-xl font-bold tracking-tight text-primary">
                    Premium Launch
                </span>
            </div>

            <nav className="flex-1 flex flex-row md:flex-col justify-around md:justify-start space-x-0 md: अंतरिक्ष-y-1 space-y-0 md:space-y-1 px-2 md:px-3 py-2 md:py-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex flex-col md:flex-row items-center justify-center md:justify-start rounded-md px-2 md:px-3 py-2 text-[10px] md:text-sm font-medium transition-colors",
                                isActive
                                    ? "text-primary md:bg-secondary"
                                    : "text-muted-foreground hover:bg-secondary/50 hover:text-primary"
                            )}
                        >
                            <item.icon className={cn("mb-1 md:mb-0 md:mr-3 h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                            <span className="block">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="hidden md:block border-t border-border p-4">
                <div className="flex items-center px-2 py-2 text-sm font-medium text-muted-foreground hover:text-primary cursor-pointer transition-colors">
                    <Settings className="mr-3 h-5 w-5" />
                    Paramètres
                </div>
            </div>
        </div>
    );
}
