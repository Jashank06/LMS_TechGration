"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import { BrandLogo } from "@/components/brand/brand-logo"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  GraduationCap,
  FolderTree,
  UserCheck,
  CreditCard,
  BarChart3,
  Megaphone,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  Search,
  ExternalLink,
  ShieldCheck,
  Menu,
  X,
  Code,
} from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  badgeColor?: string
}

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "User Management", href: "/admin/users", icon: Users },
  { title: "Roles & RBAC", href: "/admin/rbac", icon: ShieldAlert },
  { title: "Course Approvals", href: "/admin/courses", icon: GraduationCap, badge: "Review", badgeColor: "bg-amber-500/20 text-amber-400 border border-amber-500/30" },
  { title: "Categories & Skills", href: "/admin/categories", icon: FolderTree },
  { title: "Enrollments", href: "/admin/enrollments", icon: UserCheck },
  { title: "Coding Arena", href: "/admin/arena", icon: Code, badge: "New", badgeColor: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" },
  { title: "Payments & Coupons", href: "/admin/billing", icon: CreditCard },
  { title: "Reports & Analytics", href: "/admin/reports", icon: BarChart3 },
  { title: "Announcements", href: "/admin/announcements", icon: Megaphone },
  { title: "Audit Logs", href: "/admin/audit-logs", icon: FileText, badge: "Append-Only", badgeColor: "bg-brand-teal/15 text-brand-cyan border border-brand-teal/25" },
  { title: "Platform Settings", href: "/admin/settings", icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)
  const [currentUser, setCurrentUser] = React.useState<{ name: string; email: string; role: string } | null>(null)

  // Skip shell on login page
  const isLoginPage = pathname === "/admin/login"

  React.useEffect(() => {
    if (isLoginPage) return

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user)
        } else {
          // If unauthenticated, redirect to admin login
          router.push("/admin/login")
        }
      })
      .catch(() => {})
  }, [pathname, isLoginPage, router])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/admin/login")
      router.refresh()
    } catch (e) {
      console.error("Logout failed:", e)
    }
  }

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row selection:bg-brand-teal/30">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-16 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <BrandLogo variant="sidebar" portalName="Admin" href="/admin/dashboard" />
        <div className="flex items-center gap-2">
          <ThemeToggle variant="button" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: -280 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -280 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border p-4 flex flex-col justify-between shadow-2xl md:hidden"
          >
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                <BrandLogo variant="sidebar" portalName="Admin" href="/admin/dashboard" />
                <Button variant="ghost" size="sm" onClick={() => setIsMobileOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-brand-teal/15 text-brand-ink dark:text-brand-cyan border border-brand-teal/30"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? "text-brand-teal" : ""}`} />
                        <span>{item.title}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${item.badgeColor || "bg-muted text-muted-foreground"}`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-border">
              <Button variant="outline" size="sm" onClick={handleLogout} className="w-full gap-2 justify-start text-destructive hover:bg-destructive/10">
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:flex flex-col justify-between border-r border-border bg-sidebar shrink-0 transition-all duration-300 z-30 sticky top-0 h-screen ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Top: Logo & Toggle */}
        <div>
          <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
            {!isCollapsed ? (
              <BrandLogo variant="sidebar" portalName="Admin" href="/admin/dashboard" />
            ) : (
              <BrandLogo variant="mark" href="/admin/dashboard" />
            )}
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors ml-auto"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.title : undefined}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? "bg-brand-teal/15 text-brand-ink dark:text-brand-cyan border border-brand-teal/30 shadow-sm shadow-brand-teal/10 font-semibold"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-brand-teal" : "group-hover:text-foreground"}`} />
                    {!isCollapsed && <span className="truncate">{item.title}</span>}
                  </div>
                  {!isCollapsed && item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${item.badgeColor || "bg-muted text-muted-foreground"}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Bottom User Area */}
        <div className="p-3 border-t border-sidebar-border bg-sidebar/50">
          <DropdownMenu>
            <DropdownMenuTrigger
              type="button"
              className={`w-full flex items-center gap-3 p-2 rounded-xl hover:bg-sidebar-accent text-left transition-colors select-none ${
                isCollapsed ? "justify-center" : ""
              }`}
            >
              <Avatar className="w-8 h-8 rounded-lg border border-border">
                <AvatarFallback className="bg-brand-teal/20 text-brand-teal font-bold text-xs rounded-lg">
                  {currentUser?.name ? currentUser.name.charAt(0) : "A"}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-semibold text-foreground truncate">
                    {currentUser?.name || "Administrator"}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate">
                    {currentUser?.role || "ADMIN"}
                  </span>
                </div>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl border border-border shadow-xl">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-xs font-bold leading-none">{currentUser?.name || "Admin"}</p>
                  <p className="text-[11px] leading-none text-muted-foreground truncate">
                    {currentUser?.email || "admin@techgration.live"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/admin/settings" className="cursor-pointer flex items-center w-full">
                  <Settings className="w-3.5 h-3.5 mr-2" />
                  <span>Platform Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/admin/audit-logs" className="cursor-pointer flex items-center w-full">
                  <FileText className="w-3.5 h-3.5 mr-2" />
                  <span>Audit Logs</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 cursor-pointer">
                <LogOut className="w-3.5 h-3.5 mr-2" />
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Desktop Navigation & Command Header */}
        <header className="sticky top-0 z-20 h-16 border-b border-border bg-background/80 backdrop-blur-md px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
              TechGration LMS
            </span>
            <span className="text-muted-foreground/40 font-mono">/</span>
            <span className="text-xs font-semibold text-foreground capitalize">
              {pathname.replace("/admin/", "").replace(/-/g, " ") || "Dashboard"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle variant="button" />
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hidden sm:inline-flex text-xs border-border/80 hover:border-brand-teal/40"
            >
              <Link href="/" target="_blank">
                <span>View Public Site</span>
                <ExternalLink className="w-3 h-3 ml-1.5 opacity-70" />
              </Link>
            </Button>
          </div>
        </header>

        {/* Child Pages Container */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
