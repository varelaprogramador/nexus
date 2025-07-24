"use client"

import { Target, Activity, Clock, CheckCircle, XCircle, Users, Send, Calendar, Plus, X, Zap, FileText, ImageIcon, Mic, BarChart3, MousePointer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { useState, useEffect } from "react"
import { useContacts } from "../contacts/page"

import { useInstances } from "@/hooks/use-instances"
import useDisparo from '@/hooks/use-disparo'
import { Dialog as ProgressDialog, DialogContent as ProgressDialogContent, DialogHeader as ProgressDialogHeader, DialogTitle as ProgressDialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import FileUploadTable from "@/components/FileUploadTable"

interface Contact {
  id: string
  name: string
  phone: string
  avatar: string
  group?: string
}

interface MessageBlock {
  id: string
  type: "text" | "image" | "file" | "audio" | "poll" | "button"
  content: string
  file?: File
  delay?: number // delay individual
  // Para enquete
  pollOptions?: string[]
  pollName?: string
  pollSelectableCount?: number
  // Para botões
  buttonTitle?: string
  buttonDescription?: string
  buttonFooter?: string
  buttonList?: { title: string; displayText: string; id: string }[]
}

interface DeliveryStatus {
  contactId: string
  contact: string
  status: "pendente" | "enviando" | "entregue" | "falhou"
  time: string
  avatar: string
}


function MessageComposer({
  blocks,
  setBlocks,
  delayGeral,
}: { blocks: MessageBlock[]; setBlocks: (blocks: MessageBlock[]) => void; delayGeral: number }) {
  const addBlock = (type: "text" | "image" | "file" | "audio" | "poll" | "button") => {
    const newBlock: MessageBlock = {
      id: Date.now().toString(),
      type,
      content: "",
      delay: undefined,
      file: undefined,
    }
    setBlocks([...blocks, newBlock])
  }

  const updateBlock = (id: string, content: string) => {
    setBlocks(blocks.map((block) => (block.id === id ? { ...block, content } : block)))
  }

  const updateBlockDelay = (id: string, delay: number | undefined) => {
    setBlocks(blocks.map((block) => (block.id === id ? { ...block, delay } : block)))
  }

  const updateBlockFile = (id: string, file: File | undefined) => {
    setBlocks(blocks.map((block) => (block.id === id ? { ...block, file } : block)))
  }

  const updateBlockPoll = (id: string, poll: { name?: string; options?: string[]; selectableCount?: number }) => {
    setBlocks(
      blocks.map((block) =>
        block.id === id
          ? {
            ...block,
            pollName: poll.name ?? block.pollName,
            pollOptions: poll.options ?? block.pollOptions,
            pollSelectableCount: poll.selectableCount ?? block.pollSelectableCount,
          }
          : block,
      ),
    )
  }

  const updateBlockButton = (
    id: string,
    button: {
      title?: string
      description?: string
      footer?: string
      list?: { title: string; displayText: string; id: string }[]
    },
  ) => {
    setBlocks(
      blocks.map((block) =>
        block.id === id
          ? {
            ...block,
            buttonTitle: button.title ?? block.buttonTitle,
            buttonDescription: button.description ?? block.buttonDescription,
            buttonFooter: button.footer ?? block.buttonFooter,
            buttonList: button.list ?? block.buttonList,
          }
          : block,
      ),
    )
  }

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter((block) => block.id !== id))
  }

  const moveBlock = (id: string, direction: "up" | "down") => {
    const idx = blocks.findIndex((block) => block.id === id)
    if (idx < 0) return
    const newBlocks = [...blocks]
    if (direction === "up" && idx > 0) {
      ;[newBlocks[idx - 1], newBlocks[idx]] = [newBlocks[idx], newBlocks[idx - 1]]
    } else if (direction === "down" && idx < newBlocks.length - 1) {
      ;[newBlocks[idx], newBlocks[idx + 1]] = [newBlocks[idx + 1], newBlocks[idx]]
    }
    setBlocks(newBlocks)
  }

  const duplicateBlock = (id: string) => {
    const idx = blocks.findIndex((block) => block.id === id)
    if (idx < 0) return
    const blockToDuplicate = blocks[idx]
    const newBlock = { ...blockToDuplicate, id: Date.now().toString() }
    const newBlocks = [...blocks]
    newBlocks.splice(idx + 1, 0, newBlock)
    setBlocks(newBlocks)
  }

  const getBlockIcon = (type: string) => {
    switch (type) {
      case "text":
        return <FileText className="w-4 h-4" />
      case "image":
        return <ImageIcon className="w-4 h-4" />
      case "file":
        return <FileText className="w-4 h-4" />
      case "audio":
        return <Mic className="w-4 h-4" />
      case "poll":
        return <BarChart3 className="w-4 h-4" />
      case "button":
        return <MousePointer className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getBlockTitle = (type: string) => {
    switch (type) {
      case "text":
        return "Mensagem de Texto"
      case "image":
        return "Imagem"
      case "file":
        return "Arquivo"
      case "audio":
        return "Áudio"
      case "poll":
        return "Enquete"
      case "button":
        return "Botões Interativos"
      default:
        return "Bloco"
    }
  }

  const isBlockValid = (block: MessageBlock) => {
    switch (block.type) {
      case "text":
        return block.content.trim().length > 0
      case "image":
      case "file":
      case "audio":
        return !!block.file
      case "poll":
        return !!(block.pollName && block.pollOptions?.length)
      case "button":
        return !!(block.buttonTitle && block.buttonList?.length)
      default:
        return false
    }
  }

  return (
    <div className="space-y-6">
      {blocks.map((block, index) => (
        <div key={block.id} className="relative group">
          <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-6 hover:border-zinc-600/50 transition-all duration-200">
            {/* Header do bloco */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${isBlockValid(block) ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-700/50 text-zinc-400"}`}
                >
                  {getBlockIcon(block.type)}
                </div>
                <div>
                  <h3 className="text-white font-medium">{getBlockTitle(block.type)}</h3>
                  <p className="text-zinc-400 text-sm">Bloco {index + 1}</p>
                </div>
              </div>

              {/* Controles do bloco */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => moveBlock(block.id, "up")}
                  className="text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 h-8 w-8"
                  disabled={index === 0}
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <path
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18 15l-6-6-6 6"
                    />
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => moveBlock(block.id, "down")}
                  className="text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 h-8 w-8"
                  disabled={index === blocks.length - 1}
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <path
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 9l6 6 6-6"
                    />
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => duplicateBlock(block.id)}
                  className="text-zinc-400 hover:text-cyan-400 hover:bg-cyan-500/10 h-8 w-8"
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
                    <rect x="3" y="3" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </Button>
                {blocks.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeBlock(block.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Conteúdo do bloco */}
            <div className="space-y-4">
              {block.type === "text" && (
                <div>
                  <Label className="text-zinc-300 text-sm mb-2 block">Conteúdo da mensagem</Label>
                  <Textarea
                    placeholder="Digite sua mensagem aqui..."
                    value={block.content}
                    onChange={(e) => updateBlock(block.id, e.target.value)}
                    className="bg-zinc-800/50 border-zinc-600 text-white placeholder:text-zinc-400 min-h-[120px] resize-none"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-zinc-500">{block.content.length} caracteres</span>
                    {block.content.length > 4096 && (
                      <span className="text-xs text-red-400">Limite do WhatsApp: 4096 caracteres</span>
                    )}
                  </div>
                </div>
              )}

              {block.type === "image" && (
                <div>
                  <Label className="text-zinc-300 text-sm mb-2 block">Upload de Imagem</Label>
                  <div className="border-2 border-dashed border-zinc-600 rounded-lg p-6 text-center hover:border-zinc-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        updateBlockFile(block.id, file)
                      }}
                      className="hidden"
                      id={`image-${block.id}`}
                    />
                    <label htmlFor={`image-${block.id}`} className="cursor-pointer">
                      {block.file ? (
                        <div className="space-y-2">
                          <img
                            src={URL.createObjectURL(block.file) || "/placeholder.svg"}
                            alt="preview"
                            className="mx-auto max-h-32 rounded object-cover"
                          />
                          <p className="text-sm text-zinc-400">{block.file.name}</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <ImageIcon className="w-12 h-12 mx-auto text-zinc-400" />
                          <p className="text-zinc-400">Clique para selecionar uma imagem</p>
                          <p className="text-xs text-zinc-500">PNG, JPG, GIF até 16MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                  <div className="mt-3">
                    <Label className="text-zinc-300 text-sm mb-2 block">Legenda (opcional)</Label>
                    <Input
                      placeholder="Adicione uma legenda à imagem..."
                      value={block.content}
                      onChange={(e) => updateBlock(block.id, e.target.value)}
                      className="bg-zinc-800/50 border-zinc-600 text-white placeholder:text-zinc-400"
                    />
                  </div>
                </div>
              )}

              {block.type === "file" && (
                <div>
                  <Label className="text-zinc-300 text-sm mb-2 block">Upload de Arquivo</Label>
                  <div className="border-2 border-dashed border-zinc-600 rounded-lg p-6 text-center hover:border-zinc-500 transition-colors">
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        updateBlockFile(block.id, file)
                      }}
                      className="hidden"
                      id={`file-${block.id}`}
                    />
                    <label htmlFor={`file-${block.id}`} className="cursor-pointer">
                      {block.file ? (
                        <div className="space-y-2">
                          <FileText className="w-12 h-12 mx-auto text-emerald-400" />
                          <p className="text-sm text-white">{block.file.name}</p>
                          <p className="text-xs text-zinc-400">{(block.file.size / 1024).toFixed(1)} KB</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <FileText className="w-12 h-12 mx-auto text-zinc-400" />
                          <p className="text-zinc-400">Clique para selecionar um arquivo</p>
                          <p className="text-xs text-zinc-500">PDF, DOC, XLS e outros até 100MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                  <div className="mt-3">
                    <Label className="text-zinc-300 text-sm mb-2 block">Legenda (opcional)</Label>
                    <Input
                      placeholder="Adicione uma descrição ao arquivo..."
                      value={block.content}
                      onChange={(e) => updateBlock(block.id, e.target.value)}
                      className="bg-zinc-800/50 border-zinc-600 text-white placeholder:text-zinc-400"
                    />
                  </div>
                </div>
              )}

              {block.type === "audio" && (
                <div>
                  <Label className="text-zinc-300 text-sm mb-2 block">Upload de Áudio</Label>
                  <div className="border-2 border-dashed border-zinc-600 rounded-lg p-6 text-center hover:border-zinc-500 transition-colors">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        updateBlockFile(block.id, file)
                      }}
                      className="hidden"
                      id={`audio-${block.id}`}
                    />
                    <label htmlFor={`audio-${block.id}`} className="cursor-pointer">
                      {block.file ? (
                        <div className="space-y-2">
                          <Mic className="w-12 h-12 mx-auto text-green-400" />
                          <p className="text-sm text-white">{block.file.name}</p>
                          <audio controls src={URL.createObjectURL(block.file)} className="mx-auto" />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Mic className="w-12 h-12 mx-auto text-zinc-400" />
                          <p className="text-zinc-400">Clique para selecionar um áudio</p>
                          <p className="text-xs text-zinc-500">MP3, WAV, OGG até 16MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              )}

              {block.type === "poll" && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-zinc-300 text-sm mb-2 block">Pergunta da Enquete</Label>
                    <Input
                      placeholder="Ex: Qual sua cor favorita?"
                      value={block.pollName || ""}
                      onChange={(e) => updateBlockPoll(block.id, { name: e.target.value })}
                      className="bg-zinc-800/50 border-zinc-600 text-white placeholder:text-zinc-400"
                    />
                  </div>

                  <div>
                    <Label className="text-zinc-300 text-sm mb-2 block">Opções de Resposta</Label>
                    <div className="space-y-2">
                      {(block.pollOptions || []).map((opt, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...(block.pollOptions || [])]
                              newOpts[idx] = e.target.value
                              updateBlockPoll(block.id, { options: newOpts })
                            }}
                            className="bg-zinc-800/50 border-zinc-600 text-white placeholder:text-zinc-400"
                            placeholder={`Opção ${idx + 1}`}
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              const newOpts = [...(block.pollOptions || [])]
                              newOpts.splice(idx, 1)
                              updateBlockPoll(block.id, { options: newOpts })
                            }}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 border-zinc-600 text-zinc-300 hover:bg-zinc-700 bg-transparent"
                      onClick={() => updateBlockPoll(block.id, { options: [...(block.pollOptions || []), ""] })}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Opção
                    </Button>
                  </div>

                  <div className="flex items-center gap-4">
                    <Label className="text-zinc-300 text-sm">Seleções permitidas:</Label>
                    <Input
                      type="number"
                      min={1}
                      max={block.pollOptions?.length || 1}
                      value={block.pollSelectableCount ?? 1}
                      onChange={(e) => updateBlockPoll(block.id, { selectableCount: Number(e.target.value) })}
                      className="w-20 bg-zinc-800/50 border-zinc-600 text-white"
                    />
                  </div>
                </div>
              )}

              {block.type === "button" && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-zinc-300 text-sm mb-2 block">Título da Mensagem</Label>
                    <Input
                      placeholder="Ex: Escolha uma opção"
                      value={block.buttonTitle || ""}
                      onChange={(e) => updateBlockButton(block.id, { title: e.target.value })}
                      className="bg-zinc-800/50 border-zinc-600 text-white placeholder:text-zinc-400"
                    />
                  </div>

                  <div>
                    <Label className="text-zinc-300 text-sm mb-2 block">Descrição (opcional)</Label>
                    <Textarea
                      placeholder="Adicione mais detalhes..."
                      value={block.buttonDescription || ""}
                      onChange={(e) => updateBlockButton(block.id, { description: e.target.value })}
                      className="bg-zinc-800/50 border-zinc-600 text-white placeholder:text-zinc-400 min-h-[80px]"
                    />
                  </div>

                  <div>
                    <Label className="text-zinc-300 text-sm mb-2 block">Botões</Label>
                    <div className="space-y-2">
                      {(block.buttonList || []).map((btn, idx) => (
                        <div key={idx} className="grid grid-cols-3 gap-2">
                          <Input
                            placeholder="Título"
                            value={btn.title}
                            onChange={(e) => {
                              const newList = [...(block.buttonList || [])]
                              newList[idx].title = e.target.value
                              updateBlockButton(block.id, { list: newList })
                            }}
                            className="bg-zinc-800/50 border-zinc-600 text-white placeholder:text-zinc-400"
                          />
                          <Input
                            placeholder="Texto exibido"
                            value={btn.displayText}
                            onChange={(e) => {
                              const newList = [...(block.buttonList || [])]
                              newList[idx].displayText = e.target.value
                              updateBlockButton(block.id, { list: newList })
                            }}
                            className="bg-zinc-800/50 border-zinc-600 text-white placeholder:text-zinc-400"
                          />
                          <div className="flex gap-1">
                            <Input
                              placeholder="ID"
                              value={btn.id}
                              onChange={(e) => {
                                const newList = [...(block.buttonList || [])]
                                newList[idx].id = e.target.value
                                updateBlockButton(block.id, { list: newList })
                              }}
                              className="bg-zinc-800/50 border-zinc-600 text-white placeholder:text-zinc-400"
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                const newList = [...(block.buttonList || [])]
                                newList.splice(idx, 1)
                                updateBlockButton(block.id, { list: newList })
                              }}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 border-zinc-600 text-zinc-300 hover:bg-zinc-700 bg-transparent"
                      onClick={() =>
                        updateBlockButton(block.id, {
                          list: [...(block.buttonList || []), { title: "", displayText: "", id: "" }],
                        })
                      }
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Botão
                    </Button>
                  </div>

                  <div>
                    <Label className="text-zinc-300 text-sm mb-2 block">Rodapé (opcional)</Label>
                    <Input
                      placeholder="Texto do rodapé"
                      value={block.buttonFooter || ""}
                      onChange={(e) => updateBlockButton(block.id, { footer: e.target.value })}
                      className="bg-zinc-800/50 border-zinc-600 text-white placeholder:text-zinc-400"
                    />
                  </div>
                </div>
              )}

              {/* Configuração de delay */}
              <div className="flex items-center gap-4 pt-4 border-t border-zinc-700/50">
                <Label className="text-zinc-400 text-sm">Delay deste bloco:</Label>
                <Input
                  type="number"
                  min={0}
                  value={block.delay ?? ""}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val === "" || isNaN(Number(val))) {
                      updateBlockDelay(block.id, undefined)
                    } else {
                      updateBlockDelay(block.id, Number(val))
                    }
                  }}
                  className="w-24 bg-zinc-800/50 border-zinc-600 text-white"
                  placeholder={delayGeral.toString()}
                />
                <span className="text-zinc-500 text-sm">segundos (vazio = padrão: {delayGeral}s)</span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Botões para adicionar novos blocos */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 border-t border-zinc-700/50">
        <Button
          variant="outline"
          onClick={() => addBlock("text")}
          className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:border-emerald-500/50 hover:text-emerald-400 transition-all duration-200"
        >
          <FileText className="w-4 h-4 mr-2" />
          Texto
        </Button>
        <Button
          variant="outline"
          onClick={() => addBlock("image")}
          className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:border-blue-500/50 hover:text-blue-400 transition-all duration-200"
        >
          <ImageIcon className="w-4 h-4 mr-2" />
          Imagem
        </Button>
        <Button
          variant="outline"
          onClick={() => addBlock("file")}
          className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:border-purple-500/50 hover:text-purple-400 transition-all duration-200"
        >
          <FileText className="w-4 h-4 mr-2" />
          Arquivo
        </Button>
        <Button
          variant="outline"
          onClick={() => addBlock("audio")}
          className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:border-green-500/50 hover:text-green-400 transition-all duration-200"
        >
          <Mic className="w-4 h-4 mr-2" />
          Áudio
        </Button>
        <Button
          variant="outline"
          onClick={() => addBlock("poll")}
          className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:border-yellow-500/50 hover:text-yellow-400 transition-all duration-200"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Enquete
        </Button>
        <Button
          variant="outline"
          onClick={() => addBlock("button")}
          className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:border-cyan-500/50 hover:text-cyan-400 transition-all duration-200"
        >
          <MousePointer className="w-4 h-4 mr-2" />
          Botões
        </Button>
      </div>
    </div>
  )
}


