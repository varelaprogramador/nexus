"use client"

import { Target, Activity, Clock, CheckCircle, XCircle, Users, Send, Calendar, Plus, X, Zap, FileText, ImageIcon, Mic, BarChart3, MousePointer, Sparkles, Phone, Timer, AlertCircle, TrendingUp, Eye, Waves } from "lucide-react"
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
import { useState, useEffect, useCallback } from "react"
import { useContacts } from "../contacts/page"
import { FixedSizeList as List } from 'react-window'
import InfiniteLoader from 'react-window-infinite-loader'

import { useInstances } from "@/hooks/use-instances"
import useDisparo from '@/hooks/use-disparo'
import { Dialog as ProgressDialog, DialogContent as ProgressDialogContent, DialogHeader as ProgressDialogHeader, DialogTitle as ProgressDialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

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
  const [allContacts, setAllContacts] = useState<any[]>([])
  const [page, setPage] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(true)

  // Buscar contatos com paginação
  const { data: contactsData, isLoading } = useContacts(instanceName, apikey, true, 100, page * 100)

  useEffect(() => {
    if (contactsData?.contacts) {
      if (page === 0) {
        setAllContacts(contactsData.contacts)
      } else {
        setAllContacts(prev => [...prev, ...contactsData.contacts])
      }
      setHasNextPage(contactsData.hasNextPage)
    }
  }, [contactsData, page])

  useEffect(() => {
    // Reset quando abrir o dialog
    if (open && instanceName) {
      setAllContacts([])
      setPage(0)
      setHasNextPage(true)
    }
  }, [open, instanceName])

  const loadMoreContacts = useCallback(() => {
    if (hasNextPage && !isLoading) {
      setPage(prev => prev + 1)
    }
  }, [hasNextPage, isLoading])

  const groups: string[] = Array.from(new Set(allContacts.map((c) => c.group).filter((g): g is string => Boolean(g))))

  const filteredContacts = allContacts.filter((contact) => {
    const name = (contact.pushName || '').toLowerCase()
    const phone = (contact.remoteJid || '').toLowerCase()
    const matchesSearch =
      name.includes(searchTerm.toLowerCase()) || phone.includes(searchTerm)
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

            <div className="h-96">
              <InfiniteLoader
                isItemLoaded={(index) => index < filteredContacts.length}
                itemCount={!searchTerm && hasNextPage ? filteredContacts.length + 1 : filteredContacts.length}
                loadMoreItems={loadMoreContacts}
              >
                {({ onItemsRendered, ref }) => (
                  <List
                    ref={ref}
                    width="100%"
                    height={384}
                    itemCount={!searchTerm && hasNextPage ? filteredContacts.length + 1 : filteredContacts.length}
                    itemSize={76}
                    onItemsRendered={onItemsRendered}
                  >
                    {({ index, style }) => {
                      if (index >= filteredContacts.length) {
                        return (
                          <div style={style} className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-zinc-700 animate-pulse rounded-full"></div>
                              <div className="flex-1">
                                <div className="h-4 bg-zinc-700 animate-pulse rounded mb-1"></div>
                                <div className="h-3 bg-zinc-700 animate-pulse rounded w-2/3"></div>
                              </div>
                            </div>
                          </div>
                        )
                      }

                      const contact = filteredContacts[index]
                      const isSelected = selected.some((c) => c.id === contact.id)

                      return (
                        <div
                          style={style}
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
                    }}
                  </List>
                )}
              </InfiniteLoader>
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
  const { user } = useUser()
  const router = useRouter()
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
    contactName?: string
    status: 'pendente' | 'enviando' | 'sucesso' | 'erro'
    mensagem?: string
    timestamp?: Date
    blockType: string
    duration?: number
    retryCount?: number
  }>>([])

  const [sendingStats, setSendingStats] = useState({
    total: 0,
    sent: 0,
    failed: 0,
    inProgress: 0,
    startTime: null as Date | null,
    estimatedCompletion: null as Date | null
  })

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

  const handleSendNow = async () => {
    if (selectedContacts.length === 0) {
      toast.error("Selecione pelo menos um contato")
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
    // Inicializa progresso e estatísticas
    const numeros = selectedContacts.map((c) => formatPhone(c.phone))
    const contactsMap = new Map(selectedContacts.map(c => [formatPhone(c.phone), c.name]))
    let progress: typeof sendingProgress = []
    let blocoCount = 0
    
    // Função helper para criar item de progresso
    const createProgressItem = (blocoIndex: number, content: string, numero: string, blockType: string) => ({
      blocoIndex,
      blocoContent: content,
      numero,
      contactName: contactsMap.get(numero) || 'Desconhecido',
      status: 'pendente' as const,
      timestamp: new Date(),
      blockType,
      duration: 0,
      retryCount: 0
    })
    
    blocosTexto.forEach((bloco, blocoIndex) => {
      numeros.forEach(numero => {
        progress.push(createProgressItem(blocoCount, bloco.content, numero, 'texto'))
      })
      blocoCount++
    })
    blocosImagem.forEach((bloco, blocoIndex) => {
      numeros.forEach(numero => {
        progress.push(createProgressItem(blocoCount, bloco.content || 'Imagem', numero, 'imagem'))
      })
      blocoCount++
    })
    blocosArquivo.forEach((bloco, blocoIndex) => {
      numeros.forEach(numero => {
        progress.push(createProgressItem(blocoCount, bloco.content || 'Arquivo', numero, 'arquivo'))
      })
      blocoCount++
    })
    blocosAudio.forEach((bloco, blocoIndex) => {
      numeros.forEach(numero => {
        progress.push(createProgressItem(blocoCount, bloco.file?.name || 'Áudio', numero, 'audio'))
      })
      blocoCount++
    })
    blocosEnquete.forEach((bloco, blocoIndex) => {
      numeros.forEach(numero => {
        progress.push(createProgressItem(blocoCount, bloco.pollName || 'Enquete', numero, 'enquete'))
      })
      blocoCount++
    })
    blocosButton.forEach((bloco, blocoIndex) => {
      numeros.forEach(numero => {
        progress.push(createProgressItem(blocoCount, bloco.buttonTitle || 'Botão', numero, 'botao'))
      })
      blocoCount++
    })
    
    setSendingProgress(progress)
    setSendingStats({
      total: progress.length,
      sent: 0,
      failed: 0,
      inProgress: 0,
      startTime: new Date(),
      estimatedCompletion: null
    })
    try {
      // Envio de texto
      for (let blocoIndex = 0; blocoIndex < blocosTexto.length; blocoIndex++) {
        const bloco = blocosTexto[blocoIndex]
        for (let numeroIndex = 0; numeroIndex < numeros.length; numeroIndex++) {
          const numero = numeros[numeroIndex]
          const startTime = Date.now()
          setSendingProgress(prev => prev.map((p, idx) =>
            p.blocoIndex === blocoIndex && p.numero === numero ? { ...p, status: 'enviando', timestamp: new Date() } : p
          ))
          setSendingStats(prev => ({ ...prev, inProgress: prev.inProgress + 1 }))
          const payload = {
            instance: selectedInstance,
            numeros: [numero],
            mensagem: bloco.content,
            apikey: apikey,
            delay: bloco.delay ?? delay
          }
          console.log('Enviando disparo:', payload)
          try {
            const [result] = await dispararMensagem(payload)
            const duration = Date.now() - startTime
            const isSuccess = result.status === 'sucesso'
            setSendingProgress(prev => prev.map((p, idx) =>
              p.blocoIndex === blocoIndex && p.numero === numero
                ? { ...p, status: isSuccess ? 'sucesso' : 'erro', mensagem: result.mensagem, duration, timestamp: new Date() }
                : p
            ))
            setSendingStats(prev => ({
              ...prev,
              inProgress: prev.inProgress - 1,
              sent: isSuccess ? prev.sent + 1 : prev.sent,
              failed: !isSuccess ? prev.failed + 1 : prev.failed,
              estimatedCompletion: prev.sent + prev.failed > 0 ? 
                new Date(Date.now() + ((prev.total - prev.sent - prev.failed) * (duration || 2000))) : null
            }))
          } catch (err: any) {
            const duration = Date.now() - startTime
            setSendingProgress(prev => prev.map((p, idx) =>
              p.blocoIndex === blocoIndex && p.numero === numero
                ? { ...p, status: 'erro', mensagem: err?.message || 'Erro', duration, timestamp: new Date() }
                : p
            ))
            setSendingStats(prev => ({
              ...prev,
              inProgress: prev.inProgress - 1,
              failed: prev.failed + 1
            }))
          }
          if ((bloco.delay ?? delay) > 0) {
            await new Promise(res => setTimeout(res, ((bloco.delay ?? delay) * 1000)))
          }
        }
      }
      // Envio de imagem
      for (let blocoIndex = 0; blocoIndex < blocosImagem.length; blocoIndex++) {
        const bloco = blocosImagem[blocoIndex]
        for (let numeroIndex = 0; numeroIndex < numeros.length; numeroIndex++) {
          const numero = numeros[numeroIndex]
          setSendingProgress(prev => prev.map((p, idx) =>
            p.blocoIndex === (blocosTexto.length + blocoIndex) && p.numero === numero ? { ...p, status: 'enviando' } : p
          ))
          // Converter arquivo para base64
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
            caption: bloco.content,
            fileName: file.name,
            apikey: apikey,
            delay: bloco.delay ?? delay
          }
          console.log('Enviando imagem:', payload)
          try {
            const [result] = await dispararImagem(payload)
            setSendingProgress(prev => prev.map((p, idx) =>
              p.blocoIndex === (blocosTexto.length + blocoIndex) && p.numero === numero
                ? { ...p, status: result.status === 'sucesso' ? 'sucesso' : 'erro', mensagem: result.mensagem }
                : p
            ))
          } catch (err: any) {
            setSendingProgress(prev => prev.map((p, idx) =>
              p.blocoIndex === (blocosTexto.length + blocoIndex) && p.numero === numero
                ? { ...p, status: 'erro', mensagem: err?.message || 'Erro' }
                : p
            ))
          }
          if ((bloco.delay ?? delay) > 0) {
            await new Promise(res => setTimeout(res, ((bloco.delay ?? delay) * 1000)))
          }
        }
      }
      // Envio de arquivo
      for (let blocoIndex = 0; blocoIndex < blocosArquivo.length; blocoIndex++) {
        const bloco = blocosArquivo[blocoIndex]
        for (let numeroIndex = 0; numeroIndex < numeros.length; numeroIndex++) {
          const numero = numeros[numeroIndex]
          setSendingProgress(prev => prev.map((p, idx) =>
            p.blocoIndex === (blocosTexto.length + blocosImagem.length + blocoIndex) && p.numero === numero ? { ...p, status: 'enviando' } : p
          ))
          // Converter arquivo para base64
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
            caption: bloco.content,
            fileName: file.name,
            apikey: apikey,
            delay: bloco.delay ?? delay
          }
          console.log('Enviando arquivo:', payload)
          try {
            const [result] = await dispararArquivo(payload)
            setSendingProgress(prev => prev.map((p, idx) =>
              p.blocoIndex === (blocosTexto.length + blocosImagem.length + blocoIndex) && p.numero === numero
                ? { ...p, status: result.status === 'sucesso' ? 'sucesso' : 'erro', mensagem: result.mensagem }
                : p
            ))
          } catch (err: any) {
            setSendingProgress(prev => prev.map((p, idx) =>
              p.blocoIndex === (blocosTexto.length + blocosImagem.length + blocoIndex) && p.numero === numero
                ? { ...p, status: 'erro', mensagem: err?.message || 'Erro' }
                : p
            ))
          }
          if ((bloco.delay ?? delay) > 0) {
            await new Promise(res => setTimeout(res, ((bloco.delay ?? delay) * 1000)))
          }
        }
      }
      // Envio de áudio
      for (let blocoIndex = 0; blocoIndex < blocosAudio.length; blocoIndex++) {
        const bloco = blocosAudio[blocoIndex]
        for (let numeroIndex = 0; numeroIndex < numeros.length; numeroIndex++) {
          const numero = numeros[numeroIndex]
          setSendingProgress(prev => prev.map((p, idx) =>
            p.blocoIndex === (blocosTexto.length + blocosImagem.length + blocosArquivo.length + blocoIndex) && p.numero === numero ? { ...p, status: 'enviando' } : p
          ))
          // Converter arquivo para base64
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
          console.log('Enviando áudio:', payload)
          try {
            const [result] = await dispararAudio(payload)
            setSendingProgress(prev => prev.map((p, idx) =>
              p.blocoIndex === (blocosTexto.length + blocosImagem.length + blocosArquivo.length + blocoIndex) && p.numero === numero
                ? { ...p, status: result.status === 'sucesso' ? 'sucesso' : 'erro', mensagem: result.mensagem }
                : p
            ))
          } catch (err: any) {
            setSendingProgress(prev => prev.map((p, idx) =>
              p.blocoIndex === (blocosTexto.length + blocosImagem.length + blocosArquivo.length + blocoIndex) && p.numero === numero
                ? { ...p, status: 'erro', mensagem: err?.message || 'Erro' }
                : p
            ))
          }
          if ((bloco.delay ?? delay) > 0) {
            await new Promise(res => setTimeout(res, ((bloco.delay ?? delay) * 1000)))
          }
        }
      }
      // Envio de enquete
      for (let blocoIndex = 0; blocoIndex < blocosEnquete.length; blocoIndex++) {
        const bloco = blocosEnquete[blocoIndex]
        for (let numeroIndex = 0; numeroIndex < numeros.length; numeroIndex++) {
          const numero = numeros[numeroIndex]
          setSendingProgress(prev => prev.map((p, idx) =>
            p.blocoIndex === (blocosTexto.length + blocosImagem.length + blocosArquivo.length + blocosAudio.length + blocoIndex) && p.numero === numero ? { ...p, status: 'enviando' } : p
          ))
          const payload = {
            instance: selectedInstance,
            numeros: [numero],
            name: bloco.pollName || '',
            values: bloco.pollOptions || [],
            selectableCount: bloco.pollSelectableCount || 1,
            apikey: apikey,
            delay: bloco.delay ?? delay
          }
          console.log('Enviando enquete:', payload)
          try {
            const [result] = await dispararEnquete(payload)
            setSendingProgress(prev => prev.map((p, idx) =>
              p.blocoIndex === (blocosTexto.length + blocosImagem.length + blocosArquivo.length + blocosAudio.length + blocoIndex) && p.numero === numero
                ? { ...p, status: result.status === 'sucesso' ? 'sucesso' : 'erro', mensagem: result.mensagem }
                : p
            ))
          } catch (err: any) {
            setSendingProgress(prev => prev.map((p, idx) =>
              p.blocoIndex === (blocosTexto.length + blocosImagem.length + blocosArquivo.length + blocosAudio.length + blocoIndex) && p.numero === numero
                ? { ...p, status: 'erro', mensagem: err?.message || 'Erro' }
                : p
            ))
          }
          if ((bloco.delay ?? delay) > 0) {
            await new Promise(res => setTimeout(res, ((bloco.delay ?? delay) * 1000)))
          }
        }
      }
      // Envio de botões
      for (let blocoIndex = 0; blocoIndex < blocosButton.length; blocoIndex++) {
        const bloco = blocosButton[blocoIndex]
        for (let numeroIndex = 0; numeroIndex < numeros.length; numeroIndex++) {
          const numero = numeros[numeroIndex]
          setSendingProgress(prev => prev.map((p, idx) =>
            p.blocoIndex === (blocosTexto.length + blocosImagem.length + blocosArquivo.length + blocosAudio.length + blocosEnquete.length + blocoIndex) && p.numero === numero ? { ...p, status: 'enviando' } : p
          ))
          // Corrigir botões: adicionar type: 'reply' em cada botão
          const buttonsWithType = (bloco.buttonList || []).map(btn => ({
            ...btn,
            type: 'reply'
          }))
          // Montar payload e omitir mentioned se vazio
          const payload: any = {
            instance: selectedInstance,
            numeros: [numero],
            title: bloco.buttonTitle || '',
            description: bloco.buttonDescription || '',
            footer: bloco.buttonFooter || '',
            buttons: buttonsWithType,
            apikey: apikey,
            delay: bloco.delay ?? delay
          }
          console.log('Enviando botão:', payload)
          try {
            const [result] = await dispararBotao(payload)
            setSendingProgress(prev => prev.map((p, idx) =>
              p.blocoIndex === (blocosTexto.length + blocosImagem.length + blocosArquivo.length + blocosAudio.length + blocosEnquete.length + blocoIndex) && p.numero === numero
                ? { ...p, status: result.status === 'sucesso' ? 'sucesso' : 'erro', mensagem: result.mensagem }
                : p
            ))
          } catch (err: any) {
            setSendingProgress(prev => prev.map((p, idx) =>
              p.blocoIndex === (blocosTexto.length + blocosImagem.length + blocosArquivo.length + blocosAudio.length + blocosEnquete.length + blocoIndex) && p.numero === numero
                ? { ...p, status: 'erro', mensagem: err?.message || 'Erro' }
                : p
            ))
          }
          if ((bloco.delay ?? delay) > 0) {
            await new Promise(res => setTimeout(res, ((bloco.delay ?? delay) * 1000)))
          }
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

  const handleSaveCampaign = async () => {
    if (selectedContacts.length === 0) {
      toast.error("Selecione pelo menos um contato")
      return
    }

    if (!selectedInstance) {
      toast.error("Selecione uma instância")
      return
    }

    // Verificar se há blocos válidos
    const validBlocks = messageBlocks.filter((block) => {
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
    })

    if (validBlocks.length === 0) {
      toast.error("Configure pelo menos uma mensagem válida")
      return
    }

    const campaignName = prompt("Digite um nome para a campanha:")
    if (!campaignName) return

    try {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: campaignName,
          description: `Campanha criada a partir do disparo em massa - ${validBlocks.length} blocos, ${selectedContacts.length} contatos`,
          instance: selectedInstance,
          userId: user?.id,
          messageBlocks: validBlocks.map(block => ({
            ...block,
            delay: block.delay ?? delay
          })),
          contacts: selectedContacts.map(contact => ({
            id: contact.id,
            name: contact.name,
            phone: contact.phone,
            number: contact.phone
          })),
          settings: {
            defaultDelay: delay
          }
        })
      })

      if (response.ok) {
        toast.success("Campanha salva com sucesso! Redirecionando...")
        setTimeout(() => {
          router.push("/campaigns")
        }, 1500)
      } else {
        const error = await response.json()
        toast.error(error.error || "Erro ao salvar campanha")
      }
    } catch (error) {
      console.error("Erro ao salvar campanha:", error)
      toast.error("Erro ao salvar campanha")
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

  return (
    <div className=" bg-gradient-to-br from-black via-zinc-950 to-black p-4 md:py-4">
      <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Disparo em Massa
            </h1>
            <p className="text-zinc-400 mt-2">Envie mensagens para múltiplos contatos de forma eficiente</p>
          </div>
          <Button variant="outline" className="border-zinc-700 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 w-fit">
            <Clock className="w-4 h-4 mr-2" />
            Campanhas Agendadas
          </Button>
        </div>

        <div className="grid grid-cols-1  gap-6 md:gap-8">
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-6 md:space-y-8">
            {/* Card de seleção de instância */}
            <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50 shadow-xl shadow-black/20 mb-2">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-400" />
                  Instância
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
              </CardContent>
            </Card>


            {/* Recipients */}
            <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50 shadow-xl shadow-black/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-cyan-400" />
                      Destinatários
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                      {selectedContacts.length} contatos selecionados
                    </CardDescription>
                  </div>
                  <Button
                    onClick={handleOpenContactsDialog}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={!selectedInstance || loadingContacts}
                  >
                    {loadingContacts ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Carregando...
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4 mr-2" />
                        Selecionar Contatos
                      </>
                    )}
                  </Button>
                </div>

              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {selectedContacts.length === 0 ? (
                    <div className="text-zinc-400 text-center py-8 w-full">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhum contato selecionado</p>
                      <p className="text-sm">Clique em "Selecionar Contatos" para começar</p>
                    </div>
                  ) : (
                    selectedContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center gap-2 bg-zinc-800 text-white rounded-full px-3 py-1 text-sm group hover:bg-zinc-700 transition-colors border border-zinc-700 min-w-[0] max-w-full"
                        style={{ maxWidth: 240 }}
                      >
                        <Avatar className="w-6 h-6">
                          {contact.avatar && contact.avatar.startsWith('http') ? (
                            <img src={contact.avatar} alt={contact.name} className="w-6 h-6 rounded-full object-cover" />
                          ) : (
                            <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-cyan-400 text-black font-bold text-xs">
                              {contact.name ? contact.name.slice(0, 2).toUpperCase() : "?"}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="truncate flex flex-col min-w-0">
                          <span className="truncate font-medium">{contact.name}</span>
                          <span className="truncate text-xs text-zinc-400">{contact.phone}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeContact(contact.id)}
                          className="w-5 h-5 p-0 hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
                          tabIndex={-1}
                        >
                          <X className="w-3 h-3 text-red-400" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
            {/* Message Composer */}
            <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50 shadow-xl shadow-black/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-400" />
                  Compositor de Mensagem
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Crie sua mensagem com texto, imagens e arquivos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Campo para definir o delay */}
                <div className="mt-4 flex items-center gap-2">
                  <Label htmlFor="delay" className="text-zinc-300 mb-8 flex items-center justify-around gap-2">Delay geral (segundos):</Label>
                  <span className="text-zinc-500 text-xs">(Usado como padrão se não preencher o delay do bloco)</span>
                  <Input
                    id="delay"
                    type="number"
                    min={0}
                    value={delay}
                    onChange={e => setDelay(Number(e.target.value))}
                    className="w-24 bg-zinc-800 border-zinc-600 text-white"
                  />

                </div>
                <MessageComposer blocks={messageBlocks} setBlocks={setMessageBlocks} delayGeral={delay} />
              </CardContent>
            </Card>
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleSendNow}
                disabled={isSending || loadingDisparo || selectedContacts.length === 0}
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-black font-medium flex-1"
              >
                {(isSending || loadingDisparo) ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Agora (Sync)
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleSaveCampaign}
                disabled={selectedContacts.length === 0 || !selectedInstance}
                variant="outline"
                className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 flex-1"
              >
                <Target className="w-4 h-4 mr-2" />
                Salvar como Campanha
              </Button>
            </div>
          </div>


        </div>
      </div>

      <ContactSelector
        open={contactsDialogOpen}
        onOpenChange={setContactsDialogOpen}
        selected={selectedContacts}
        setSelected={setSelectedContacts}
        instanceName={selectedInstance}
        apikey={process.env.NEXT_PUBLIC_EVOLUTION_API_KEY || ""}
      />
      {/* Popup de envio em tempo real com design aprimorado */}
      <ProgressDialog open={showSendingDialog} onOpenChange={open => { if (!isSending) setShowSendingDialog(open) }}>
        <ProgressDialogContent className="max-w-4xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border-zinc-700 shadow-2xl">
          <ProgressDialogHeader>
            <ProgressDialogTitle className="text-white flex items-center gap-3 text-xl">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg">
                <Waves className="w-6 h-6 text-black animate-pulse" />
              </div>
              <div>
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent font-bold">
                  Disparo em Tempo Real
                </span>
                <p className="text-sm text-zinc-400 font-normal mt-1">
                  Acompanhe o envio das mensagens em tempo real
                </p>
              </div>
            </ProgressDialogTitle>
          </ProgressDialogHeader>
          
          {/* Estatísticas em tempo real */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{sendingStats.sent}</p>
                  <p className="text-xs text-emerald-400">Enviadas</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{sendingStats.failed}</p>
                  <p className="text-xs text-red-400">Falharam</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-400 animate-spin" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{sendingStats.inProgress}</p>
                  <p className="text-xs text-yellow-400">Enviando</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border border-cyan-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{sendingStats.total}</p>
                  <p className="text-xs text-cyan-400">Total</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Barra de progresso animada */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-zinc-300 font-medium">Progresso Geral</span>
              <span className="text-sm text-zinc-400">
                {Math.round(((sendingStats.sent + sendingStats.failed) / sendingStats.total) * 100)}%
              </span>
            </div>
            <div className="h-3 bg-zinc-800 rounded-full overflow-hidden relative">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 transition-all duration-500 ease-out relative"
                style={{ width: `${((sendingStats.sent + sendingStats.failed) / sendingStats.total) * 100}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
              {sendingStats.inProgress > 0 && (
                <div className="absolute top-0 h-full bg-yellow-400/30 animate-pulse" 
                     style={{ 
                       left: `${((sendingStats.sent + sendingStats.failed) / sendingStats.total) * 100}%`,
                       width: `${(sendingStats.inProgress / sendingStats.total) * 100}%`
                     }} />
              )}
            </div>
          </div>
          
          {/* Lista de envios com design aprimorado */}
          <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
            {sendingProgress.map((p, idx) => {
              const getBlockTypeIcon = (type: string) => {
                switch (type) {
                  case 'texto': return <FileText className="w-4 h-4" />
                  case 'imagem': return <ImageIcon className="w-4 h-4" />
                  case 'arquivo': return <FileText className="w-4 h-4" />
                  case 'audio': return <Mic className="w-4 h-4" />
                  case 'enquete': return <BarChart3 className="w-4 h-4" />
                  case 'botao': return <MousePointer className="w-4 h-4" />
                  default: return <FileText className="w-4 h-4" />
                }
              }
              
              const getStatusBg = (status: string) => {
                switch (status) {
                  case 'enviando': return 'bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border-yellow-500/30'
                  case 'sucesso': return 'bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 border-emerald-500/30'
                  case 'erro': return 'bg-gradient-to-r from-red-500/10 to-red-600/10 border-red-500/30'
                  default: return 'bg-zinc-800/50 border-zinc-700'
                }
              }
              
              return (
                <div key={idx} className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${getStatusBg(p.status)}`}>
                  {/* Bloco info */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-2 bg-zinc-700/50 rounded-lg text-zinc-400">
                      {getBlockTypeIcon(p.blockType)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-mono text-xs text-zinc-400">Bloco {p.blocoIndex + 1}</p>
                      <p className="text-xs text-zinc-500 capitalize">{p.blockType}</p>
                    </div>
                  </div>
                  
                  {/* Contato info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <Phone className="w-4 h-4 text-cyan-400" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{p.contactName}</p>
                        <p className="text-xs text-zinc-400 truncate font-mono">{p.numero}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Conteúdo */}
                  <div className="flex items-center gap-2 min-w-0 max-w-xs">
                    <Eye className="w-3 h-3 text-zinc-500" />
                    <span className="text-xs text-zinc-300 truncate">
                      {p.blocoContent.length > 30 ? `${p.blocoContent.slice(0, 30)}...` : p.blocoContent}
                    </span>
                  </div>
                  
                  {/* Status e timing */}
                  <div className="flex items-center gap-3">
                    {p.duration && p.duration > 0 && (
                      <div className="flex items-center gap-1 text-xs text-zinc-500">
                        <Timer className="w-3 h-3" />
                        <span>{(p.duration / 1000).toFixed(1)}s</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      {p.status === 'enviando' && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                          <Clock className="w-4 h-4 animate-spin text-yellow-400" />
                        </div>
                      )}
                      {p.status === 'sucesso' && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        </div>
                      )}
                      {p.status === 'erro' && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                          <XCircle className="w-4 h-4 text-red-400" />
                        </div>
                      )}
                      {p.status === 'pendente' && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-zinc-400 rounded-full" />
                          <Clock className="w-4 h-4 text-zinc-400" />
                        </div>
                      )}
                      <span className={`text-xs font-medium capitalize ${
                        p.status === 'sucesso' ? 'text-emerald-400' : 
                        p.status === 'erro' ? 'text-red-400' : 
                        p.status === 'enviando' ? 'text-yellow-400' : 'text-zinc-400'}`}>
                        {p.status === 'sucesso' ? 'Enviada' : 
                         p.status === 'erro' ? 'Falhou' : 
                         p.status === 'enviando' ? 'Enviando' : 'Pendente'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Timestamp */}
                  <div className="text-xs text-zinc-500 min-w-0">
                    {p.timestamp?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Botão de fechamento */}
          {!isSending && (
            <div className="flex items-center gap-4 mt-6 pt-4 border-t border-zinc-700">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Sparkles className="w-4 h-4" />
                <span>Disparo concluído com sucesso!</span>
              </div>
              <Button 
                className="ml-auto bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-black font-medium" 
                onClick={() => setShowSendingDialog(false)}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Fechar
              </Button>
            </div>
          )}
        </ProgressDialogContent>
      </ProgressDialog>
    </div>
  )
}
