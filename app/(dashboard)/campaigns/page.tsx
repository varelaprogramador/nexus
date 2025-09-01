"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, Users, Send, Pause, Play, Trash2, BarChart3, AlertCircle, CheckCircle, XCircle, Plus, Target, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useInstances } from "@/hooks/use-instances"
import { toast } from "sonner"
import { useUser } from "@clerk/nextjs"

interface Campaign {
  id: string
  name: string
  description: string
  instance: string
  status: "rascunho" | "agendada" | "executando" | "pausada" | "concluida" | "cancelada"
  scheduledAt?: Date
  createdAt: Date
  updatedAt: Date
  totalContacts: number
  sentCount: number
  deliveredCount: number
  failedCount: number
  messageBlocks: any[]
  contacts: string[]
  userId: string
}

export default function CampaignsPage() {
  const { user } = useUser()
  const { data: instances = [] } = useInstances()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    description: "",
    instance: "",
    scheduledAt: ""
  })

  // Carregar campanhas do usuário
  useEffect(() => {
    if (user?.id) {
      loadCampaigns()
    }
  }, [user?.id])

  const loadCampaigns = async () => {
    try {
      const response = await fetch(`/api/campaigns?userId=${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setCampaigns(data.campaigns || [])
      }
    } catch (error) {
      console.error("Erro ao carregar campanhas:", error)
    }
  }

  const createCampaign = async () => {
    if (!newCampaign.name || !newCampaign.instance) {
      toast.error("Preencha nome e instância")
      return
    }

    try {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newCampaign,
          userId: user?.id,
          scheduledAt: newCampaign.scheduledAt ? new Date(newCampaign.scheduledAt) : null
        })
      })

      if (response.ok) {
        toast.success("Campanha criada com sucesso!")
        setShowCreateDialog(false)
        setNewCampaign({ name: "", description: "", instance: "", scheduledAt: "" })
        loadCampaigns()
      } else {
        toast.error("Erro ao criar campanha")
      }
    } catch (error) {
      toast.error("Erro ao criar campanha")
    }
  }

  const deleteCampaign = async (campaignId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta campanha?")) return

    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: "DELETE"
      })

      if (response.ok) {
        toast.success("Campanha excluída")
        loadCampaigns()
      } else {
        toast.error("Erro ao excluir campanha")
      }
    } catch (error) {
      toast.error("Erro ao excluir campanha")
    }
  }

  const startCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/start`, {
        method: "POST"
      })

      if (response.ok) {
        toast.success("Campanha iniciada!")
        loadCampaigns()
      } else {
        toast.error("Erro ao iniciar campanha")
      }
    } catch (error) {
      toast.error("Erro ao iniciar campanha")
    }
  }

  const pauseCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/pause`, {
        method: "POST"
      })

      if (response.ok) {
        toast.success("Campanha pausada")
        loadCampaigns()
      } else {
        toast.error("Erro ao pausar campanha")
      }
    } catch (error) {
      toast.error("Erro ao pausar campanha")
    }
  }

  const getStatusIcon = (status: Campaign["status"]) => {
    switch (status) {
      case "rascunho":
        return <AlertCircle className="w-4 h-4 text-zinc-400" />
      case "agendada":
        return <Clock className="w-4 h-4 text-blue-400" />
      case "executando":
        return <Play className="w-4 h-4 text-emerald-400 animate-pulse" />
      case "pausada":
        return <Pause className="w-4 h-4 text-yellow-400" />
      case "concluida":
        return <CheckCircle className="w-4 h-4 text-emerald-400" />
      case "cancelada":
        return <XCircle className="w-4 h-4 text-red-400" />
      default:
        return <AlertCircle className="w-4 h-4 text-zinc-400" />
    }
  }

  const getStatusColor = (status: Campaign["status"]) => {
    switch (status) {
      case "rascunho":
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/50"
      case "agendada":
        return "bg-blue-500/10 text-blue-400 border-blue-500/50"
      case "executando":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/50"
      case "pausada":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/50"
      case "concluida":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/50"
      case "cancelada":
        return "bg-red-500/10 text-red-400 border-red-500/50"
      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/50"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Campanhas
          </h1>
          <p className="text-zinc-400 mt-1">Gerencie seus disparos em massa com execução em background</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Campanha
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-700">
            <DialogHeader>
              <DialogTitle className="text-white">Criar Nova Campanha</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Configure uma nova campanha de disparo em massa
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-zinc-300">Nome da Campanha</Label>
                <Input
                  placeholder="Ex: Promoção Black Friday"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                  className="bg-zinc-800 border-zinc-600 text-white"
                />
              </div>
              <div>
                <Label className="text-zinc-300">Descrição (opcional)</Label>
                <Textarea
                  placeholder="Descreva o objetivo da campanha..."
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})}
                  className="bg-zinc-800 border-zinc-600 text-white"
                />
              </div>
              <div>
                <Label className="text-zinc-300">Instância</Label>
                <Select value={newCampaign.instance} onValueChange={(value) => setNewCampaign({...newCampaign, instance: value})}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white">
                    <SelectValue placeholder="Selecione uma instância" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-600">
                    {instances.map((inst: any) => (
                      <SelectItem key={inst.id} value={inst.name}>
                        {inst.profileName || inst.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-zinc-300">Agendar para (opcional)</Label>
                <Input
                  type="datetime-local"
                  value={newCampaign.scheduledAt}
                  onChange={(e) => setNewCampaign({...newCampaign, scheduledAt: e.target.value})}
                  className="bg-zinc-800 border-zinc-600 text-white"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button onClick={createCampaign} className="bg-emerald-600 hover:bg-emerald-700 flex-1">
                  Criar Campanha
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="border-zinc-600 text-zinc-300">
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Total</p>
                <p className="text-white font-semibold text-lg">{campaigns.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Play className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Ativas</p>
                <p className="text-white font-semibold text-lg">
                  {campaigns.filter(c => c.status === "executando").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Agendadas</p>
                <p className="text-white font-semibold text-lg">
                  {campaigns.filter(c => c.status === "agendada").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Concluídas</p>
                <p className="text-white font-semibold text-lg">
                  {campaigns.filter(c => c.status === "concluida").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Campanhas */}
      <div className="grid gap-4">
        {campaigns.length === 0 ? (
          <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50">
            <CardContent className="p-12 text-center">
              <Target className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
              <h3 className="text-xl font-semibold text-white mb-2">Nenhuma campanha criada</h3>
              <p className="text-zinc-400 mb-4">Crie sua primeira campanha para disparos em background</p>
              <Button onClick={() => setShowCreateDialog(true)} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Campanha
              </Button>
            </CardContent>
          </Card>
        ) : (
          campaigns.map((campaign) => (
            <Card key={campaign.id} className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50 hover:border-zinc-600/50 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white font-semibold text-lg">{campaign.name}</h3>
                      <Badge className={`${getStatusColor(campaign.status)} border text-xs`}>
                        {getStatusIcon(campaign.status)}
                        <span className="ml-1 capitalize">{campaign.status}</span>
                      </Badge>
                    </div>
                    {campaign.description && (
                      <p className="text-zinc-400 text-sm mb-3">{campaign.description}</p>
                    )}
                    <div className="flex items-center gap-6 text-sm text-zinc-400">
                      <div className="flex items-center gap-1">
                        <Zap className="w-4 h-4" />
                        <span>{campaign.instance}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{campaign.totalContacts} contatos</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Send className="w-4 h-4" />
                        <span>{campaign.sentCount}/{campaign.totalContacts} enviados</span>
                      </div>
                      {campaign.scheduledAt && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(campaign.scheduledAt).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    {campaign.totalContacts > 0 && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-zinc-400 mb-1">
                          <span>Progresso</span>
                          <span>{Math.round((campaign.sentCount / campaign.totalContacts) * 100)}%</span>
                        </div>
                        <div className="w-full bg-zinc-800 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full transition-all"
                            style={{ width: `${(campaign.sentCount / campaign.totalContacts) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    {campaign.status === "rascunho" && (
                      <Button 
                        onClick={() => startCampaign(campaign.id)}
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Iniciar
                      </Button>
                    )}
                    {campaign.status === "executando" && (
                      <Button 
                        onClick={() => pauseCampaign(campaign.id)}
                        size="sm"
                        variant="outline"
                        className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/10"
                      >
                        <Pause className="w-4 h-4 mr-1" />
                        Pausar
                      </Button>
                    )}
                    {campaign.status === "pausada" && (
                      <Button 
                        onClick={() => startCampaign(campaign.id)}
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Retomar
                      </Button>
                    )}
                    <Button 
                      onClick={() => deleteCampaign(campaign.id)}
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}