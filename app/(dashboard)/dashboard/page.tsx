"use client"

import * as React from "react"
import {

  Users,

  Send,

  Plus,

  CheckCircle,
  XCircle,

  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Filter

} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useUser } from "@clerk/nextjs"


export default function DashboardPage() {
  const { user } = useUser()
  const [logs, setLogs] = useState<any[]>([])
  const [loadingLogs, setLoadingLogs] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      if (!user?.id) return
      
      setLoadingLogs(true)
      try {
        const res = await fetch(`/api/log?userId=${user.id}`)
        const data = await res.json()
        setLogs(data.logs || [])
      } catch (e) {
        setLogs([])
      } finally {
        setLoadingLogs(false)
      }
    }
    fetchLogs()
  }, [user?.id])

  // KPIs dinâmicos a partir dos logs reais
  const totalSent = logs.length
  const delivered = logs.filter(l => l.status === 'sucesso' || l.type === 'success').length
  const failed = logs.filter(l => l.status === 'erro' || l.type === 'error').length
  const activeContacts = new Set(logs.map(l => l.numero)).size

  // Porcentagens reais
  const percent = (value: number) => totalSent > 0 ? ((value / totalSent) * 100).toFixed(1) : '0'
  const successRate = percent(delivered)
  const failRate = percent(failed)

  // Atividade recente: últimos 7 logs
  const recentActivity = logs.slice(0, 7)

  // Gerar dados para o gráfico de barras (disparos por dia, últimos 7 dias)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d
  })
  const barData = days.map(day => {
    const dayStr = day.toLocaleDateString()
    const count = logs.filter(l => new Date(l.createdAt).toLocaleDateString() === dayStr).length
    return { day: dayStr, disparos: count }
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-zinc-400 mt-2">Visão geral das suas campanhas e performance</p>
        </div>

      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50 shadow-xl shadow-black/20 hover:shadow-emerald-500/10 transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm font-medium">Total Enviadas</p>
                <p className="text-3xl font-bold text-white mt-2">{totalSent}</p>
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
                <p className="text-3xl font-bold text-white mt-2">{delivered}</p>
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
                <p className="text-3xl font-bold text-white mt-2">{failed}</p>
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
                <p className="text-3xl font-bold text-white mt-2">{activeContacts}</p>
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
                  <p className="text-2xl font-bold text-white">{successRate}%</p>
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
                <CardTitle className="text-white text-xl">Disparos por Dia</CardTitle>
                <CardDescription className="text-zinc-400">Evolução dos disparos nos últimos 7 dias</CardDescription>
              </div>
              <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-white">
                <TrendingUp className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="day" stroke="#aaa" fontSize={12} />
                  <YAxis stroke="#aaa" fontSize={12} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a', color: '#fff' }} />
                  <Bar dataKey="disparos" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
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
            {recentActivity.map((log, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-xl border border-zinc-700/30 hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-zinc-700 to-zinc-600 rounded-lg flex items-center justify-center">
                    <span className="text-emerald-400 font-mono text-sm">{new Date(log.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{log.numero}</p>
                    <p className="text-zinc-400 text-sm">por {log.userName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge
                    variant={log.status === "sucesso" || log.type === "success" ? "default" : "destructive"}
                    className={
                      log.status === "sucesso" || log.type === "success"
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        : "bg-red-500/20 text-red-400 border-red-500/30"
                    }
                  >
                    {log.status}
                  </Badge>
                  <span className="text-zinc-400 text-sm font-medium">{log.count} msgs</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
