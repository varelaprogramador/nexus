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
  Eye,
  Clock,
  Server,
  Copy,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppContext } from "../clientLayout"
import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"

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

  const [logs, setLogs] = useState<any[]>([])
  const [loadingLogs, setLoadingLogs] = useState(true)
  const { user } = useUser()
  const userId = user?.id
  const [selectedLog, setSelectedLog] = useState<any | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => {
    const fetchLogs = async () => {
      setLoadingLogs(true)
      try {
        const url = userId ? `/api/log?userId=${userId}` : "/api/log"
        const res = await fetch(url)
        const data = await res.json()
        setLogs(data.logs || [])
      } catch (e) {
        setLogs([])
      } finally {
        setLoadingLogs(false)
      }
    }
    fetchLogs()
  }, [refreshKey, userId])

  // KPIs dinâmicos a partir dos logs reais
  const total = logs.length
  const success = logs.filter((l) => l.type === "success" || l.status === "sucesso").length
  const errors = logs.filter((l) => l.type === "error" || l.status === "erro").length
  const warnings = logs.filter((l) => l.type === "warning" || l.status === "warning").length

  const percent = (value: number) => (total > 0 ? ((value / total) * 100).toFixed(1) : "0")

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getLogTypeIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-emerald-400" />
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-400" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      default:
        return <Info className="w-4 h-4 text-blue-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sucesso":
        return "border-emerald-500/50 text-emerald-400 bg-emerald-500/10"
      case "erro":
        return "border-red-500/50 text-red-400 bg-red-500/10"
      default:
        return "border-zinc-600 text-zinc-300 bg-zinc-800/50"
    }
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
                  <p className="text-3xl font-bold text-white mt-2">{total}</p>
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
                  <p className="text-3xl font-bold text-white mt-2">{success}</p>
                  <div className="flex items-center mt-2 text-green-400 text-sm">
                    <span>{percent(success)}%</span>
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
                  <p className="text-3xl font-bold text-white mt-2">{errors}</p>
                  <div className="flex items-center mt-2 text-red-400 text-sm">
                    <span>{percent(errors)}%</span>
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
                  <p className="text-3xl font-bold text-white mt-2">{warnings}</p>
                  <div className="flex items-center mt-2 text-yellow-400 text-sm">
                    <span>{percent(warnings)}%</span>
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
                  <TableHead className="text-zinc-300 font-medium">Destinatário</TableHead>
                  <TableHead className="text-zinc-300 font-medium">Status</TableHead>
                  <TableHead className="text-zinc-300 font-medium">Mensagem</TableHead>
                  <TableHead className="text-zinc-300 font-medium">Usuário</TableHead>
                  <TableHead className="text-zinc-300 font-medium">IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingLogs ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-zinc-400">
                      Carregando logs...
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-zinc-400">
                      Nenhum log encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log, i) => (
                    <TableRow key={log.id || i} className="border-zinc-700/30 hover:bg-zinc-800/20 transition-colors">
                      <TableCell className="font-mono text-zinc-300 text-sm">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-zinc-500" />
                          <span>{new Date(log.createdAt).toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${log.type === "success"
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
                          {log.numero || "-"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(log.status)}>
                          {log.status || "-"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-zinc-300 max-w-md">
                        <div className="truncate" title={log.mensagem}>
                          {log.mensagem}
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-300">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-zinc-500" />
                          <span>{log.userName || "-"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-400 font-mono text-sm">
                        <div className="flex items-center space-x-2">
                          <Globe className="w-4 h-4 text-zinc-500" />
                          <span>{log.userIp || "-"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedLog(log)
                            setSheetOpen(true)
                          }}
                        >
                          <Eye className="w-5 h-5 text-zinc-400 hover:text-emerald-400" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Modern Sheet para exibir detalhes do log */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full max-w-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border-zinc-700/50 shadow-2xl">
          <SheetHeader className="pb-6 border-b border-zinc-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {selectedLog && getLogTypeIcon(selectedLog.type)}
                <div>
                  <SheetTitle className="text-xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                    Detalhes do Log
                  </SheetTitle>
                  <p className="text-zinc-400 text-sm mt-1">
                    {selectedLog && new Date(selectedLog.createdAt).toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-emerald-400 text-xs">Tempo real</span>
              </div>
            </div>
          </SheetHeader>

          {selectedLog && (
            <ScrollArea className="h-[calc(100vh-120px)] pr-4">
              <div className="space-y-6 py-6">
                {/* Status Overview */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-gradient-to-br from-zinc-800/50 to-zinc-700/30 border-zinc-600/50">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center">
                          <Activity className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-zinc-400 text-xs font-medium">Status</p>
                          <Badge variant="outline" className={getStatusColor(selectedLog.status)}>
                            {selectedLog.status || "N/A"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-zinc-800/50 to-zinc-700/30 border-zinc-600/50">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                          <Clock className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-zinc-400 text-xs font-medium">Tipo</p>
                          <Badge
                            variant="outline"
                            className={
                              selectedLog.type === "success"
                                ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10"
                                : selectedLog.type === "error"
                                  ? "border-red-500/50 text-red-400 bg-red-500/10"
                                  : selectedLog.type === "warning"
                                    ? "border-yellow-500/50 text-yellow-400 bg-yellow-500/10"
                                    : "border-blue-500/50 text-blue-400 bg-blue-500/10"
                            }
                          >
                            {selectedLog.type}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Message Section */}
                <Card className="bg-gradient-to-br from-zinc-800/50 to-zinc-700/30 border-zinc-600/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-sm flex items-center">
                      <Info className="w-4 h-4 mr-2 text-blue-400" />
                      Mensagem
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-700/30">
                      <p className="text-zinc-300 text-sm leading-relaxed">
                        {selectedLog.mensagem || "Nenhuma mensagem disponível"}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-zinc-400 hover:text-emerald-400"
                        onClick={() => copyToClipboard(selectedLog.mensagem || "")}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copiar
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* User Information */}
                <Card className="bg-gradient-to-br from-zinc-800/50 to-zinc-700/30 border-zinc-600/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-sm flex items-center">
                      <User className="w-4 h-4 mr-2 text-purple-400" />
                      Informações do Usuário
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-zinc-700/30">
                      <span className="text-zinc-400 text-sm">Nome</span>
                      <span className="text-zinc-300 text-sm font-medium">{selectedLog.userName || "N/A"}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-zinc-700/30">
                      <span className="text-zinc-400 text-sm">IP Address</span>
                      <div className="flex items-center space-x-2">
                        <Globe className="w-3 h-3 text-zinc-500" />
                        <span className="text-zinc-300 text-sm font-mono">{selectedLog.userIp || "N/A"}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-zinc-400 hover:text-emerald-400"
                          onClick={() => copyToClipboard(selectedLog.userIp || "")}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-zinc-400 text-sm">Destinatário</span>
                      <span className="text-zinc-300 text-sm font-medium">{selectedLog.numero || "N/A"}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Technical Details */}
                <Card className="bg-gradient-to-br from-zinc-800/50 to-zinc-700/30 border-zinc-600/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-sm flex items-center">
                      <Server className="w-4 h-4 mr-2 text-orange-400" />
                      Detalhes Técnicos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="bg-zinc-900/50 rounded-lg border border-zinc-700/30 overflow-hidden">
                      <div className="max-h-64 overflow-y-auto">
                        {Object.entries(selectedLog)
                          .filter(
                            ([key]) =>
                              !["mensagem", "userName", "userIp", "numero", "type", "status", "createdAt"].includes(
                                key,
                              ),
                          )
                          .map(([key, value], index) => (
                            <div
                              key={key}
                              className={`flex items-start gap-4 p-3 ${index % 2 === 0 ? "bg-zinc-800/20" : ""}`}
                            >
                              <span className="text-zinc-400 text-xs font-medium min-w-[100px] uppercase tracking-wide">
                                {key}
                              </span>
                              <div className="flex-1 flex items-center justify-between">
                                <span className="text-zinc-300 text-sm break-all font-mono">
                                  {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-zinc-400 hover:text-emerald-400 ml-2"
                                  onClick={() =>
                                    copyToClipboard(
                                      typeof value === "object" ? JSON.stringify(value, null, 2) : String(value),
                                    )
                                  }
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 border-zinc-600 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700/50"
                    onClick={() => copyToClipboard(JSON.stringify(selectedLog, null, 2))}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar JSON
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-zinc-600 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700/50"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver Contexto
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
