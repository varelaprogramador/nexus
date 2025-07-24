"use client"
import { MessageSquare, Plus, Upload, Search, Filter, Edit, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { useInstances } from '@/hooks/use-instances'
import { useEffect, useMemo, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'

export function useContacts(instanceName: string, apikey: string, enabled = true) {
  return useQuery({
    queryKey: ['contacts', instanceName, apikey],
    queryFn: async () => {
      const { data } = await api.post(
        `/chat/findContacts/${instanceName}`,
        { where: {} },
        {
          headers: { apikey, 'Content-Type': 'application/json' }
        }
      )
      return Array.isArray(data) ? data : []
    },
    enabled: enabled && !!instanceName
  })
}

function formatPhone(jid: string) {
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

// Ajuste para larguras mais compactas
const COLUMN_WIDTHS = [180, 140, 130, 130, 60, 90, 120] // px para cada coluna

const cellStyle = (i: number) => ({ width: COLUMN_WIDTHS[i], minWidth: COLUMN_WIDTHS[i], maxWidth: COLUMN_WIDTHS[i], padding: '8px 12px' })

const VirtualizedContactsTableBody = ({ contacts }: { contacts: any[] }) => {
  const tableContainerRef = useRef<HTMLDivElement | null>(null)
  const rowVirtualizer = useVirtualizer({
    count: contacts.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 48,
    overscan: 10,
  })
  return (
    <div
      ref={tableContainerRef}
      style={{
        height: '420px',
        overflow: 'auto',
        position: 'relative',
      }}
    >
      <Table>
        <TableHeader>
          <TableRow className="border-zinc-700/50">
            <TableHead className="text-zinc-300 font-medium" style={cellStyle(0)}>Contato</TableHead>
            <TableHead className="text-zinc-300 font-medium" style={cellStyle(1)}>Número</TableHead>
            <TableHead className="text-zinc-300 font-medium" style={cellStyle(2)}>Criado em</TableHead>
            <TableHead className="text-zinc-300 font-medium" style={cellStyle(3)}>Atualizado em</TableHead>
            <TableHead className="text-zinc-300 font-medium" style={cellStyle(4)}>Foto</TableHead>
            <TableHead className="text-zinc-300 font-medium" style={cellStyle(5)}>Status</TableHead>
            <TableHead className="text-zinc-300 font-medium" style={cellStyle(6)}>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody style={{
          display: 'grid',
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: 'relative',
        }}>
          {rowVirtualizer.getVirtualItems().map(virtualRow => {
            const contact = contacts[virtualRow.index]
            return (
              <TableRow
                key={contact.id}
                style={{
                  display: 'flex',
                  position: 'absolute',
                  transform: `translateY(${virtualRow.start}px)`,
                  width: '100%',
                }}
                className="border-zinc-700/30 hover:bg-zinc-800/20 transition-colors"
              >
                <TableCell style={cellStyle(0)}>
                  <span className="text-white font-medium truncate">{contact.pushName || formatPhone(contact.remoteJid)}</span>
                </TableCell>
                <TableCell className="text-zinc-300 font-mono" style={cellStyle(1)}>{formatPhone(contact.remoteJid)}</TableCell>
                <TableCell className="text-zinc-300" style={cellStyle(2)}>{contact.createdAt ? new Date(contact.createdAt).toLocaleString('pt-BR') : '-'}</TableCell>
                <TableCell className="text-zinc-300" style={cellStyle(3)}>{contact.updatedAt ? new Date(contact.updatedAt).toLocaleString('pt-BR') : '-'}</TableCell>
                <TableCell style={cellStyle(4)}>
                  {contact.profilePicUrl ? (
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={contact.profilePicUrl} />
                      <AvatarFallback className="bg-zinc-700 text-white">?</AvatarFallback>
                    </Avatar>
                  ) : (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-zinc-700 text-white">?</AvatarFallback>
                    </Avatar>
                  )}
                </TableCell>
                <TableCell style={cellStyle(5)}>
                  <Badge variant="default" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    Ativo
                  </Badge>
                </TableCell>
                <TableCell style={cellStyle(6)}>
                  <div className="flex space-x-1">
                    <Button size="sm" variant="ghost" className="w-8 h-8 p-0 text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="w-8 h-8 p-0 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10">
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="w-8 h-8 p-0 text-zinc-400 hover:text-red-400 hover:bg-red-500/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

export default function ContactsPage() {
  const apikey = process.env.NEXT_PUBLIC_EVOLUTION_API_KEY || ""
  const { data: instances = [] } = useInstances()
  const [activeInstance, setActiveInstance] = useState<string>("")
  const shouldFetch = !!activeInstance
  const { data: contacts = [], isLoading, isError, error } = useContacts(activeInstance, apikey, shouldFetch)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(handler)
  }, [search])

  const filteredContacts = useMemo(() => {
    const searchLower = debouncedSearch.toLowerCase().replace(/\D/g, '')
    return contacts.filter((contact: any) => {
      const name = (contact.pushName || '').toLowerCase()
      const remoteJid = (contact.remoteJid || '').toLowerCase()
      const formatted = formatPhone(contact.remoteJid).replace(/\D/g, '')
      return (
        name.includes(debouncedSearch.toLowerCase()) ||
        formatted.includes(searchLower) ||
        remoteJid.includes(searchLower)
      )
    })
  }, [contacts, debouncedSearch])

  function exportContactsToXLS(contacts: any[]) {
    const data = contacts.map((c) => ({
      Nome: c.pushName || '',
      Numero: formatPhone(c.remoteJid),
      NumeroLimpo: c.remoteJid.replace(/@.*$/, ''),
      CriadoEm: c.createdAt ? new Date(c.createdAt).toLocaleString('pt-BR') : '',
      AtualizadoEm: c.updatedAt ? new Date(c.updatedAt).toLocaleString('pt-BR') : '',
      Status: 'Ativo'
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Contatos')
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    saveAs(new Blob([buf], { type: 'application/octet-stream' }), `Contatos_${activeInstance || 'instancia'}.xlsx`)
  }

  // Exibir toast de erro se houver erro na requisição
  if (isError && error) {
    toast.error('Erro ao buscar contatos', {
      description: error.message || 'Ocorreu um erro ao buscar os contatos.'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black  flex flex-col items-center justify-center">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Contatos
            </h1>
            <p className="text-zinc-400 mt-2">Gerencie sua base de contatos</p>
          </div>
          <div className="flex space-x-3">
            <Select value={activeInstance} onValueChange={setActiveInstance}>
              <SelectTrigger className="w-64 bg-zinc-900/50 border-zinc-700 text-white">
                <SelectValue placeholder="Selecione uma instância" />
              </SelectTrigger>
              <SelectContent>
                {instances.map((inst) => (
                  <SelectItem key={inst.id} value={inst.name}>
                    {inst.profileName || inst.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="border-zinc-700 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800">
              <Upload className="w-4 h-4 mr-2" />
              Importar CSV
            </Button>
            <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-black font-medium shadow-lg shadow-emerald-500/25">
              <Plus className="w-4 h-4 mr-2" />
              Novo Contato
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {contacts.length > 0 && (
            <>
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nome ou número..."
                  className="pl-10 bg-zinc-900/50 border-zinc-700 text-white"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                className="border-zinc-700 bg-zinc-900/50 text-zinc-300"
                onClick={() => exportContactsToXLS(filteredContacts)}
              >
                Exportar para Excel
              </Button>
            </>
          )}
          <Select>
            <SelectTrigger className="w-48 bg-zinc-900/50 border-zinc-700 text-white">
              <SelectValue placeholder="Filtrar por grupo" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700">
              <SelectItem value="all">Todos os grupos</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="vendas">Vendas</SelectItem>
              <SelectItem value="suporte">Suporte</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-zinc-700 bg-zinc-900/50 text-zinc-300">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>

        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50 shadow-xl shadow-black/20 max-w-[900px]">
          <CardContent className="p-0">
            {!activeInstance ? (
              <div className="text-center py-16 text-muted-foreground">
                <h3 className="text-lg font-medium">Selecione uma instância para visualizar os contatos</h3>
              </div>
            ) : isLoading ? (
              <div className="p-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center space-x-4 mb-4">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="text-center py-16 text-red-400">
                <h3 className="text-lg font-medium">Erro ao buscar contatos</h3>
                <p className="mt-2">{error?.message || 'Ocorreu um erro ao buscar os contatos.'}</p>
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                  <MessageSquare className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-medium">Nenhum contato encontrado</h3>
                <p className="mt-2">Adicione ou sincronize contatos para começar.</p>
              </div>
            ) : (
              <VirtualizedContactsTableBody contacts={filteredContacts} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
