"use client"

import * as React from "react"
import {
  BarChart3,
  Users,
  MessageSquare,
  Send,
  FileSpreadsheet,
  Settings,
  Plus,
  Upload,
  Eye,
  Edit,
  Trash2,
  Play,
  Clock,
  CheckCircle,
  XCircle,
  Wifi,
  WifiOff,
  QrCode,
  TrendingUp,
  Activity,
  Zap,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Filter,
  Search,
  Bell,
  User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"

import AppSidebar from "@/components/AppSidebar" // Import AppSidebar component
import { useAppContext } from "../clientLayout"

type Page = "dashboard" | "instances" | "groups" | "contacts" | "mass-dispatch" | "xls-dispatch"

const menuItems = [
  { id: "dashboard" as Page, label: "Dashboard", icon: BarChart3 },
  { id: "instances" as Page, label: "Instâncias", icon: Zap },
  { id: "groups" as Page, label: "Grupos", icon: Users },
  { id: "contacts" as Page, label: "Contatos", icon: MessageSquare },
  { id: "mass-dispatch" as Page, label: "Disparo em Massa", icon: Send },
  { id: "xls-dispatch" as Page, label: "Disparo XLS", icon: FileSpreadsheet },
]

export default function DashboardPage() {
  const { lastUpdated } = useAppContext()
  const [refreshKey, setRefreshKey] = React.useState(0)
  const [stats, setStats] = React.useState({
    totalSent: 12847,
    delivered: 11923,
    failed: 924,
    activeContacts: 8456,
  })

  // Função para gerar novos dados simulados
  const generateNewStats = React.useCallback(() => {
    setStats((prev) => ({
      totalSent: prev.totalSent + Math.floor(Math.random() * 100),
      delivered: prev.delivered + Math.floor(Math.random() * 80),
      failed: prev.failed + Math.floor(Math.random() * 10),
      activeContacts: prev.activeContacts + Math.floor(Math.random() * 50),
    }))
  }, [])

  // Escutar eventos de refresh
  React.useEffect(() => {
    const handleRefresh = () => {
      setRefreshKey((prev) => prev + 1)
      generateNewStats()
    }

    window.addEventListener("pageRefresh", handleRefresh)
    window.addEventListener("autoRefresh", handleRefresh)

    return () => {
      window.removeEventListener("pageRefresh", handleRefresh)
      window.removeEventListener("autoRefresh", handleRefresh)
    }
  }, [generateNewStats])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-zinc-400 mt-2">Visão geral das suas campanhas e performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="border-zinc-700 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-black font-medium shadow-lg shadow-emerald-500/25">
            <Plus className="w-4 h-4 mr-2" />
            Nova Campanha
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50 shadow-xl shadow-black/20 hover:shadow-emerald-500/10 transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm font-medium">Total Enviadas</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.totalSent}</p>
                <div className="flex items-center mt-2 text-emerald-400 text-sm">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  <span>+12.5%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Send className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50 shadow-xl shadow-black/20 hover:shadow-green-500/10 transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm font-medium">Entregues</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.delivered}</p>
                <div className="flex items-center mt-2 text-green-400 text-sm">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  <span>+8.2%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50 shadow-xl shadow-black/20 hover:shadow-red-500/10 transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm font-medium">Falhas</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.failed}</p>
                <div className="flex items-center mt-2 text-red-400 text-sm">
                  <ArrowDownRight className="w-4 h-4 mr-1" />
                  <span>-2.1%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <XCircle className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50 shadow-xl shadow-black/20 hover:shadow-blue-500/10 transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm font-medium">Contatos Ativos</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.activeContacts}</p>
                <div className="flex items-center mt-2 text-blue-400 text-sm">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  <span>+15.3%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50 shadow-xl shadow-black/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white text-xl">Performance por Grupo</CardTitle>
                <CardDescription className="text-zinc-400">Distribuição de mensagens enviadas</CardDescription>
              </div>
              <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-white">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center relative">
              <div className="w-40 h-40 rounded-full border-8 border-gradient-to-r from-emerald-400 to-cyan-400 flex items-center justify-center relative">
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 backdrop-blur-sm"></div>
                <div className="text-center z-10">
                  <p className="text-2xl font-bold text-white">92%</p>
                  <p className="text-xs text-zinc-400">Taxa de Sucesso</p>
                </div>
              </div>
              <div className="absolute top-4 right-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  <span className="text-sm text-zinc-300">Marketing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
                  <span className="text-sm text-zinc-300">Vendas</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                  <span className="text-sm text-zinc-300">Suporte</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50 shadow-xl shadow-black/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white text-xl">Disparos Recentes</CardTitle>
                <CardDescription className="text-zinc-400">Últimas 7 campanhas</CardDescription>
              </div>
              <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-white">
                <TrendingUp className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between space-x-2 p-4">
              {[65, 45, 80, 55, 90, 70, 85].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center space-y-2">
                  <div
                    className="w-full bg-gradient-to-t from-emerald-500 to-cyan-400 rounded-t-lg transition-all duration-500 hover:from-emerald-400 hover:to-cyan-300"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-zinc-400">{i + 1}d</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50 shadow-xl shadow-black/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-xl flex items-center">
                <Activity className="w-5 h-5 mr-2 text-emerald-400" />
                Atividade Recente
              </CardTitle>
              <CardDescription className="text-zinc-400">Últimos disparos e eventos</CardDescription>
            </div>
            <Button size="sm" variant="outline" className="border-zinc-700 bg-zinc-800/50 text-zinc-300">
              Ver Todos
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { time: "14:30", group: "Grupo Marketing", status: "entregue", count: 150, user: "João Silva" },
              { time: "13:15", group: "Grupo Vendas", status: "falhou", count: 45, user: "Maria Santos" },
              { time: "12:00", group: "Grupo Suporte", status: "entregue", count: 89, user: "Pedro Costa" },
              { time: "11:45", group: "Grupo Premium", status: "entregue", count: 234, user: "Ana Lima" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-xl border border-zinc-700/30 hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-zinc-700 to-zinc-600 rounded-lg flex items-center justify-center">
                    <span className="text-emerald-400 font-mono text-sm">{item.time}</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{item.group}</p>
                    <p className="text-zinc-400 text-sm">por {item.user}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge
                    variant={item.status === "entregue" ? "default" : "destructive"}
                    className={
                      item.status === "entregue"
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        : "bg-red-500/20 text-red-400 border-red-500/30"
                    }
                  >
                    {item.status}
                  </Badge>
                  <span className="text-zinc-400 text-sm font-medium">{item.count} msgs</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
