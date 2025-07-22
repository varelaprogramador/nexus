"use client"
import { Plus, Wifi, WifiOff, QrCode, Settings, Trash2 } from "lucide-react"
import { useAppContext } from "../clientLayout"
import React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function InstancesPage() {
  const { lastUpdated } = useAppContext()
  const [refreshKey, setRefreshKey] = React.useState(0)
  const [instances, setInstances] = React.useState([
    {
      name: "WhatsApp Principal",
      status: "online",
      number: "+55 11 99999-9999",
      messages: 1247,
      uptime: "99.9%",
    },
    { name: "WhatsApp Vendas", status: "offline", number: "+55 11 88888-8888", messages: 856, uptime: "95.2%" },
    { name: "WhatsApp Suporte", status: "online", number: "+55 11 77777-7777", messages: 2134, uptime: "98.7%" },
  ])

  // Função para atualizar dados das instâncias
  const updateInstancesData = React.useCallback(() => {
    setInstances((prev) =>
      prev.map((instance) => ({
        ...instance,
        messages: instance.messages + Math.floor(Math.random() * 50),
        status: Math.random() > 0.1 ? "online" : "offline", // 90% chance de estar online
      })),
    )
  }, [])

  // Escutar eventos de refresh
  React.useEffect(() => {
    const handleRefresh = () => {
      setRefreshKey((prev) => prev + 1)
      updateInstancesData()
    }

    window.addEventListener("pageRefresh", handleRefresh)
    window.addEventListener("autoRefresh", handleRefresh)

    return () => {
      window.removeEventListener("pageRefresh", handleRefresh)
      window.removeEventListener("autoRefresh", handleRefresh)
    }
  }, [updateInstancesData])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Instâncias
          </h1>
          <p className="text-zinc-400 mt-2">Gerencie suas conexões WhatsApp</p>
        </div>
        <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-black font-medium shadow-lg shadow-emerald-500/25">
          <Plus className="w-4 h-4 mr-2" />
          Nova Instância
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {instances.map((instance, i) => (
          <Card
            key={i}
            className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50 shadow-xl shadow-black/20 hover:shadow-emerald-500/10 transition-all duration-300 group"
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full ${instance.status === "online" ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`}
                  ></div>
                  <CardTitle className="text-white text-lg">{instance.name}</CardTitle>
                </div>
                {instance.status === "online" ? (
                  <Wifi className="w-5 h-5 text-emerald-400" />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-400" />
                )}
              </div>
              <CardDescription className="text-zinc-400 font-mono">{instance.number}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-800/30 rounded-lg p-3">
                  <p className="text-zinc-400 text-xs">Mensagens</p>
                  <p className="text-white font-bold text-lg">{instance.messages}</p>
                </div>
                <div className="bg-zinc-800/30 rounded-lg p-3">
                  <p className="text-zinc-400 text-xs">Uptime</p>
                  <p className="text-emerald-400 font-bold text-lg">{instance.uptime}</p>
                </div>
              </div>

              <Badge
                variant={instance.status === "online" ? "default" : "destructive"}
                className={
                  instance.status === "online"
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    : "bg-red-500/20 text-red-400 border-red-500/30"
                }
              >
                {instance.status === "online" ? "Online" : "Offline"}
              </Badge>

              <div className="flex space-x-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-emerald-500/50 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 flex-1"
                >
                  <QrCode className="w-4 h-4 mr-1" />
                  QR Code
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-zinc-600 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700"
                >
                  <Settings className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-500/50 text-red-400 bg-red-500/10 hover:bg-red-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
