"use client"
import { Upload, FileSpreadsheet, Eye, CheckCircle, Target, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import FileUploadTable from "@/components/FileUploadTable"
import MessageComposerBlock from "@/components/MessageComposerBlock"

import * as React from "react"
import { ArrowUp, ArrowDown, Clock } from "lucide-react"

const XLSDispatchPage = () => {
  const [data, setData] = React.useState<any[]>([])
  const [columns, setColumns] = React.useState<string[]>([])

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black p-6">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Disparo XLS
            </h1>
            <p className="text-zinc-400 mt-2">Importe planilhas e envie mensagens personalizadas</p>
          </div>
          <Button variant="outline" className="border-zinc-700 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Baixar Modelo
          </Button>
        </div>

        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50 shadow-xl shadow-black/20">
          <CardHeader>
            <CardTitle className="text-white text-xl flex items-center">
              <Upload className="w-5 h-5 mr-2 text-emerald-400" />
              Upload de Planilha
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Faça upload de uma planilha Excel (.xlsx) ou CSV. Todas as colunas serão reconhecidas como variáveis.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FileUploadTable onData={(d, c) => { setData(d); setColumns(c) }} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-zinc-800/30 rounded-lg p-4 border border-zinc-700/30">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span className="text-zinc-300 font-medium">Formato Flexível</span>
                </div>
                <p className="text-zinc-400 text-sm">Todas as colunas do arquivo estarão disponíveis como variáveis</p>
              </div>
              <div className="bg-zinc-800/30 rounded-lg p-4 border border-zinc-700/30">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-zinc-300 font-medium">Validação</span>
                </div>
                <p className="text-zinc-400 text-sm">Números no formato +55 11 99999-9999</p>
              </div>
              <div className="bg-zinc-800/30 rounded-lg p-4 border border-zinc-700/30">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-zinc-300 font-medium">Personalização</span>
                </div>
                <p className="text-zinc-400 text-sm">Use {'{coluna}'} nas mensagens</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {columns.length > 0 && (
          <>
            <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50 shadow-xl shadow-black/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white text-xl flex items-center">
                      <Eye className="w-5 h-5 mr-2 text-cyan-400" />
                      Preview dos Dados
                    </CardTitle>
                    <CardDescription className="text-zinc-400">Visualize e valide os dados antes do envio</CardDescription>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">{data.length} contatos</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-zinc-800/30 rounded-lg border border-zinc-700/30 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-zinc-700/50">
                        {columns.map(col => (
                          <TableHead key={col} className="text-zinc-300 font-medium">{col}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.slice(0, 10).map((row, i) => (
                        <TableRow key={i} className="border-zinc-700/30">
                          {columns.map(col => (
                            <TableCell key={col} className="text-zinc-300 max-w-xs truncate">{row[col]}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex items-center justify-between mt-6 p-4 bg-zinc-800/20 rounded-lg border border-zinc-700/30">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      <span className="text-zinc-300">Estrutura lida</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Target className="w-5 h-5 text-cyan-400" />
                      <span className="text-zinc-300">{data.length} contatos encontrados</span>
                    </div>
                  </div>
                  <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-black font-medium shadow-lg shadow-emerald-500/25">
                    <Send className="w-4 h-4 mr-2" />
                    Confirmar e Disparar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50 shadow-xl shadow-black/20 mt-8">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center">
                  Montar Mensagem
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Utilize as variáveis abaixo para personalizar sua mensagem. Clique para copiar.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2 mb-2">
                  {columns.map(col => (
                    <span
                      key={col}
                      className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400 text-emerald-300 text-xs cursor-pointer select-none hover:bg-emerald-500/20"
                      onClick={() => navigator.clipboard.writeText(`{${col}}`)}
                    >
                      {'{'}{col}{'}'}
                    </span>
                  ))}
                </div>
                <MessageComposerWithMove blocksProp={[]} columns={columns} />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

export default XLSDispatchPage

const MessageComposerWithMove = ({ blocksProp, columns }: { blocksProp: any[], columns: string[] }) => {
  const [blocks, setBlocks] = React.useState<any[]>(blocksProp.length ? blocksProp : [{ type: "text", value: "" }])

  const moveBlock = (from: number, to: number) => {
    if (to < 0 || to >= blocks.length) return
    const newBlocks = [...blocks]
    const [removed] = newBlocks.splice(from, 1)
    newBlocks.splice(to, 0, removed)
    setBlocks(newBlocks)
  }

  const addDelayBlock = () => setBlocks([...blocks, { type: "delay", value: 1000 }])

  return (
    <div className="space-y-4">
      {blocks.map((block, idx) => (
        <div key={idx} className="relative bg-zinc-900/70 border border-zinc-700 rounded-lg p-4 flex flex-col gap-2">
          <div className="absolute top-2 right-2 flex gap-1">
            <Button size="icon" variant="ghost" onClick={() => moveBlock(idx, idx - 1)} disabled={idx === 0}><ArrowUp className="w-4 h-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => moveBlock(idx, idx + 1)} disabled={idx === blocks.length - 1}><ArrowDown className="w-4 h-4" /></Button>
          </div>
          {block.type === "delay" ? (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <input
                type="number"
                min={0}
                value={block.value}
                onChange={e => setBlocks(blocks.map((b, i) => i === idx ? { ...b, value: Number(e.target.value) } : b))}
                className="w-24 px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm"
              />
              <span className="text-zinc-400 text-xs">ms de delay</span>
              <Button size="icon" variant="ghost" onClick={() => setBlocks(blocks.filter((_, i) => i !== idx))}><span className="text-red-400">✕</span></Button>
            </div>
          ) : (
            <MessageComposerBlock blocks={[block]} setBlocks={b => setBlocks(blocks.map((blk, i) => i === idx ? b[0] : blk))} />
          )}
        </div>
      ))}
      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" className="border-zinc-700 text-zinc-300" onClick={() => setBlocks([...blocks, { type: "text", value: "" }])}>Adicionar Texto</Button>
        <Button variant="outline" className="border-zinc-700 text-zinc-300" onClick={() => setBlocks([...blocks, { type: "image", value: null }])}>Adicionar Imagem</Button>
        <Button variant="outline" className="border-zinc-700 text-zinc-300" onClick={() => setBlocks([...blocks, { type: "audio", value: null }])}>Adicionar Áudio</Button>
        <Button variant="outline" className="border-zinc-700 text-zinc-300" onClick={() => setBlocks([...blocks, { type: "list", value: "" }])}>Adicionar Lista</Button>
        <Button variant="outline" className="border-zinc-700 text-zinc-300" onClick={addDelayBlock}>Adicionar Delay</Button>
      </div>
    </div>
  )
}
