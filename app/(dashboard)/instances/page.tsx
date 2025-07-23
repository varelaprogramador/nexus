"use client";
import { RefreshCw, Plus, Trash2, MessageSquare, Users, MessageCircle, QrCode } from "lucide-react"
import { useInstances, useCreateInstance, useDeleteInstance, EvolutionInstance, useQrCodeInstance } from "@/hooks/use-instances"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner"
import { useQuery } from '@tanstack/react-query'
import api from "@/lib/api"


const API_KEY = process.env.NEXT_PUBLIC_EVOLUTION_API_KEY || ""

export default function InstancesPage() {
  const { data: instances = [], isLoading, refetch } = useInstances(API_KEY) as { data: EvolutionInstance[], isLoading: boolean, refetch: () => void }
  const createInstance = useCreateInstance(API_KEY)
  const deleteInstance = useDeleteInstance(API_KEY)
  const [open, setOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [instanceToDelete, setInstanceToDelete] = useState<string | null>(null)
  const [newInstance, setNewInstance] = useState({ instanceName: "" })
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [qrInstance, setQrInstance] = useState<string | null>(null)
  const qrCodeQuery = useQrCodeInstance(qrInstance || "", API_KEY, !!qrDialogOpen && !!qrInstance)

  // Função para criar instância
  const handleCreate = () => {
    if (!newInstance.instanceName) return
    createInstance.mutate({ ...newInstance, integration: "WHATSAPP-BAILEYS" }, {
      onSuccess: () => {
        setOpen(false)
        setNewInstance({ instanceName: "" })
        toast.success("Instância criada com sucesso!")
      },
      onError: (error: any) => {
        toast.error("Erro ao criar instância", {
          description: error?.message || "Tente novamente."
        })
      }
    })
  }

  // Função para deletar instância
  const handleDelete = (instanceName: string) => {
    deleteInstance.mutate(instanceName, {
      onSuccess: () => {
        setDeleteDialogOpen(false)
        setInstanceToDelete(null)
        toast.success("Instância excluída com sucesso!")
      },
      onError: (error: any) => {
        toast.error("Erro ao excluir instância", {
          description: error?.message || "Tente novamente."
        })
      }
    })
  }

  return (
    <Card className="border border-border/40 bg-background/60 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Instâncias do WhatsApp</CardTitle>
            <CardDescription>Gerencie suas instâncias do Evolution API</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Instância
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Criar Nova Instância</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="instanceName" className="text-sm font-medium">Nome da Instância</label>
                    <Input
                      id="instanceName"
                      value={newInstance.instanceName}
                      onChange={e => setNewInstance({ instanceName: e.target.value })}
                      placeholder="Digite o nome da instância"
                      className="border-border/40"
                    />
                  </div>
                  <Button
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={handleCreate}
                    disabled={!newInstance.instanceName || createInstance.isPending}
                  >
                    {createInstance.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      "Criar Instância"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Card key={i} className="border border-border/40 bg-background/60 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[200px] w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : instances.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
              <MessageSquare className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-medium">Nenhuma instância encontrada</h3>
            <p className="mt-2">Crie uma nova instância para começar a usar o WhatsApp API.</p>
            <Button
              onClick={() => setOpen(true)}
              className="mt-4 bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Instância
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {instances.map(instance => (
              <Card key={instance.id} className="h-full flex flex-col transition-all duration-300 hover:shadow-md border-border/40 bg-background/60 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {instance.profilePicUrl ? (
                        <img
                          src={instance.profilePicUrl}
                          alt={instance.profileName}
                          className="w-10 h-10 rounded-full object-cover border-2 border-background"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <MessageCircle className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">{instance.profileName || instance.name}</CardTitle>
                        <CardDescription>{instance.id}</CardDescription>
                      </div>
                    </div>
                    <TooltipProvider>
                      <div className="flex gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setInstanceToDelete(instance.name)
                                setDeleteDialogOpen(true)
                              }}
                              className="h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Excluir Instância</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setQrInstance(instance.name)
                                setQrDialogOpen(true)
                              }}
                              className="h-8 w-8"
                            >
                              <QrCode className="h-4 w-4 text-emerald-400" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Gerar QR Code</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={instance.connectionStatus === "open" ? "default" : "destructive"}>
                      {instance.connectionStatus === "open" ? "Online" : "Offline"}
                    </Badge>
                    {instance.number && <span className="text-sm text-muted-foreground">• {instance.number}</span>}
                  </div>
                  {instance.connectionStatus === "close" && instance.disconnectionReasonCode && (
                    <CardDescription className="text-xs mt-1 text-destructive">
                      Desconectado: {instance.disconnectionReasonCode}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <div className="flex flex-col items-center">
                        <MessageSquare className="h-4 w-4 mb-1 text-muted-foreground" />
                        <div className="font-medium">{instance._count?.Message ?? '-'}</div>
                        <div className="text-xs text-muted-foreground">Mensagens</div>
                      </div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <div className="flex flex-col items-center">
                        <Users className="h-4 w-4 mb-1 text-muted-foreground" />
                        <div className="font-medium">{instance._count?.Contact ?? '-'}</div>
                        <div className="text-xs text-muted-foreground">Contatos</div>
                      </div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <div className="flex flex-col items-center">
                        <MessageCircle className="h-4 w-4 mb-1 text-muted-foreground" />
                        <div className="font-medium">{instance._count?.Chat ?? '-'}</div>
                        <div className="text-xs text-muted-foreground">Chats</div>
                      </div>
                    </div>
                  </div>
                  {instance.token && (
                    <div className="mt-4 text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">Token:</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => navigator.clipboard.writeText(instance.token || "N/A")}
                        >
                          Copiar
                        </Button>
                      </div>
                      <div className="bg-muted p-2 rounded text-xs font-mono overflow-hidden">
                        <code className="block overflow-x-auto truncate">{instance.token || "N/A"}</code>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a instância{" "}
              <span className="font-semibold">{instanceToDelete}</span>? Esta ação
              não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => instanceToDelete && handleDelete(instanceToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code para conexão</DialogTitle>
          </DialogHeader>
          {qrCodeQuery.isLoading ? (
            <div className="flex justify-center items-center h-48">Carregando QR Code...</div>
          ) : qrCodeQuery.data?.qrCode ? (
            <div className="flex flex-col items-center">
              <img src={qrCodeQuery.data.qrCode} alt="QR Code" className="w-48 h-48" />
              <div className="text-xs text-muted-foreground mt-2">Escaneie este código com seu WhatsApp</div>
            </div>
          ) : (
            <div className="text-center text-red-500">QR Code não disponível.</div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}