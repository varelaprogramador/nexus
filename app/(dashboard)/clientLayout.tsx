"use client"

import * as React from "react"
import { Inter } from "next/font/google"
import {
  BarChart3,
  Users,
  MessageSquare,
  Send,
  FileSpreadsheet,
  Zap,
  Settings,
  Bell,
  User,
  FileText,
  RefreshCw,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'


const inter = Inter({ subsets: ["latin"] })

type Page = "dashboard" | "instances" | "groups" | "contacts" | "mass-dispatch" | "xls-dispatch" | "logs"

const menuItems = [
  { id: "dashboard" as Page, label: "Dashboard", icon: BarChart3, href: "/dashboard" },
  { id: "instances" as Page, label: "Instâncias", icon: Zap, href: "/instances" },
  { id: "groups" as Page, label: "Grupos", icon: Users, href: "/groups" },
  { id: "contacts" as Page, label: "Contatos", icon: MessageSquare, href: "/contacts" },
  { id: "mass-dispatch" as Page, label: "Disparo em Massa", icon: Send, href: "/mass-dispatch" },
  { id: "xls-dispatch" as Page, label: "Disparo XLS", icon: FileSpreadsheet, href: "/xls-dispatch" },
  { id: "logs" as Page, label: "Logs", icon: FileText, href: "/logs" },
]

// Context para gerenciar estado global de loading e refresh
const AppContext = React.createContext<{
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  lastUpdated: Date
  refreshPage: () => void
}>({
  isLoading: false,
  setIsLoading: () => { },
  lastUpdated: new Date(),
  refreshPage: () => { },
})

export const useAppContext = () => React.useContext(AppContext)

// function LoadingOverlay() {
//   return (
//     <div className="fixed inset-0  z-50 flex items-center justify-center">
//       <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50 rounded-xl p-8 shadow-xl shadow-black/20">
//         <div className="flex items-center space-x-4">
//           <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
//           <div>
//             <h3 className="text-white font-semibold text-lg">Atualizando página...</h3>
//             <p className="text-zinc-400 text-sm">Carregando dados mais recentes</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

function AppSidebar() {
  const [currentPage, setCurrentPage] = React.useState<Page>("dashboard")


  React.useEffect(() => {
    const path = window.location.pathname
    const page = path.split("/")[1] as Page
    if (page && menuItems.find((item) => item.id === page)) {
      setCurrentPage(page)
    }
  }, [])

  const router = useRouter()

  const handleNavigation = async (item: (typeof menuItems)[0]) => {
    if (currentPage === item.id) return



    setCurrentPage(item.id)
    router.push(item.href) // <-- substitui pushState

  }
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  return (
    <div className="border-r border-zinc-800/50 bg-black/95 backdrop-blur-xl w-64  flex flex-col justify-between min-h-screen">

      <div className="p-6 border-b border-zinc-800/50">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <span className="text-black font-bold text-sm">NX</span>
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg">NeXus</h2>
            <p className="text-zinc-400 text-xs">WhatsApp Manager</p>
          </div>
        </div>

        {/* Status de última atualização */}
        <div className="mt-4 p-2 bg-zinc-800/30 rounded-lg border border-zinc-700/30">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-xs">Última atualização:</span>
            <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 bg-emerald-500/10 text-xs">

            </Badge>
          </div>
        </div>
      </div>

      <div className="px-3 py-4 flex-1">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item)}

              className={`group relative w-full justify-start text-left font-medium transition-all duration-200 hover:bg-zinc-800/50 rounded-lg px-3 py-2.5 flex items-center disabled:opacity-50 disabled:cursor-not-allowed ${currentPage === item.id
                ? "bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-400 border-r-2 border-emerald-400"
                : "text-white"
                }`}
            >
              <item.icon
                className={`w-5 h-5 transition-transform group-hover:scale-110 `}
              />
              <span className="ml-3">{item.label}</span>
              {currentPage === item.id && (
                <div className="absolute right-2 w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-zinc-800/50">
        <div className="flex items-center space-x-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
          <Avatar className="w-8 h-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" />
            <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-cyan-400 text-black text-xs font-bold">
              US
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-sm truncate">Admin User</p>
            <p className="text-zinc-400 text-xs">admin@nexus.com</p>
          </div>
          <Button size="sm" variant="ghost" className="w-8 h-8 p-0 text-zinc-400 hover:text-white">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // const [isLoading, setIsLoading] = React.useState(false)
  // const [lastUpdated, setLastUpdated] = React.useState(new Date())

  // const refreshPage = React.useCallback(() => {
  //   setLastUpdated(new Date())
  //   // Disparar evento customizado para que as páginas possam se atualizar
  //   window.dispatchEvent(new CustomEvent("pageRefresh", { detail: { timestamp: new Date() } }))
  // }, [])

  // const contextValue = React.useMemo(
  //   () => ({
  //     isLoading,
  //     setIsLoading,
  //     lastUpdated,
  //     refreshPage,
  //   }),
  //   [isLoading, lastUpdated, refreshPage],
  // )

  // Instância do QueryClient
  const [queryClient] = React.useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>

      <div className="bg-black grid grid-cols-[256px_1fr] relative h-screen">


        {/* Sidebar fixo */}
        <div className="h-screen sticky top-0 left-0 z-40">
          <AppSidebar />
        </div>
        <div className="flex flex-col h-screen">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-zinc-800/50 px-6 bg-black/95 backdrop-blur-xl ">
            <div className="flex items-center space-x-4 ml-auto">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-emerald-400 text-sm font-medium">Online</span>
              </div>
              <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800/50">
                <Bell className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800/50">
                <User className="w-4 h-4" />
              </Button>
            </div>
          </header>
          {/* Conteúdo scrollável */}
          <div className="flex flex-1 flex-col gap-4 p-6 bg-gradient-to-br from-black via-zinc-950 to-black overflow-y-auto h-[calc(100vh-4rem)]">
            {/* {isLoading && <LoadingOverlay />} */}
            {children}
          </div>
        </div>
      </div>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