function ContactSelector({
  open,
  onOpenChange,
  selected,
  setSelected,
  instanceName,
  apikey,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  selected: Contact[]
  setSelected: (contacts: Contact[]) => void
  instanceName: string
  apikey: string
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGroup, setSelectedGroup] = useState<string>("all")

  // Buscar contatos reais da instância
  const { data: contacts = [], isLoading } = useContacts(instanceName, apikey, true)

  const groups: string[] = Array.from(new Set(contacts.map((c) => c.group).filter((g): g is string => Boolean(g))))

  const filteredContacts = contacts.filter((contact) => {
    const name = (contact.pushName || '').toLowerCase()
    const phone = (contact.remoteJid || '').toLowerCase()
    const matchesSearch =
      name.includes(searchTerm.toLowerCase()) || phone.includes(searchTerm)
    // Não há grupo, então sempre true
    return matchesSearch
  })

  const toggleContact = (contact: Contact) => {
    const isSelected = selected.some((c) => c.id === contact.id)
    if (isSelected) {
      setSelected(selected.filter((c) => c.id !== contact.id))
    } else {
      setSelected([...selected, contact])
    }
  }

  const selectAll = () => {
    setSelected(filteredContacts)
  }

  const clearAll = () => {
    setSelected([])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-zinc-900 border-zinc-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            Selecionar Contatos
          </DialogTitle>
          <DialogDescription className="text-zinc-400">Escolha os contatos que receberão a mensagem</DialogDescription>
        </DialogHeader>

        {!instanceName ? (
          <div className="text-zinc-400 text-center py-8">Selecione uma instância para exibir os contatos.</div>
        ) : isLoading ? (
          <div className="text-zinc-400 text-center py-8">Carregando contatos...</div>
        ) : (
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
              <div className="w-full sm:w-40 mt-2 sm:mt-0">
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                  <SelectTrigger className="w-full bg-zinc-800 border-zinc-600 text-white">
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
                {selected.length} de {filteredContacts.length} selecionados
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAll}
                  className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 bg-transparent"
                >
                  Selecionar Todos
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAll}
                  className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 bg-transparent"
                >
                  Limpar
                </Button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredContacts.map((contact) => {
                const isSelected = selected.some((c) => c.id === contact.id)
                return (
                  <div
                    key={String(contact.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${isSelected
                      ? "bg-emerald-500/10 border border-emerald-500/50"
                      : "bg-zinc-800/50 hover:bg-zinc-700/50"
                      }`}
                    onClick={() => toggleContact({
                      id: contact.id,
                      name: contact.pushName || '',
                      phone: contact.remoteJid || '',
                      avatar: contact.profilePicUrl || (contact.pushName ? contact.pushName.slice(0, 2).toUpperCase() : "?"),
                    })}
                  >
                    <Checkbox checked={isSelected} onChange={() => toggleContact({
                      id: contact.id,
                      name: contact.pushName || '',
                      phone: contact.remoteJid || '',
                      avatar: contact.profilePicUrl || (contact.pushName ? contact.pushName.slice(0, 2).toUpperCase() : "?"),
                    })} className="border-zinc-500" />
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
                        {contact.pushName}
                        {contact.remoteJid.startsWith('120') ? (
                          <Badge variant="secondary" className="bg-blue-900 text-blue-300 border-blue-700">Grupo</Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 border-zinc-700">Contato</Badge>
                        )}
                      </p>
                      <p className="text-zinc-400 text-sm">{contact.remoteJid}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// Função para formatar número no padrão +55 43 8477-8544
const formatPhone = (jid: string) => {
  const match = jid.match(/^(\d+)(@.*)?$/)
  if (!match) return jid
  let num = match[1]
  if (num.length === 13) {
    return `+${num.slice(0, 2)} ${num.slice(2, 4)} ${num.slice(4, 9)}-${num.slice(9)}`
  }
  if (num.length === 12) {
    return `+${num.slice(0, 2)} ${num.slice(2, 4)} ${num.slice(4, 8)}-${num.slice(8)}`
  }
  if (num.length === 11) {
    return `+${num.slice(0, 2)} ${num.slice(2, 7)}-${num.slice(7)}`
  }
  return `+${num}`
}

// Utilitário para detectar MIME type
const mimeTypes: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  txt: 'text/plain',
  csv: 'text/csv',
  zip: 'application/zip',
  rar: 'application/vnd.rar',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  mp3: 'audio/mpeg',
  mp4: 'video/mp4',
  webm: 'video/webm',
  avi: 'video/x-msvideo',
  mov: 'video/quicktime',
  svg: 'image/svg+xml',
  webp: 'image/webp',
  tiff: 'image/tiff',
  tif: 'image/tiff',
  bmp: 'image/bmp',
  // ...adicione outros conforme necessário
}

function getMimeType(file: File): string {
  if (file.type) return file.type
  const ext = file.name.split('.').pop()?.toLowerCase()
  return ext && mimeTypes[ext] ? mimeTypes[ext] : 'application/octet-stream'
}

export default function MassDispatchPage() {
  const apikey = process.env.NEXT_PUBLIC_EVOLUTION_API_KEY || ""
  const { data: instances = [] } = useInstances()
  const [selectedInstance, setSelectedInstance] = useState<string>("")
  const [messageBlocks, setMessageBlocks] = useState<MessageBlock[]>([{ id: "1", type: "text", content: "" }])
  const [contactsDialogOpen, setContactsDialogOpen] = useState(false)
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([])
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus[]>([])
  const [isSending, setIsSending] = useState(false)
  const [loadingContacts, setLoadingContacts] = useState(false)
  const { dispararMensagem, loading: loadingDisparo, error: errorDisparo } = useDisparo()
  const { dispararImagem, loading: loadingDisparoImagem, error: errorDisparoImagem } = useDisparo()
  const { dispararArquivo, loading: loadingDisparoArquivo, error: errorDisparoArquivo } = useDisparo()
  const { dispararAudio, loading: loadingDisparoAudio, error: errorDisparoAudio } = useDisparo()
  const { dispararEnquete, loading: loadingDisparoEnquete, error: errorDisparoEnquete } = useDisparo()
  const { dispararBotao, loading: loadingDisparoBotao, error: errorDisparoBotao } = useDisparo()
  const [delay, setDelay] = useState<number>(5)
  const [showSendingDialog, setShowSendingDialog] = useState(false)
  const [sendingProgress, setSendingProgress] = useState<Array<{
    blocoIndex: number
    blocoContent: string
    numero: string
    status: 'pendente' | 'enviando' | 'sucesso' | 'erro'
    mensagem?: string
  }>>([])

  // Mock delivery status
  useEffect(() => {
    const mockStatus: DeliveryStatus[] = [
      { contactId: "1", contact: "João Silva", status: "entregue", time: "14:30", avatar: "JS" },
      { contactId: "2", contact: "Maria Santos", status: "enviando", time: "14:31", avatar: "MS" },
      { contactId: "3", contact: "Pedro Costa", status: "falhou", time: "14:32", avatar: "PC" },
      { contactId: "4", contact: "Ana Lima", status: "entregue", time: "14:33", avatar: "AL" },
      { contactId: "5", contact: "Carlos Souza", status: "pendente", time: "14:34", avatar: "CS" },
    ]
    setDeliveryStatus(mockStatus)
  }, [])

  // Função utilitária para substituir variáveis {coluna} pelo valor da linha
  const replaceVars = (template: string, row: any) => {
    if (!template) return ''
    return template.replace(/\{(.*?)\}/g, (_, key) => row[key] ?? '')
  }

  // Função para disparo em massa via planilha
  const handleMassDispatch = async () => {
    if (selectedRows.length === 0) {
      toast.error("Selecione pelo menos uma linha da planilha")
      return
    }
    // Pega todos os blocos válidos
    const blocosTexto = messageBlocks.filter((block) => block.type === 'text' && block.content.trim())
    const blocosImagem = messageBlocks.filter((block) => block.type === 'image' && block.file)
    const blocosArquivo = messageBlocks.filter((block) => block.type === 'file' && block.file)
    const blocosAudio = messageBlocks.filter((block) => block.type === 'audio' && block.file)
    const blocosEnquete = messageBlocks.filter((block) => block.type === 'poll' && block.pollName && (block.pollOptions?.length ?? 0) > 0)
    const blocosButton = messageBlocks.filter((block) => block.type === 'button' && block.buttonTitle && (block.buttonList?.length ?? 0) > 0)
    if (blocosTexto.length === 0 && blocosImagem.length === 0 && blocosArquivo.length === 0 && blocosAudio.length === 0 && blocosEnquete.length === 0 && blocosButton.length === 0) {
      toast.error("Adicione pelo menos uma mensagem de texto, imagem, arquivo, áudio, enquete ou botão")
      return
    }
    setIsSending(true)
    setShowSendingDialog(true)
    // Inicializa progresso
    let progress: typeof sendingProgress = []
    let blocoCount = 0
    // Para cada linha selecionada, cada bloco vira uma mensagem
    selectedRows.forEach((row, rowIdx) => {
      // O número deve estar em alguma coluna (ex: "numero" ou "telefone")
      const numero = row.numero || row.telefone || row.phone || row[Object.keys(row).find(k => k.toLowerCase().includes('numero') || k.toLowerCase().includes('phone')) || '']
      if (!numero) return
      blocosTexto.forEach((bloco) => {
        progress.push({ blocoIndex: blocoCount, blocoContent: replaceVars(bloco.content, row), numero, status: 'pendente' })
        blocoCount++
      })
      blocosImagem.forEach((bloco) => {
        progress.push({ blocoIndex: blocoCount, blocoContent: replaceVars(bloco.content, row), numero, status: 'pendente' })
        blocoCount++
      })
      blocosArquivo.forEach((bloco) => {
        progress.push({ blocoIndex: blocoCount, blocoContent: replaceVars(bloco.content, row), numero, status: 'pendente' })
        blocoCount++
      })
      blocosAudio.forEach((bloco) => {
        progress.push({ blocoIndex: blocoCount, blocoContent: bloco.file?.name || 'Áudio', numero, status: 'pendente' })
        blocoCount++
      })
      blocosEnquete.forEach((bloco) => {
        progress.push({ blocoIndex: blocoCount, blocoContent: replaceVars(bloco.pollName || 'Enquete', row), numero, status: 'pendente' })
        blocoCount++
      })
      blocosButton.forEach((bloco) => {
        progress.push({ blocoIndex: blocoCount, blocoContent: replaceVars(bloco.buttonTitle || 'Botão', row), numero, status: 'pendente' })
        blocoCount++
      })
    })
    setSendingProgress(progress)
    try {
      let progressIdx = 0
      for (let rowIdx = 0; rowIdx < selectedRows.length; rowIdx++) {
        const row = selectedRows[rowIdx]
        const numero = row.numero || row.telefone || row.phone || row[Object.keys(row).find(k => k.toLowerCase().includes('numero') || k.toLowerCase().includes('phone')) || '']
        if (!numero) continue
        // Texto
        for (let blocoIndex = 0; blocoIndex < blocosTexto.length; blocoIndex++) {
          const bloco = blocosTexto[blocoIndex]
          setSendingProgress(prev => prev.map((p, idx) => idx === progressIdx ? { ...p, status: 'enviando' } : p))
          const payload = {
            instance: selectedInstance,
            numeros: [numero],
            mensagem: replaceVars(bloco.content, row),
            apikey: apikey,
            delay: bloco.delay ?? delay
          }
          try {
            const [result] = await dispararMensagem(payload)
            setSendingProgress(prev => prev.map((p, idx) => idx === progressIdx ? { ...p, status: result.status === 'sucesso' ? 'sucesso' : 'erro', mensagem: result.mensagem } : p))
          } catch (err: any) {
            setSendingProgress(prev => prev.map((p, idx) => idx === progressIdx ? { ...p, status: 'erro', mensagem: err?.message || 'Erro' } : p))
          }
          progressIdx++
          if ((bloco.delay ?? delay) > 0) await new Promise(res => setTimeout(res, ((bloco.delay ?? delay) * 1000)))
        }
        // Imagem
        for (let blocoIndex = 0; blocoIndex < blocosImagem.length; blocoIndex++) {
          const bloco = blocosImagem[blocoIndex]
          setSendingProgress(prev => prev.map((p, idx) => idx === progressIdx ? { ...p, status: 'enviando' } : p))
          const file = bloco.file as File
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve((reader.result as string).split(',')[1])
            reader.onerror = reject
            reader.readAsDataURL(file)
          })
          const payload = {
            instance: selectedInstance,
            numeros: [numero],
            base64,
            mimetype: getMimeType(file),
            caption: replaceVars(bloco.content, row),
            fileName: file.name,
            apikey: apikey,
            delay: bloco.delay ?? delay
          }
          try {
            const [result] = await dispararImagem(payload)
            setSendingProgress(prev => prev.map((p, idx) => idx === progressIdx ? { ...p, status: result.status === 'sucesso' ? 'sucesso' : 'erro', mensagem: result.mensagem } : p))
          } catch (err: any) {
            setSendingProgress(prev => prev.map((p, idx) => idx === progressIdx ? { ...p, status: 'erro', mensagem: err?.message || 'Erro' } : p))
          }
          progressIdx++
          if ((bloco.delay ?? delay) > 0) await new Promise(res => setTimeout(res, ((bloco.delay ?? delay) * 1000)))
        }
        // Arquivo
        for (let blocoIndex = 0; blocoIndex < blocosArquivo.length; blocoIndex++) {
          const bloco = blocosArquivo[blocoIndex]
          setSendingProgress(prev => prev.map((p, idx) => idx === progressIdx ? { ...p, status: 'enviando' } : p))
          const file = bloco.file as File
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve((reader.result as string).split(',')[1])
            reader.onerror = reject
            reader.readAsDataURL(file)
          })
          const payload = {
            instance: selectedInstance,
            numeros: [numero],
            base64,
            mimetype: getMimeType(file),
            caption: replaceVars(bloco.content, row),
            fileName: file.name,
            apikey: apikey,
            delay: bloco.delay ?? delay
          }
          try {
            const [result] = await dispararArquivo(payload)
            setSendingProgress(prev => prev.map((p, idx) => idx === progressIdx ? { ...p, status: result.status === 'sucesso' ? 'sucesso' : 'erro', mensagem: result.mensagem } : p))
          } catch (err: any) {
            setSendingProgress(prev => prev.map((p, idx) => idx === progressIdx ? { ...p, status: 'erro', mensagem: err?.message || 'Erro' } : p))
          }
          progressIdx++
          if ((bloco.delay ?? delay) > 0) await new Promise(res => setTimeout(res, ((bloco.delay ?? delay) * 1000)))
        }
        // Áudio
        for (let blocoIndex = 0; blocoIndex < blocosAudio.length; blocoIndex++) {
          const bloco = blocosAudio[blocoIndex]
          setSendingProgress(prev => prev.map((p, idx) => idx === progressIdx ? { ...p, status: 'enviando' } : p))
          const file = bloco.file as File
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve((reader.result as string).split(',')[1])
            reader.onerror = reject
            reader.readAsDataURL(file)
          })
          const payload = {
            instance: selectedInstance,
            numeros: [numero],
            base64,
            apikey: apikey,
            delay: bloco.delay ?? delay
          }
          try {
            const [result] = await dispararAudio(payload)
            setSendingProgress(prev => prev.map((p, idx) => idx === progressIdx ? { ...p, status: result.status === 'sucesso' ? 'sucesso' : 'erro', mensagem: result.mensagem } : p))
          } catch (err: any) {
            setSendingProgress(prev => prev.map((p, idx) => idx === progressIdx ? { ...p, status: 'erro', mensagem: err?.message || 'Erro' } : p))
          }
          progressIdx++
          if ((bloco.delay ?? delay) > 0) await new Promise(res => setTimeout(res, ((bloco.delay ?? delay) * 1000)))
        }
        // Enquete
        for (let blocoIndex = 0; blocoIndex < blocosEnquete.length; blocoIndex++) {
          const bloco = blocosEnquete[blocoIndex]
          setSendingProgress(prev => prev.map((p, idx) => idx === progressIdx ? { ...p, status: 'enviando' } : p))
          const payload = {
            instance: selectedInstance,
            numeros: [numero],
            name: replaceVars(bloco.pollName || '', row),
            values: (bloco.pollOptions || []).map(opt => replaceVars(opt, row)),
            selectableCount: bloco.pollSelectableCount || 1,
            apikey: apikey,
            delay: bloco.delay ?? delay
          }
          try {
            const [result] = await dispararEnquete(payload)
            setSendingProgress(prev => prev.map((p, idx) => idx === progressIdx ? { ...p, status: result.status === 'sucesso' ? 'sucesso' : 'erro', mensagem: result.mensagem } : p))
          } catch (err: any) {
            setSendingProgress(prev => prev.map((p, idx) => idx === progressIdx ? { ...p, status: 'erro', mensagem: err?.message || 'Erro' } : p))
          }
          progressIdx++
          if ((bloco.delay ?? delay) > 0) await new Promise(res => setTimeout(res, ((bloco.delay ?? delay) * 1000)))
        }
        // Botão
        for (let blocoIndex = 0; blocoIndex < blocosButton.length; blocoIndex++) {
          const bloco = blocosButton[blocoIndex]
          setSendingProgress(prev => prev.map((p, idx) => idx === progressIdx ? { ...p, status: 'enviando' } : p))
          const buttonsWithType = (bloco.buttonList || []).map(btn => ({
            ...btn,
            type: 'reply',
            title: replaceVars(btn.title, row),
            displayText: replaceVars(btn.displayText, row),
            id: replaceVars(btn.id, row)
          }))
          const payload: any = {
            instance: selectedInstance,
            numeros: [numero],
            title: replaceVars(bloco.buttonTitle || '', row),
            description: replaceVars(bloco.buttonDescription || '', row),
            footer: replaceVars(bloco.buttonFooter || '', row),
            buttons: buttonsWithType,
            apikey: apikey,
            delay: bloco.delay ?? delay
          }
          try {
            const [result] = await dispararBotao(payload)
            setSendingProgress(prev => prev.map((p, idx) => idx === progressIdx ? { ...p, status: result.status === 'sucesso' ? 'sucesso' : 'erro', mensagem: result.mensagem } : p))
          } catch (err: any) {
            setSendingProgress(prev => prev.map((p, idx) => idx === progressIdx ? { ...p, status: 'erro', mensagem: err?.message || 'Erro' } : p))
          }
          progressIdx++
          if ((bloco.delay ?? delay) > 0) await new Promise(res => setTimeout(res, ((bloco.delay ?? delay) * 1000)))
        }
      }
      toast.success('Mensagens processadas!')
    } catch (err) {
      toast.error('Erro ao disparar mensagens')
    } finally {
      setIsSending(false)
      setTimeout(() => setShowSendingDialog(false), 500)
    }
  }

  const removeContact = (contactId: string) => {
    setSelectedContacts(selectedContacts.filter((c) => c.id !== contactId))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "entregue":
        return <CheckCircle className="w-4 h-4 text-emerald-400" />
      case "enviando":
        return <Clock className="w-4 h-4 text-yellow-400 animate-spin" />
      case "falhou":
        return <XCircle className="w-4 h-4 text-red-400" />
      default:
        return <Clock className="w-4 h-4 text-zinc-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "entregue":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/50"
      case "enviando":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/50"
      case "falhou":
        return "bg-red-500/10 text-red-400 border-red-500/50"
      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/50"
    }
  }

  const deliveredCount = deliveryStatus.filter((s) => s.status === "entregue").length
  const progressPercentage = deliveryStatus.length > 0 ? (deliveredCount / deliveryStatus.length) * 100 : 0

  // Função para abrir o dialog e mostrar loading até os contatos carregarem
  const handleOpenContactsDialog = () => {
    if (!selectedInstance) return
    setLoadingContacts(true)
    setContactsDialogOpen(true)
  }

  // Quando o dialog abrir, aguardar os contatos carregarem e então tirar o loading
  // O componente ContactSelector já faz o fetch, então vamos monitorar o estado do dialog
  useEffect(() => {
    if (!contactsDialogOpen) {
      setLoadingContacts(false)
    }
  }, [contactsDialogOpen])

  // Estado para controlar a etapa do formulário
  const [step, setStep] = useState(1)

  // Estados para cada etapa
  const [fileData, setFileData] = useState<any[]>([])
  const [fileColumns, setFileColumns] = useState<string[]>([])
  const [selectedRows, setSelectedRows] = useState<any[]>([])
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const [numberRestriction, setNumberRestriction] = useState<string>("")

  return (
    <div className="bg-gradient-to-br from-black via-zinc-950 to-black p-4 md:py-4">
      <div className="space-y-6 md:space-y-8 max-w-4xl mx-auto">
        {/* Stepper visual */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3, 4, 5].map((s, i) => (
            <div key={s} className="flex-1 flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${step === s ? 'bg-emerald-500' : 'bg-zinc-700'}`}>{s}</div>
              <span className="text-xs text-zinc-300 mt-2">
                {s === 1 && 'Instância'}
                {s === 2 && 'Upload'}
                {s === 3 && 'Seleção'}
                {s === 4 && 'Mensagem'}
                {s === 5 && 'Disparo'}
              </span>
              {i < 4 && <div className="h-1 w-full bg-zinc-700 mt-2" />}
            </div>
          ))}
        </div>

        {/* Etapa 1: Seleção de Instância */}
        {step === 1 && (
          <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50 shadow-xl shadow-black/20">
            <CardHeader>
              <CardTitle className="text-white text-xl flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-400" />
                Selecionar Instância
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Selecione a instância que será utilizada para o disparo das mensagens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedInstance} onValueChange={setSelectedInstance}>
                <SelectTrigger className="w-full md:w-96 bg-zinc-800 border-zinc-600 text-white">
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
              <div className="flex justify-end mt-6">
                <Button onClick={() => selectedInstance && setStep(2)} disabled={!selectedInstance} className="bg-emerald-600 text-white">Próximo</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Etapa 2: Upload da planilha */}
        {step === 2 && (
          <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50 shadow-xl shadow-black/20">
            <CardHeader>
              <CardTitle className="text-white text-xl flex items-center">Upload de Planilha</CardTitle>
              <CardDescription className="text-zinc-400">Faça upload de uma planilha Excel (.xlsx) ou CSV. Todas as colunas serão reconhecidas como variáveis.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FileUploadTable onData={(d, c) => { setFileData(d); setFileColumns(c); setSelectedRows(d); setSelectedColumns(c); }} />
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>Voltar</Button>
                <Button onClick={() => fileData.length > 0 && setStep(3)} disabled={fileData.length === 0} className="bg-emerald-600 text-white">Próximo</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Etapa 3: Seleção de linhas/colunas */}
        {step === 3 && (
          <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50 shadow-xl shadow-black/20">
            <CardHeader>
              <CardTitle className="text-white text-xl flex items-center">Seleção de Dados</CardTitle>
              <CardDescription className="text-zinc-400">Selecione as linhas e colunas que deseja utilizar no disparo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Seleção de linhas */}
              <div className="mb-4">
                <span className="text-zinc-300 font-medium">Linhas:</span>
                <div className="overflow-x-auto mt-2">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead></TableHead>
                        {fileColumns.map(col => <TableHead key={col}>{col}</TableHead>)}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fileData.map((row, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <Checkbox checked={selectedRows.includes(row)} onCheckedChange={v => {
                              if (v) setSelectedRows([...selectedRows, row])
                              else setSelectedRows(selectedRows.filter(r => r !== row))
                            }} />
                          </TableCell>
                          {fileColumns.map(col => <TableCell key={col}>{row[col]}</TableCell>)}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Button size="sm" variant="outline" className="mt-2" onClick={() => setSelectedRows(fileData)}>Selecionar Todas</Button>
                </div>
              </div>
              {/* Seleção de colunas */}
              <div className="mb-4">
                <span className="text-zinc-300 font-medium">Colunas:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {fileColumns.map(col => (
                    <Badge key={col} className={selectedColumns.includes(col) ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-zinc-800/30 text-zinc-400 border-zinc-700/30'} onClick={() => {
                      setSelectedColumns(selectedColumns.includes(col) ? selectedColumns.filter(c => c !== col) : [...selectedColumns, col])
                    }} style={{ cursor: 'pointer' }}>{col}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>Voltar</Button>
                <Button onClick={() => selectedRows.length > 0 && selectedColumns.length > 0 && setStep(4)} disabled={selectedRows.length === 0 || selectedColumns.length === 0} className="bg-emerald-600 text-white">Próximo</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Etapa 4: Composição da mensagem */}
        {step === 4 && (
          <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50 shadow-xl shadow-black/20">
            <CardHeader>
              <CardTitle className="text-white text-xl flex items-center">Montar Mensagem</CardTitle>
              <CardDescription className="text-zinc-400">Utilize as variáveis abaixo para personalizar sua mensagem. Clique para copiar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedColumns.map(col => (
                  <span key={col} className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400 text-emerald-300 text-xs cursor-pointer select-none hover:bg-emerald-500/20" onClick={() => navigator.clipboard.writeText(`{${col}}`)}>{`{${col}}`}</span>
                ))}
              </div>
              <MessageComposer blocks={messageBlocks} setBlocks={setMessageBlocks} delayGeral={delay} />
              <div className="flex justify-between mt-4">
                <Button variant="outline" onClick={() => setStep(3)}>Voltar</Button>
                <Button onClick={() => setStep(5)} className="bg-emerald-600 text-white">Próximo</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Etapa 5: Restrições e disparo */}
        {step === 5 && (
          <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50 shadow-xl shadow-black/20">
            <CardHeader>
              <CardTitle className="text-white text-xl flex items-center">Restrições e Disparo</CardTitle>
              <CardDescription className="text-zinc-400">Defina restrições de número e confirme o disparo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="restricao" className="text-zinc-300">Restringir números (opcional):</Label>
                <Input id="restricao" placeholder="Ex: DDD, prefixo, blacklist..." value={numberRestriction} onChange={e => setNumberRestriction(e.target.value)} className="mt-2 bg-zinc-800 border-zinc-600 text-white" />
              </div>
              <div className="flex justify-between mt-4">
                <Button variant="outline" onClick={() => setStep(4)}>Voltar</Button>
                <Button onClick={handleMassDispatch} className="bg-emerald-600 text-white">Disparar</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <ContactSelector
        open={contactsDialogOpen}
        onOpenChange={setContactsDialogOpen}
        selected={selectedContacts}
        setSelected={setSelectedContacts}
        instanceName={selectedInstance}
        apikey={process.env.NEXT_PUBLIC_EVOLUTION_API_KEY || ""}
      />
      {/* Popup de envio em tempo real */}
      <ProgressDialog open={showSendingDialog} onOpenChange={open => { if (!isSending) setShowSendingDialog(open) }}>
        <ProgressDialogContent className="max-w-xl bg-zinc-900 border-zinc-700">
          <ProgressDialogHeader>
            <ProgressDialogTitle className="text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-emerald-400" />
              Enviando mensagens em tempo real
            </ProgressDialogTitle>
          </ProgressDialogHeader>
          <div className="mt-4 max-h-96 overflow-y-auto space-y-2">
            {sendingProgress.map((p, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm p-2 rounded border border-zinc-700 bg-zinc-800">
                <span className="font-mono text-xs text-zinc-400">Bloco {p.blocoIndex + 1}</span>
                <span className="truncate flex-1 text-white">{p.numero}</span>
                <span className="truncate max-w-xs text-zinc-400">{p.blocoContent.slice(0, 40)}{p.blocoContent.length > 40 ? '...' : ''}</span>
                {p.status === 'enviando' && <Clock className="w-4 h-4 animate-spin text-yellow-400" />}
                {p.status === 'sucesso' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                {p.status === 'erro' && <XCircle className="w-4 h-4 text-red-400" />}
                <span className="text-xs text-zinc-400">{p.status}</span>
              </div>
            ))}
          </div>
          {!isSending && (
            <Button className="mt-4 w-full" onClick={() => setShowSendingDialog(false)}>
              Fechar
            </Button>
          )}
        </ProgressDialogContent>
      </ProgressDialog>
    </div>
  )
}
