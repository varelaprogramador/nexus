"use client"
import { Target, Activity, Clock, Play, CheckCircle, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function MassDispatchPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black p-6">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Disparo em Massa
            </h1>
            <p className="text-zinc-400 mt-2">Envie mensagens para múltiplos contatos</p>
          </div>
          <Button variant="outline" className="border-zinc-700 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800">
            <Clock className="w-4 h-4 mr-2" />
            Campanhas Agendadas
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50 shadow-xl shadow-black/20">
            <CardHeader>
              <CardTitle className="text-white text-xl flex items-center">
                <Target className="w-5 h-5 mr-2 text-emerald-400" />
                Configurar Campanha
              </CardTitle>
              <CardDescription className="text-zinc-400">Configure sua mensagem e destinatários</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="campaign-name" className="text-zinc-300 font-medium">
                  Nome da Campanha
                </Label>
                <Input
                  id="campaign-name"
                  placeholder="Ex: Promoção Black Friday"
                  className="bg-zinc-800/50 border-zinc-700 text-white mt-2"
                />
              </div>

              <div>
                <Label htmlFor="message" className="text-zinc-300 font-medium">
                  Mensagem
                </Label>
                <Textarea
                  id="message"
                  placeholder="Olá, {nome}! Temos uma oferta especial para você..."
                  className="bg-zinc-800/50 border-zinc-700 text-white mt-2 min-h-32"
                  rows={6}
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm text-zinc-400">Use {"{nome}"} para personalizar</p>
                  <p className="text-sm text-zinc-500">0/1000 caracteres</p>
                </div>
              </div>

              <div>
                <Label className="text-zinc-300 font-medium">Destinatários</Label>
                <Select>
                  <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white mt-2">
                    <SelectValue placeholder="Selecionar grupos ou contatos" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    <SelectItem value="all">Todos os contatos (8,456)</SelectItem>
                    <SelectItem value="marketing">Grupo Marketing (150)</SelectItem>
                    <SelectItem value="vendas">Grupo Vendas (89)</SelectItem>
                    <SelectItem value="premium">Grupo Premium (67)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-black font-medium">
                  <Play className="w-4 h-4 mr-2" />
                  Enviar Agora
                </Button>
                <Button
                  variant="outline"
                  className="border-emerald-500/50 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Agendar
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50 shadow-xl shadow-black/20">
            <CardHeader>
              <CardTitle className="text-white text-xl flex items-center">
                <Activity className="w-5 h-5 mr-2 text-cyan-400" />
                Status em Tempo Real
              </CardTitle>
              <CardDescription className="text-zinc-400">Acompanhe o progresso do envio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-zinc-800/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-zinc-300">Progresso Geral</span>
                    <span className="text-emerald-400 font-bold">67%</span>
                  </div>
                  <div className="w-full bg-zinc-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: "67%" }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { contact: "João Silva", status: "entregue", time: "14:30", avatar: "JS" },
                    { contact: "Maria Santos", status: "enviando", time: "14:31", avatar: "MS" },
                    { contact: "Pedro Costa", status: "falhou", time: "14:32", avatar: "PC" },
                    { contact: "Ana Lima", status: "entregue", time: "14:33", avatar: "AL" },
                    { contact: "Carlos Souza", status: "pendente", time: "14:34", avatar: "CS" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-zinc-800/20 rounded-lg border border-zinc-700/30"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-cyan-400 text-black font-bold text-xs">
                            {item.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-white font-medium text-sm">{item.contact}</p>
                          <p className="text-zinc-400 text-xs">{item.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {item.status === "entregue" && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                        {item.status === "enviando" && <Clock className="w-4 h-4 text-yellow-400 animate-spin" />}
                        {item.status === "falhou" && <XCircle className="w-4 h-4 text-red-400" />}
                        {item.status === "pendente" && <Clock className="w-4 h-4 text-zinc-400" />}
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            item.status === "entregue"
                              ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10"
                              : item.status === "enviando"
                                ? "border-yellow-500/50 text-yellow-400 bg-yellow-500/10"
                                : item.status === "falhou"
                                  ? "border-red-500/50 text-red-400 bg-red-500/10"
                                  : "border-zinc-500/50 text-zinc-400 bg-zinc-500/10"
                          }`}
                        >
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
