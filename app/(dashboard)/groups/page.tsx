"use client"
import { Users, Plus, Search, Eye, Edit, Send, Trash2 } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useInstances } from '@/hooks/use-instances'
import { UseQueryOptions } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { useVirtualizer } from '@tanstack/react-virtual'




function useGroupMembers(instanceName: string, groupJid: string, apikey: string) {
  return useQuery({
    queryKey: ['group-members', instanceName, groupJid, apikey],
    queryFn: async () => {
      const { data } = await api.get(`/group/participants/${instanceName}?groupJid=${groupJid}`, {
        headers: { apikey }
      })
      // Sempre retorna array de membros
      if (Array.isArray(data)) return data
      if (data && Array.isArray(data.participants)) return data.participants
      return []
    },
    enabled: false // fetch manual
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

function exportMembersToXLS(members: any[], groupName: string) {
  const data = members.map((m) => ({
    Nome: m.name || '',
    Numero: formatPhone(m.id),
    NumeroLimpo: m.id.replace(/@.*$/, ''),
    Admin: m.admin === 'superadmin' ? 'Super Admin' : m.admin === 'admin' ? 'Admin' : ''
  }))
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Membros')
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), `Membros_${groupName}.xlsx`)
}

type Group = {
  id?: string
  remoteJid?: string
  pushName?: string
  subject?: string
  subjectOwner?: string
  subjectTime?: number
  pictureUrl?: string | null
  size?: number
  creation?: number
  owner?: string
  desc?: string
  descId?: string
  restrict?: boolean
  announce?: boolean
  createdAt?: string
}

const COLUMN_WIDTHS = [400, 200, 180] // px para cada coluna

const VirtualizedTableBody = ({ groups, setSelectedGroup, setShowMembers, tableContainerRef }: {
  groups: any[],
  setSelectedGroup: (g: any) => void,
  setShowMembers: (b: boolean) => void,
  tableContainerRef: React.MutableRefObject<HTMLDivElement | null> | any
}) => {
  const rowVirtualizer = useVirtualizer({
    count: groups.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 56, // altura média de uma linha
    overscan: 10,
  })
  return (
    <TableBody style={{
      display: 'grid',
      height: `${rowVirtualizer.getTotalSize()}px`,
      position: 'relative',
    }}>
      {rowVirtualizer.getVirtualItems().map(virtualRow => {
        const group = groups[virtualRow.index]
        return (
          <TableRow
            key={group.remoteJid || group.id}
            style={{
              display: 'flex',
              position: 'absolute',
              transform: `translateY(${virtualRow.start}px)`,
              width: '100%',
            }}
            className="border-zinc-700/30 hover:bg-zinc-800/20 transition-colors"
          >
            <TableCell className="font-medium" style={{ width: COLUMN_WIDTHS[0], minWidth: COLUMN_WIDTHS[0], maxWidth: COLUMN_WIDTHS[0] }}>
              <div className="flex items-center space-x-3 min-w-0">
                {group.pictureUrl && typeof group.pictureUrl === 'string' && group.pictureUrl.startsWith('http') ? (
                  <img
                    src={group.pictureUrl}
                    alt="Foto do grupo"
                    className="w-10 h-10 rounded-lg object-cover bg-zinc-800 border border-zinc-700"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-emerald-400" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-white font-medium truncate">{group.pushName || group.subject || group.remoteJid}</p>
                  <p className="text-zinc-400 text-xs truncate">ID: {group.remoteJid || group.id}</p>
                </div>
              </div>
            </TableCell>
            <TableCell className="text-zinc-300" style={{ width: COLUMN_WIDTHS[3], minWidth: COLUMN_WIDTHS[3], maxWidth: COLUMN_WIDTHS[3] }}>
              {group.creation ? new Date(group.creation * 1000).toLocaleDateString("pt-BR") : (group.createdAt ? new Date(group.createdAt).toLocaleDateString("pt-BR") : '-')}
            </TableCell>
            <TableCell style={{ width: COLUMN_WIDTHS[4], minWidth: COLUMN_WIDTHS[4], maxWidth: COLUMN_WIDTHS[4] }}>
              <div className="flex space-x-1">
                <Button size="sm" variant="ghost" className="w-8 h-8 p-0 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                  onClick={() => { setSelectedGroup(group); setShowMembers(false); }}>
                  <Eye className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="w-8 h-8 p-0 text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="w-8 h-8 p-0 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10">
                  <Send className="w-4 h-4" />
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
  )
}

// Novo hook para buscar grupos
const useGroups = (instanceName: string, apikey: string, enabled = true) => {
  return useQuery({
    queryKey: ['groups', instanceName, apikey],
    queryFn: async () => {
      const { data } = await api.post(
        `/chat/findContacts/${instanceName}`,
        { where: {} },
        {
          headers: { apikey, 'Content-Type': 'application/json' }
        }
      )
      // Filtrar apenas grupos: id começando com '120'
      return Array.isArray(data) ? data.filter((item: any) => item.remoteJid && item.remoteJid.startsWith('120')) : []
    },
    enabled: enabled && !!instanceName
  })
}

export default function GroupsPage() {
  // Buscar instâncias disponíveis
  const apikey = process.env.NEXT_PUBLIC_EVOLUTION_API_KEY || ""
  const { data: instances = [] } = useInstances()
  // Estado para instância ativa
  const [activeInstance, setActiveInstance] = useState<string>(instances[0]?.name || "")
  const shouldFetch = !!activeInstance
  // Corrigido: buscar grupos com useGroups
  const { data: groups = [], isLoading } = useGroups(activeInstance, apikey, shouldFetch)
  const [search, setSearch] = useState("")
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [showMembers, setShowMembers] = useState(false)
  const membersQuery = useGroupMembers(activeInstance, selectedGroup?.remoteJid || '', apikey)
  const tableContainerRef = useState<null | HTMLDivElement>(null)

  // Filtro seguro para grupos
  const filteredGroups = (groups as any[]).filter((group: any) => {
    const name = group.pushName || group.subject || group.remoteJid || ''
    return name.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black flex flex-col items-center justify-center">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Grupos
            </h1>
            <p className="text-zinc-400 mt-2">Organize seus contatos em grupos</p>
          </div>
          <div className="flex gap-2 items-center">
            <Select value={activeInstance} onValueChange={setActiveInstance}>
              <SelectTrigger className="w-64 bg-zinc-800/50 border-zinc-700 text-white">
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
            <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-black font-medium shadow-lg shadow-emerald-500/25">
              <Plus className="w-4 h-4 mr-2" />
              Novo Grupo
            </Button>
          </div>
        </div>

        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50 shadow-xl shadow-black/20 max-w-[900px]	">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white text-xl">Seus Grupos</CardTitle>
                <CardDescription className="text-zinc-400">Gerencie e organize seus contatos</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar grupos..."
                    className="pl-10 bg-zinc-800/50 border-zinc-700 text-white w-64"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {!activeInstance ? (
              <div className="text-center py-16 text-muted-foreground">
                <h3 className="text-lg font-medium">Selecione uma instância para visualizar os grupos</h3>
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
            ) : filteredGroups.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Users className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-medium">Nenhum grupo encontrado</h3>
                <p className="mt-2">Crie ou sincronize grupos para começar.</p>
              </div>
            ) : (
              <div
                ref={tableContainerRef as any}
                className="p-4"
                style={{
                  height: '600px',
                  overflow: 'auto',
                  position: 'relative',
                }}
              >
                <Table /* Remover qualquer estilo de overflow do Table */>
                  <TableHeader>
                    <TableRow className="border-zinc-700/50 hover:bg-zinc-800/30">
                      <TableHead className="text-zinc-300 font-medium" style={{ width: COLUMN_WIDTHS[0], minWidth: COLUMN_WIDTHS[0], maxWidth: COLUMN_WIDTHS[0] }}>Nome do Grupo</TableHead>
                      <TableHead className="text-zinc-300 font-medium" style={{ width: COLUMN_WIDTHS[3], minWidth: COLUMN_WIDTHS[3], maxWidth: COLUMN_WIDTHS[3] }}>Criado em</TableHead>
                      <TableHead className="text-zinc-300 font-medium" style={{ width: COLUMN_WIDTHS[4], minWidth: COLUMN_WIDTHS[4], maxWidth: COLUMN_WIDTHS[4] }}>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <VirtualizedTableBody
                    groups={filteredGroups}
                    setSelectedGroup={setSelectedGroup}
                    setShowMembers={setShowMembers}
                    tableContainerRef={tableContainerRef}
                  />
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Dialog open={!!selectedGroup} onOpenChange={() => { setSelectedGroup(null); setShowMembers(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Grupo</DialogTitle>
          </DialogHeader>
          {selectedGroup && (
            <>
              <div className="mb-4 space-y-1">
                <div><b>Nome:</b> {selectedGroup.pushName || selectedGroup.subject || selectedGroup.remoteJid}</div>
                <div><b>ID:</b> {selectedGroup.remoteJid || selectedGroup.id}</div>
                <div><b>Descrição:</b> {selectedGroup.desc || '-'}</div>
                <div><b>Participantes:</b> {selectedGroup.size || '-'}</div>
              </div>
              <Button onClick={() => { setShowMembers(true); membersQuery.refetch(); }} disabled={membersQuery.isFetching} className="mb-2">
                {membersQuery.isFetching ? 'Carregando...' : 'Exibir membros'}
              </Button>
              <Button
                className="mb-2 ml-2"
                onClick={() => exportMembersToXLS(membersQuery.data, selectedGroup.pushName || selectedGroup.subject || selectedGroup.remoteJid || 'grupo')}
                disabled={!membersQuery.data || membersQuery.data.length === 0}
              >
                Exportar membros para XLSX
              </Button>
              {showMembers && (
                <div className="mt-2">
                  {membersQuery.isFetching ? (
                    <div>Carregando membros...</div>
                  ) : (
                    <ul className="max-h-48 overflow-y-auto text-sm space-y-1">
                      {membersQuery.data?.length === 0 && <li className="text-muted-foreground">Nenhum membro encontrado.</li>}
                      {membersQuery.data?.map((member: any) => (
                        <li key={member.id} className="border-b border-muted-foreground/10 py-1 flex items-center">
                          <span className="font-medium">{member.name || member.id}</span>
                          <span className="ml-2 text-xs text-muted-foreground">{formatPhone(member.id)}</span>
                          {member.admin && (
                            <span className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold
                              ${member.admin === 'superadmin'
                                ? 'bg-emerald-600 text-white'
                                : member.admin === 'admin'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-zinc-700 text-zinc-200'
                              }`
                            }>
                              {member.admin === 'superadmin'
                                ? 'Super Admin'
                                : member.admin === 'admin'
                                  ? 'Admin'
                                  : member.admin}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
