"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Users, MessageSquare, Send, FileSpreadsheet, Zap, Activity } from "lucide-react"

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
} from "@/components/ui/sidebar"

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3, href: "/dashboard" },
  { id: "instances", label: "Instâncias", icon: Zap, href: "/instances" },
  { id: "groups", label: "Grupos", icon: Users, href: "/groups" },
  { id: "contacts", label: "Contatos", icon: MessageSquare, href: "/contacts" },
  { id: "mass-dispatch", label: "Disparo em Massa", icon: Send, href: "/mass-dispatch" },
  { id: "xls-dispatch", label: "Disparo XLS", icon: FileSpreadsheet, href: "/xls-dispatch" },
  { id: "logs", label: "Logs", icon: Activity, href: "/logs" },
]

export default function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r border-zinc-800/50 bg-black/95 backdrop-blur-xl">
      <SidebarHeader className="p-6 border-b border-zinc-800/50">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            NeXus
          </h2>
          <p className="text-zinc-400 text-sm">WhatsApp Manager</p>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-zinc-400 text-xs uppercase tracking-wider mb-2">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    className="group relative w-full justify-start text-left font-medium transition-all duration-200 hover:bg-zinc-800/50 rounded-lg px-3 py-2.5 flex items-center"
                  >
                    <Link href={item.href}>
                      <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                      <span className="ml-3">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-zinc-800/50">
        <div className="text-center">
          <p className="text-zinc-500 text-xs">© 2024 NeXus v2.0</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
