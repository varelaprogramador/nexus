"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, Users, Send, Pause, Play, Trash2, BarChart3, AlertCircle, CheckCircle, XCircle, Plus, Target, Zap, Edit, UserPlus, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useInstances } from "@/hooks/use-instances"
import { useContacts } from "../contacts/page"
import { toast } from "sonner"
import { useUser } from "@clerk/nextjs"

interface Campaign {
  id: string
  name: string
  description: string
  instance: string
  status: "draft" | "scheduled" | "running" | "paused" | "completed" | "cancelled"
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
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showContactsDialog, setShowContactsDialog] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [selectedContacts, setSelectedContacts] = useState<any[]>([])
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    description: "",
    instance: "",
    scheduledAt: ""
  })
  const [newCampaignContacts, setNewCampaignContacts] = useState<any[]>([])
  const [showNewCampaignContacts, setShowNewCampaignContacts] = useState(false)

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

  const openEditDialog = (campaign: Campaign) => {
    setEditingCampaign(campaign)
    setShowEditDialog(true)
  }

  const openContactsDialog = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    // Converter contatos existentes para formato esperado
    const existingContacts = Array.isArray(campaign.contacts) ? campaign.contacts : []
    setSelectedContacts(
      existingContacts.map(contact => {
        if (typeof contact === 'string') {
          return {
            id: contact,
            name: 'Contato',
            phone: contact
          }
        }
        return {
          id: (contact as any).id || (contact as any).phone || '',
          name: (contact as any).name || 'Contato',
          phone: (contact as any).phone || (contact as any).id || ''
        }
      })
    )
    setShowContactsDialog(true)
  }

  const updateCampaign = async () => {
    if (!editingCampaign) return

    try {
      const response = await fetch(`/api/campaigns/${editingCampaign.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingCampaign.name,
          description: editingCampaign.description,
          instance: editingCampaign.instance,
          scheduledAt: editingCampaign.scheduledAt ? new Date(editingCampaign.scheduledAt) : null
        })
      })

      if (response.ok) {
        toast.success("Campanha atualizada com sucesso!")
        setShowEditDialog(false)
        setEditingCampaign(null)
        loadCampaigns()
      } else {
        toast.error("Erro ao atualizar campanha")
      }
    } catch (error) {
      toast.error("Erro ao atualizar campanha")
    }
  }

  const updateCampaignContacts = async () => {
    if (!selectedCampaign) return

    try {
      const response = await fetch(`/api/campaigns/${selectedCampaign.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contacts: selectedContacts,
          totalContacts: selectedContacts.length
        })
      })

      if (response.ok) {
        toast.success("Contatos atualizados com sucesso!")
        setShowContactsDialog(false)
        setSelectedCampaign(null)
        setSelectedContacts([])
        loadCampaigns()
      } else {
        toast.error("Erro ao atualizar contatos")
      }
    } catch (error) {
      toast.error("Erro ao atualizar contatos")
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
          scheduledAt: newCampaign.scheduledAt ? new Date(newCampaign.scheduledAt) : null,
          contacts: newCampaignContacts,
          totalContacts: newCampaignContacts.length
        })
      })

      if (response.ok) {
        toast.success("Campanha criada com sucesso!")
        setShowCreateDialog(false)
        setNewCampaign({ name: "", description: "", instance: "", scheduledAt: "" })
        setNewCampaignContacts([])
        setShowNewCampaignContacts(false)
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
      case "draft":
        return <AlertCircle className="w-4 h-4 text-zinc-400" />
      case "scheduled":
        return <Clock className="w-4 h-4 text-blue-400" />
      case "running":
        return <Play className="w-4 h-4 text-emerald-400 animate-pulse" />
      case "paused":
        return <Pause className="w-4 h-4 text-yellow-400" />
      case "completed":
        return <CheckCircle className="w-4 h-4 text-emerald-400" />
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-400" />
      default:
        return <AlertCircle className="w-4 h-4 text-zinc-400" />
    }
  }

  const getStatusColor = (status: Campaign["status"]) => {
    switch (status) {
      case "draft":
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/50"
      case "scheduled":
        return "bg-blue-500/10 text-blue-400 border-blue-500/50"
      case "running":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/50"
      case "paused":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/50"
      case "completed":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/50"
      case "cancelled":
        return "bg-red-500/10 text-red-400 border-red-500/50"
      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/50"
    }
  }

  const getStatusText = (status: Campaign["status"]) => {
    const statusMap = {
      "draft": "Rascunho",
      "scheduled": "Agendada",
      "running": "Executando",
      "paused": "Pausada",
      "completed": "Concluída",
      "cancelled": "Cancelada"
    }
    return statusMap[status] || status
  }

  // Componente para selecionar contatos (para campanha existente)
  const ContactSelector = () => {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedGroup, setSelectedGroup] = useState<string>("all")
    const [allContacts, setAllContacts] = useState<any[]>([])

    const instanceName = selectedCampaign?.instance || ""
    const apikey = process.env.NEXT_PUBLIC_EVOLUTION_API_KEY || ""

    const { data: contactsData, isLoading } = useContacts(instanceName, apikey, true, 100, 0)

    useEffect(() => {
      if (contactsData?.contacts) {
        setAllContacts(contactsData.contacts)
      }
    }, [contactsData])

    const groups: string[] = Array.from(new Set(allContacts.map((c) => c.group).filter((g): g is string => Boolean(g))))

    const filteredContacts = allContacts.filter((contact) => {
      const name = (contact.pushName || '').toLowerCase()
      const phone = (contact.remoteJid || '').toLowerCase()
      const matchesSearch = name.includes(searchTerm.toLowerCase()) || phone.includes(searchTerm)
      const matchesGroup = selectedGroup === "all" || contact.group === selectedGroup
      return matchesSearch && matchesGroup
    })

    const toggleContact = (contact: any) => {
      const contactData = {
        id: contact.id || contact.remoteJid,
        name: contact.pushName || 'Contato',
        phone: contact.remoteJid
      }

      const isSelected = selectedContacts.some((c) => c.id === contactData.id)
      if (isSelected) {
        setSelectedContacts(selectedContacts.filter((c) => c.id !== contactData.id))
      } else {
        setSelectedContacts([...selectedContacts, contactData])
      }
    }

    const selectAll = () => {
      const contactsToAdd = filteredContacts.map(contact => ({
        id: contact.id || contact.remoteJid,
        name: contact.pushName || 'Contato',
        phone: contact.remoteJid
      }))
      setSelectedContacts(contactsToAdd)
    }

    const clearAll = () => {
      setSelectedContacts([])
    }

    if (isLoading) {
      return <div className="text-zinc-400 text-center py-8">Carregando contatos...</div>
    }

    return (
      <div className="space-y-4">
        <div className="flex gap-4 flex-col sm:flex-row">
          <div className="flex-1">
            <Input
              placeholder="Buscar contatos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-zinc-800 border-zinc-600 text-white"
            />
          </div>
          <div className="w-full sm:w-40">
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-600">
                <SelectItem value="all">Todos os grupos</SelectItem>
                {groups.map((group) => (
                  <SelectItem key={String(group)} value={String(group)}>
                    {String(group)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-zinc-400">
            {selectedContacts.length} de {filteredContacts.length} selecionados
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={selectAll}
              className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
            >
              Selecionar Todos
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
            >
              Limpar
            </Button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto space-y-2">
          {filteredContacts.map((contact, index) => {
            const contactData = {
              id: contact.id || contact.remoteJid,
              name: contact.pushName || 'Contato',
              phone: contact.remoteJid
            }
            const isSelected = selectedContacts.some((c) => c.id === contactData.id)

            return (
              <div
                key={contact.id || index}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${isSelected
                    ? "bg-emerald-500/10 border border-emerald-500/50"
                    : "bg-zinc-800/50 hover:bg-zinc-700/50"
                  }`}
                onClick={() => toggleContact(contact)}
              >
                <Checkbox
                  checked={isSelected}
                  onChange={() => toggleContact(contact)}
                  className="border-zinc-500"
                />
                <Avatar className="w-10 h-10">
                  {contact.profilePicUrl ? (
                    <img src={contact.profilePicUrl} alt={contact.pushName} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-cyan-400 text-black font-bold">
                      {contact.pushName ? contact.pushName.slice(0, 2).toUpperCase() : "?"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <p className="text-white font-medium flex items-center gap-2">
                    {contact.pushName || 'Sem nome'}
                    <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 border-zinc-700">
                      {contact.remoteJid?.startsWith('120') ? 'Grupo' : 'Contato'}
                    </Badge>
                  </p>
                  <p className="text-zinc-400 text-sm flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {contact.remoteJid}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Componente para selecionar contatos (para nova campanha)
  const NewCampaignContactSelector = () => {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedGroup, setSelectedGroup] = useState<string>("all")
    const [allContacts, setAllContacts] = useState<any[]>([])

    const instanceName = newCampaign.instance || ""
    const apikey = process.env.NEXT_PUBLIC_EVOLUTION_API_KEY || ""

    const { data: contactsData, isLoading } = useContacts(instanceName, apikey, true, 100, 0)

    useEffect(() => {
      if (contactsData?.contacts) {
        setAllContacts(contactsData.contacts)
      }
    }, [contactsData])

    const groups: string[] = Array.from(new Set(allContacts.map((c) => c.group).filter((g): g is string => Boolean(g))))

    const filteredContacts = allContacts.filter((contact) => {
      const name = (contact.pushName || '').toLowerCase()
      const phone = (contact.remoteJid || '').toLowerCase()
      const matchesSearch = name.includes(searchTerm.toLowerCase()) || phone.includes(searchTerm)
      const matchesGroup = selectedGroup === "all" || contact.group === selectedGroup
      return matchesSearch && matchesGroup
    })

    const toggleContact = (contact: any) => {
      const contactData = {
        id: contact.id || contact.remoteJid,
        name: contact.pushName || 'Contato',
        phone: contact.remoteJid
      }

      const isSelected = newCampaignContacts.some((c) => c.id === contactData.id)
      if (isSelected) {
        setNewCampaignContacts(newCampaignContacts.filter((c) => c.id !== contactData.id))
      } else {
        setNewCampaignContacts([...newCampaignContacts, contactData])
      }
    }

    const selectAll = () => {
      const contactsToAdd = filteredContacts.map(contact => ({
        id: contact.id || contact.remoteJid,
        name: contact.pushName || 'Contato',
        phone: contact.remoteJid
      }))
      setNewCampaignContacts(contactsToAdd)
    }

    const clearAll = () => {
      setNewCampaignContacts([])
    }

    if (!newCampaign.instance) {
      return <div className="text-zinc-400 text-center py-8">Selecione uma instância primeiro</div>
    }

    if (isLoading) {
      return <div className="text-zinc-400 text-center py-8">Carregando contatos...</div>
    }

    return (
      <div className="space-y-4">
        <div className="flex gap-4 flex-col sm:flex-row">
          <div className="flex-1">
            <Input
              placeholder="Buscar contatos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-zinc-800 border-zinc-600 text-white"
            />
          </div>
          <div className="w-full sm:w-40">
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-600">
                <SelectItem value="all">Todos os grupos</SelectItem>
                {groups.map((group) => (
                  <SelectItem key={String(group)} value={String(group)}>
                    {String(group)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-zinc-400">
            {newCampaignContacts.length} de {filteredContacts.length} selecionados
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={selectAll}
              className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
            >
              Selecionar Todos
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
            >
              Limpar
            </Button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto space-y-2">
          {filteredContacts.map((contact, index) => {
            const contactData = {
              id: contact.id || contact.remoteJid,
              name: contact.pushName || 'Contato',
              phone: contact.remoteJid
            }
            const isSelected = newCampaignContacts.some((c) => c.id === contactData.id)

            return (
              <div
                key={contact.id || index}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${isSelected
                    ? "bg-emerald-500/10 border border-emerald-500/50"
                    : "bg-zinc-800/50 hover:bg-zinc-700/50"
                  }`}
                onClick={() => toggleContact(contact)}
              >
                <Checkbox
                  checked={isSelected}
                  onChange={() => toggleContact(contact)}
                  className="border-zinc-500"
                />
                <Avatar className="w-10 h-10">
                  {contact.profilePicUrl ? (
                    <img src={contact.profilePicUrl} alt={contact.pushName} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-cyan-400 text-black font-bold">
                      {contact.pushName ? contact.pushName.slice(0, 2).toUpperCase() : "?"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <p className="text-white font-medium flex items-center gap-2">
                    {contact.pushName || 'Sem nome'}
                    <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 border-zinc-700">
                      {contact.remoteJid?.startsWith('120') ? 'Grupo' : 'Contato'}
                    </Badge>
                  </p>
                  <p className="text-zinc-400 text-sm flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {contact.remoteJid}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
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
          <DialogContent className="bg-zinc-900 border-zinc-700 max-w-4xl max-h-[90vh] overflow-y-auto">
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
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  className="bg-zinc-800 border-zinc-600 text-white"
                />
              </div>
              <div>
                <Label className="text-zinc-300">Descrição (opcional)</Label>
                <Textarea
                  placeholder="Descreva o objetivo da campanha..."
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                  className="bg-zinc-800 border-zinc-600 text-white"
                />
              </div>
              <div>
                <Label className="text-zinc-300">Instância</Label>
                <Select value={newCampaign.instance} onValueChange={(value) => setNewCampaign({ ...newCampaign, instance: value })}>
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
                  onChange={(e) => setNewCampaign({ ...newCampaign, scheduledAt: e.target.value })}
                  className="bg-zinc-800 border-zinc-600 text-white"
                />
              </div>

              {/* Seção de Contatos */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-zinc-300">Contatos da Campanha</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewCampaignContacts(!showNewCampaignContacts)}
                    className="border-emerald-600 text-emerald-400 hover:bg-emerald-600/10"
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    {showNewCampaignContacts ? 'Ocultar' : 'Selecionar'} Contatos
                  </Button>
                </div>

                {newCampaignContacts.length > 0 && (
                  <div className="bg-zinc-800/50 rounded-lg p-3">
                    <p className="text-sm text-zinc-400 mb-2">
                      {newCampaignContacts.length} contatos selecionados
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {newCampaignContacts.slice(0, 5).map((contact) => (
                        <Badge key={contact.id} variant="secondary" className="bg-emerald-600/20 text-emerald-400 border-emerald-600/50">
                          {contact.name}
                        </Badge>
                      ))}
                      {newCampaignContacts.length > 5 && (
                        <Badge variant="secondary" className="bg-zinc-700 text-zinc-300">
                          +{newCampaignContacts.length - 5} mais
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {showNewCampaignContacts && (
                  <div className="border border-zinc-700 rounded-lg p-4 max-h-96 overflow-hidden">
                    <NewCampaignContactSelector />
                  </div>
                )}
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
                  {campaigns.filter(c => c.status === "running").length}
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
                  {campaigns.filter(c => c.status === "scheduled").length}
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
                  {campaigns.filter(c => c.status === "completed").length}
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
                        <span className="ml-1">{getStatusText(campaign.status)}</span>
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
                    {/* Botão Editar - apenas para campanhas não ativas */}
                    {(campaign.status === "draft" || campaign.status === "paused") && (
                      <Button
                        onClick={() => openEditDialog(campaign)}
                        size="sm"
                        variant="outline"
                        className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}

                    {/* Botão Gerenciar Contatos - apenas para campanhas não ativas */}
                    {(campaign.status === "draft" || campaign.status === "paused") && (
                      <Button
                        onClick={() => openContactsDialog(campaign)}
                        size="sm"
                        variant="outline"
                        className="border-cyan-600 text-cyan-400 hover:bg-cyan-600/10"
                      >
                        <UserPlus className="w-4 h-4" />
                      </Button>
                    )}

                    {campaign.status === "draft" && (
                      <Button
                        onClick={() => startCampaign(campaign.id)}
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Iniciar
                      </Button>
                    )}
                    {campaign.status === "running" && (
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
                    {campaign.status === "paused" && (
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

      {/* Dialog de Edição de Campanha */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Campanha</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Modifique as informações da campanha
            </DialogDescription>
          </DialogHeader>
          {editingCampaign && (
            <div className="space-y-4">
              <div>
                <Label className="text-zinc-300">Nome da Campanha</Label>
                <Input
                  placeholder="Ex: Promoção Black Friday"
                  value={editingCampaign.name}
                  onChange={(e) => setEditingCampaign({ ...editingCampaign, name: e.target.value })}
                  className="bg-zinc-800 border-zinc-600 text-white"
                />
              </div>
              <div>
                <Label className="text-zinc-300">Descrição</Label>
                <Textarea
                  placeholder="Descreva o objetivo da campanha..."
                  value={editingCampaign.description || ""}
                  onChange={(e) => setEditingCampaign({ ...editingCampaign, description: e.target.value })}
                  className="bg-zinc-800 border-zinc-600 text-white"
                />
              </div>
              <div>
                <Label className="text-zinc-300">Instância</Label>
                <Select
                  value={editingCampaign.instance}
                  onValueChange={(value) => setEditingCampaign({ ...editingCampaign, instance: value })}
                >
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
                <Label className="text-zinc-300">Agendar para</Label>
                <Input
                  type="datetime-local"
                  value={editingCampaign.scheduledAt ? new Date(editingCampaign.scheduledAt).toISOString().slice(0, 16) : ""}
                  onChange={(e) => setEditingCampaign({ ...editingCampaign, scheduledAt: e.target.value ? new Date(e.target.value) : undefined })}
                  className="bg-zinc-800 border-zinc-600 text-white"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={updateCampaign}
                  className="bg-emerald-600 hover:bg-emerald-700 flex-1"
                  disabled={!editingCampaign.name || !editingCampaign.instance}
                >
                  Atualizar Campanha
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                  className="border-zinc-600 text-zinc-300"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Gerenciar Contatos */}
      <Dialog open={showContactsDialog} onOpenChange={setShowContactsDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-700 max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-white">Gerenciar Contatos da Campanha</DialogTitle>
            <DialogDescription className="text-zinc-400">
              {selectedCampaign && `Campanha: ${selectedCampaign.name} - ${selectedContacts.length} contatos selecionados`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <ContactSelector />
            <div className="flex gap-3 pt-4">
              <Button
                onClick={updateCampaignContacts}
                className="bg-emerald-600 hover:bg-emerald-700 flex-1"
              >
                Atualizar Contatos
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowContactsDialog(false)}
                className="border-zinc-600 text-zinc-300"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}