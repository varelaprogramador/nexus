"use client"

import * as React from "react"
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  RefreshCw,
  Download,
  Filter,
  Search,
  Calendar,
  User,
  Globe,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppContext } from "../clientLayout"

export default function LogsPage() {
  // No início da função LogsPage, adicione:
  const { lastUpdated } = useAppContext()
  const [refreshKey, setRefreshKey] = React.useState(0)
  const [logStats, setLogStats] = React.useState({
    total: 2847,
    success: 2456,
    errors: 234,
    warnings: 157,
  })

  // Função para gerar novos dados de logs
  const generateNewLogStats = React.useCallback(() => {
    const newErrors = Math.floor(Math.random() * 20)
    const newWarnings = Math.floor(Math.random() * 15)
    const newSuccess = Math.floor(Math.random() * 100)

    setLogStats((prev) => ({
      total: prev.total + newErrors + newWarnings + newSuccess,
      success: prev.success + newSuccess,
      errors: prev.errors + newErrors,
      warnings: prev.warnings + newWarnings,
    }))
  }, [])

  // Escutar eventos de refresh
  React.useEffect(() => {
    const handleRefresh = () => {
      setRefreshKey((prev) => prev + 1)
      generateNewLogStats()
    }

    window.addEventListener("pageRefresh", handleRefresh)
    window.addEventListener("autoRefresh", handleRefresh)

    return () => {
      window.removeEventListener("pageRefresh", handleRefresh)
      window.removeEventListener("autoRefresh", handleRefresh)
    }
  }, [generateNewLogStats])

  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black p-6">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Logs do Sistema
            </h1>
            <p className="text-zinc-400 mt-2">Monitore eventos e atividades em tempo real</p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="border-zinc-700 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Atualizando..." : "Atualizar"}
            </Button>
            <Button variant="outline" className="border-zinc-700 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50 shadow-xl shadow-black/20 hover:shadow-emerald-500/10 transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm font-medium">Total de Logs</p>
                  <p className="text-3xl font-bold text-white mt-2">{logStats.total}</p>
                  <div className="flex items-center mt-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse mr-2"></div>
                    <span className="text-emerald-400 text-sm">Ao vivo</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Activity className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50 shadow-xl shadow-black/20 hover:shadow-green-500/10 transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm font-medium">Sucessos</p>
                  <p className="text-3xl font-bold text-white mt-2">{logStats.success}</p>
                  <div className="flex items-center mt-2 text-green-400 text-sm">
                    <span>{((logStats.success / logStats.total) * 100).toFixed(1)}%</span>
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
                  <p className="text-zinc-400 text-sm font-medium">Erros</p>
                  <p className="text-3xl font-bold text-white mt-2">{logStats.errors}</p>
                  <div className="flex items-center mt-2 text-red-400 text-sm">
                    <span>{((logStats.errors / logStats.total) * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50 shadow-xl shadow-black/20 hover:shadow-yellow-500/10 transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm font-medium">Avisos</p>
                  <p className="text-3xl font-bold text-white mt-2">{logStats.warnings}</p>
                  <div className="flex items-center mt-2 text-yellow-400 text-sm">
                    <span>{((logStats.warnings / logStats.total) * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <Input placeholder="Buscar nos logs..." className="pl-10 bg-zinc-900/50 border-zinc-700 text-white" />
          </div>

          <Select>
            <SelectTrigger className="w-48 bg-zinc-900/50 border-zinc-700 text-white">
              <SelectValue placeholder="Tipo de log" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700">
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="success">Sucesso</SelectItem>
              <SelectItem value="error">Erro</SelectItem>
              <SelectItem value="warning">Aviso</SelectItem>
              <SelectItem value="info">Informação</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="w-48 bg-zinc-900/50 border-zinc-700 text-white">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700">
              <SelectItem value="1h">Última hora</SelectItem>
              <SelectItem value="24h">Últimas 24h</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="border-zinc-700 bg-zinc-900/50 text-zinc-300">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>

        {/* Logs Table */}
        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50 shadow-xl shadow-black/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white text-xl flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-emerald-400" />
                  Logs Recentes
                </CardTitle>
                <CardDescription className="text-zinc-400">Eventos do sistema em tempo real</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-emerald-400 text-sm">Atualizando automaticamente</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-700/50">
                  <TableHead className="text-zinc-300 font-medium">Timestamp</TableHead>
                  <TableHead className="text-zinc-300 font-medium">Tipo</TableHead>
                  <TableHead className="text-zinc-300 font-medium">Módulo</TableHead>
                  <TableHead className="text-zinc-300 font-medium">Mensagem</TableHead>
                  <TableHead className="text-zinc-300 font-medium">Usuário</TableHead>
                  <TableHead className="text-zinc-300 font-medium">IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  {
                    timestamp: "2024-01-15 14:32:15",
                    type: "success",
                    module: "WhatsApp",
                    message: "Mensagem enviada com sucesso para +55 11 99999-9999",
                    user: "João Silva",
                    ip: "192.168.1.100",
                  },
                  {
                    timestamp: "2024-01-15 14:31:45",
                    type: "error",
                    module: "API",
                    message: "Falha na conexão com servidor externo - timeout após 30s",
                    user: "Sistema",
                    ip: "192.168.1.1",
                  },
                  {
                    timestamp: "2024-01-15 14:30:22",
                    type: "warning",
                    module: "Database",
                    message: "Conexão com banco de dados lenta - 2.5s de resposta",
                    user: "Sistema",
                    ip: "192.168.1.1",
                  },
                  {
                    timestamp: "2024-01-15 14:29:18",
                    type: "info",
                    module: "Auth",
                    message: "Usuário logado com sucesso",
                    user: "Maria Santos",
                    ip: "192.168.1.105",
                  },
                  {
                    timestamp: "2024-01-15 14:28:55",
                    type: "success",
                    module: "Campaign",
                    message: "Campanha 'Promoção Janeiro' criada com 150 destinatários",
                    user: "Pedro Costa",
                    ip: "192.168.1.102",
                  },
                  {
                    timestamp: "2024-01-15 14:27:33",
                    type: "error",
                    module: "WhatsApp",
                    message: "Instância desconectada - reconectando automaticamente",
                    user: "Sistema",
                    ip: "192.168.1.1",
                  },
                ].map((log, i) => (
                  <TableRow key={i} className="border-zinc-700/30 hover:bg-zinc-800/20 transition-colors">
                    <TableCell className="font-mono text-zinc-300 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-zinc-500" />
                        <span>{log.timestamp}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${
                          log.type === "success"
                            ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10"
                            : log.type === "error"
                              ? "border-red-500/50 text-red-400 bg-red-500/10"
                              : log.type === "warning"
                                ? "border-yellow-500/50 text-yellow-400 bg-yellow-500/10"
                                : "border-blue-500/50 text-blue-400 bg-blue-500/10"
                        }`}
                      >
                        <div className="flex items-center space-x-1">
                          {log.type === "success" && <CheckCircle className="w-3 h-3" />}
                          {log.type === "error" && <AlertCircle className="w-3 h-3" />}
                          {log.type === "warning" && <AlertTriangle className="w-3 h-3" />}
                          {log.type === "info" && <Info className="w-3 h-3" />}
                          <span className="capitalize">{log.type}</span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-zinc-600 text-zinc-300 bg-zinc-800/50">
                        {log.module}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-zinc-300 max-w-md">
                      <div className="truncate" title={log.message}>
                        {log.message}
                      </div>
                    </TableCell>
                    <TableCell className="text-zinc-300">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-zinc-500" />
                        <span>{log.user}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-zinc-400 font-mono text-sm">
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-zinc-500" />
                        <span>{log.ip}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
