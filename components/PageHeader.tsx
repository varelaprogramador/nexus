"use client"

import * as React from "react"
import { RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAppContext } from "../app/clientLayout"

interface PageHeaderProps {
  title: string
  description: string
  children?: React.ReactNode
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  const { lastUpdated } = useAppContext()
  const [showUpdateIndicator, setShowUpdateIndicator] = React.useState(false)

  React.useEffect(() => {
    setShowUpdateIndicator(true)
    const timer = setTimeout(() => setShowUpdateIndicator(false), 2000)
    return () => clearTimeout(timer)
  }, [lastUpdated])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-center space-x-3">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            {title}
          </h1>
          {showUpdateIndicator && (
            <div className="flex items-center space-x-2 animate-fade-in">
              <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">Atualizado</Badge>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4 mt-2">
          <p className="text-zinc-400">{description}</p>
          <Badge variant="outline" className="border-zinc-600 text-zinc-400 text-xs">
            Última atualização: {formatTime(lastUpdated)}
          </Badge>
        </div>
      </div>
      {children}
    </div>
  )
}
