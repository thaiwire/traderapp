"use client";

import { useMemo, useState } from "react";
import Cookies from "js-cookie";
import { usePathname, useRouter } from "next/navigation";
import { UsersStore, useUsersStore } from '@/store/users-store';
import { Building2, CalendarDays, LayoutDashboard, LogOut, Menu, UserRound, BedDouble, Settings } from 'lucide-react';
import React from 'react'
import SidebarMenuItem from "./sidebar-menu-item";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LucideIcon } from "lucide-react";

type UserRole = "admin" | "hotel_owner" | "customer"

type RoleMenuItem = {
  label: string
  href: string
  icon: LucideIcon
}

const MENU_BY_ROLE: Record<UserRole, RoleMenuItem[]> = {
  admin: [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/trader", label: "Trader", icon: Settings },
    { href: "/admin/stockmonitor", label: "Stock Monitor", icon: Settings },
    { href: "/admin/users", label: "Users", icon: UserRound },
    { href: "/admin/profile", label: "Profile", icon: UserRound },
    { href: "/admin/setting", label: "Setting", icon: Settings },
  ],
  hotel_owner: [
    {
      href: "/hotel_owner/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    { href: "/hotel_owner/hotels", label: "Hotels", icon: Building2 },
    { href: "/hotel_owner/rooms", label: "Rooms", icon: BedDouble },
    { href: "/hotel_owner/bookings", label: "Bookings", icon: CalendarDays },
    { href: "/hotel_owner/profile", label: "Profile", icon: UserRound },
  ],
  customer: [
    { href: "/customer/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/customer/book-room", label: "Book a Room", icon: Building2 },
    { href: "/customer/bookings", label: "Bookings", icon: CalendarDays },
    { href: "/customer/profile", label: "Profile", icon: UserRound },
  ],
};

function Header() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const {loggedInUser, setLoggedInUser}:UsersStore = useUsersStore();

  const handleLogout = () => {
    Cookies.remove("token")
    setLoggedInUser(null)
    setOpen(false)
    router.push("/login")
  }

  const menuItems = useMemo(() => {
    const role = loggedInUser?.role

    if (!role || !(role in MENU_BY_ROLE)) {
      return []
    }

    return MENU_BY_ROLE[role as UserRole]
  }, [loggedInUser?.role])

  return (
    <div className='flex items-center justify-between bg-primary px-7 py-6 text-primary-foreground'>
        <h1 className='text-2xl font-bold'>Stock Trader App</h1>
        <div className='flex gap-5 items-center'>
            <h1 className='text-m text-sm text-primary-foreground'>
                {loggedInUser ? `Welcome, ${loggedInUser.name} (${loggedInUser.role})`
                 : 'Not logged in'}
            </h1>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-primary-foreground hover:text-primary-foreground">
                  <Menu size={14} className='w-6 h-6 cursor-pointer text-sm' />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                  <SheetDescription>Navigate through dashboard sections.</SheetDescription>
                </SheetHeader>

                <nav className="mt-4 flex h-full flex-col gap-2">
                  <div className="space-y-2">
                  {menuItems.map((item) => (
                    <SidebarMenuItem
                      key={`${item.label}-${item.href}`}
                      href={item.href}
                      label={item.label}
                      icon={item.icon}
                      active={pathname === item.href}
                      onClick={() => {
                        setOpen(false)
                      }}
                    />
                  ))}
                  </div>

                  <div className="mt-auto">
                    <SidebarMenuItem
                      label="Logout"
                      icon={LogOut}
                      isLogout
                      onClick={handleLogout}
                    />
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
        </div>
    </div>
  )
}

export default Header