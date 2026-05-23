"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  CreditCard,
  BedDouble,
  BarChart3,
  Settings,
  Bell,
  Search,
  Menu,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Hotel,
  ArrowRight
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/admindashboard/dashboard", icon: LayoutDashboard, badge: null },
  { name: "Bookings", href: "/admindashboard/dashboard/bookings", icon: CalendarDays, badge: "12" },
  { name: "Users", href: "/admindashboard/dashboard/users", icon: Users, badge: null },
  { name: "Payments", href: "/admindashboard/dashboard/payments", icon: CreditCard, badge: "3" },
  { name: "Rooms", href: "/admindashboard/dashboard/rooms", icon: BedDouble, badge: null },
  { name: "Analytics", href: "/admindashboard/dashboard/analytics", icon: BarChart3, badge: null },
  { name: "Settings", href: "/admindashboard/dashboard/settings", icon: Settings, badge: null },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll for navbar glass effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const NavItem = ({ item, isCollapsed = false }) => {
    const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
    const Icon = item.icon;

    const content = (
      <Link
        href={item.href}
        onClick={() => setMobileOpen(false)}
        className={cn(
          "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden",
          isActive
            ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        )}
      >
        {isActive && (
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
        
        <Icon className={cn("w-5 h-5 shrink-0 transition-transform duration-300", isActive && "scale-110")} />
        
        {!isCollapsed && (
          <span className="truncate">{item.name}</span>
        )}
        
        {!isCollapsed && item.badge && (
          <Badge 
            className={cn(
              "ml-auto text-xs px-2 py-0 h-5 min-w-[20px] flex items-center justify-center",
              isActive 
                ? "bg-white/20 text-white border-0" 
                : "bg-amber-100 text-amber-700"
            )}
          >
            {item.badge}
          </Badge>
        )}

        {isCollapsed && item.badge && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {item.badge}
          </span>
        )}
      </Link>
    );

    if (isCollapsed) {
      return (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>{content}</TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              {item.name}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return content;
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[280px] p-0 bg-white border-r border-gray-200">
          <div className="flex flex-col h-full">
            {/* Mobile Logo */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Hotel className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-gray-900 leading-tight">LuxeStay</h2>
                <p className="text-xs text-gray-500">Hotel Manager</p>
              </div>
            </div>

            {/* Mobile Nav */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {navigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </nav>

            {/* Mobile Footer */}
            <div className="p-4 border-t border-gray-100">
              <Button variant="ghost" className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50">
                <LogOut className="w-5 h-5" />
                Sign Out
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-500 ease-in-out hidden lg:flex flex-col",
          collapsed ? "w-[80px]" : "w-[260px]"
        )}
      >
        {/* Logo Area */}
        <div className={cn("flex items-center gap-3 px-5 py-5 border-b border-gray-100", collapsed && "justify-center px-2")}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
            <Hotel className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h2 className="font-bold text-lg text-gray-900 leading-tight">LuxeStay</h2>
              <p className="text-xs text-gray-500">Hotel Manager</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className={cn("flex-1 py-6 space-y-1 overflow-y-auto", collapsed ? "px-3" : "px-4")}>
          {navigation.map((item) => (
            <NavItem key={item.name} item={item} isCollapsed={collapsed} />
          ))}
        </nav>

        {/* Collapse Toggle */}
        <div className="p-4 border-t border-gray-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "w-full gap-2 text-gray-500 hover:text-gray-900",
              collapsed && "justify-center px-0"
            )}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {!collapsed && <span className="text-xs">Collapse Sidebar</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={cn("transition-all duration-500 ease-in-out lg:ml-[260px]", collapsed && "lg:ml-[80px]")}>
        {/* Top Navbar */}
        <header
          className={cn(
            "sticky top-0 z-30 px-4 sm:px-8 py-4 transition-all duration-300",
            scrolled
              ? "bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50"
              : "bg-transparent"
          )}
        >
          <div className="flex items-center justify-between max-w-[1400px] mx-auto">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Trigger */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden h-10 w-10">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
              </Sheet>

              {/* Breadcrumb / Page Title */}
              <div className="hidden sm:block">
                <h2 className="text-xl font-bold text-gray-900">
                  {navigation.find(n => pathname?.startsWith(n.href))?.name || "Dashboard"}
                </h2>
                <p className="text-xs text-gray-500">
                  {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Search */}
              <div className="hidden md:flex relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search anything..."
                  className="pl-9 w-[240px] h-10 bg-gray-100/50 border-0 focus-visible:ring-amber-500/50"
                />
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
              </Button>

              {/* Profile */}
              <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-gray-900">Admin User</p>
                  <p className="text-xs text-gray-500">Manager</p>
                </div>
                <Avatar className="h-10 w-10 ring-2 ring-gray-100 cursor-pointer hover:ring-amber-200 transition-all">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700 font-bold">
                    AD
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content - Outlet equivalent */}
        <main className="p-4 sm:p-8 max-w-[1400px] mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 min-h-[calc(100vh-200px)]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}