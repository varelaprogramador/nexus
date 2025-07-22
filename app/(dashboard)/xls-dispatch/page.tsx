"use client"
import { Upload, FileSpreadsheet, Eye, CheckCircle, Target, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function XLSDispatchPage() {
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
              Faça upload de uma planilha Excel (.xlsx) ou CSV com as colunas: Nome, Número, Mensagem
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed border-zinc-600 rounded-xl p-12 text-center bg-zinc-800/20 hover:bg-zinc-800/30 transition-colors">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Arraste e solte sua planilha aqui</h3>
              <p className="text-zinc-400 mb-4">Suporte para arquivos .xlsx, .xls e .csv até 10MB</p>
              <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-black font-medium">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Selecionar Arquivo
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-zinc-800/30 rounded-lg p-4 border border-zinc-700/30">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span className="text-zinc-300 font-medium">Formato Correto</span>
                </div>
                <p className="text-zinc-400 text-sm">Colunas: Nome, Número, Mensagem</p>
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
                <p className="text-zinc-400 text-sm">Use {"{nome}"} nas mensagens</p>
              </div>
            </div>
          </CardContent>
        </Card>

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
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">✅ 3 contatos válidos</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-zinc-800/30 rounded-lg border border-zinc-700/30 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-700/50">
                    <TableHead className="text-zinc-300 font-medium">Nome</TableHead>
                    <TableHead className="text-zinc-300 font-medium">Número</TableHead>
                    <TableHead className="text-zinc-300 font-medium">Mensagem</TableHead>
                    <TableHead className="text-zinc-300 font-medium">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    {
                      name: "João Silva",
                      number: "+55 11 99999-9999",
                      message: "Olá João, temos uma oferta especial!",
                      status: "válido",
                    },
                    {
                      name: "Maria Santos",
                      number: "+55 11 88888-8888",
                      message: "Oi Maria, não perca nossa promoção!",
                      status: "válido",
                    },
                    {
                      name: "Pedro Costa",
                      number: "+55 11 77777-7777",
                      message: "Pedro, sua conta tem benefícios exclusivos!",
                      status: "válido",
                    },
                  ].map((row, i) => (
                    <TableRow key={i} className="border-zinc-700/30">
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-cyan-400 text-black font-bold text-xs">
                              {row.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-white font-medium">{row.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-300 font-mono">{row.number}</TableCell>
                      <TableCell className="text-zinc-300 max-w-xs truncate">{row.message}</TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">{row.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between mt-6 p-4 bg-zinc-800/20 rounded-lg border border-zinc-700/30">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-zinc-300">Estrutura validada</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-cyan-400" />
                  <span className="text-zinc-300">3 contatos encontrados</span>
                </div>
              </div>
              <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-black font-medium shadow-lg shadow-emerald-500/25">
                <Send className="w-4 h-4 mr-2" />
                Confirmar e Disparar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
