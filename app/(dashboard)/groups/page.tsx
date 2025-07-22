"use client"
import { Users, Plus, Search, Eye, Edit, Send, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function GroupsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black p-6">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Grupos
            </h1>
            <p className="text-zinc-400 mt-2">Organize seus contatos em grupos</p>
          </div>
          <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-black font-medium shadow-lg shadow-emerald-500/25">
            <Plus className="w-4 h-4 mr-2" />
            Novo Grupo
          </Button>
        </div>

        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50 shadow-xl shadow-black/20">
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
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-700/50 hover:bg-zinc-800/30">
                  <TableHead className="text-zinc-300 font-medium">Nome do Grupo</TableHead>
                  <TableHead className="text-zinc-300 font-medium">Contatos</TableHead>
                  <TableHead className="text-zinc-300 font-medium">Última Atividade</TableHead>
                  <TableHead className="text-zinc-300 font-medium">Status</TableHead>
                  <TableHead className="text-zinc-300 font-medium">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: "Grupo Marketing", contacts: 150, date: "Hoje, 14:30", status: "ativo", growth: "+12" },
                  { name: "Grupo Vendas", contacts: 89, date: "Ontem, 16:45", status: "ativo", growth: "+5" },
                  { name: "Grupo Suporte", contacts: 234, date: "2 dias atrás", status: "inativo", growth: "-3" },
                  { name: "Grupo Premium", contacts: 67, date: "Hoje, 09:15", status: "ativo", growth: "+8" },
                ].map((group, i) => (
                  <TableRow key={i} className="border-zinc-700/30 hover:bg-zinc-800/20 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{group.name}</p>
                          <p className="text-zinc-400 text-sm">{group.growth} novos esta semana</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-bold text-lg">{group.contacts}</span>
                        <Badge variant="outline" className="border-zinc-600 text-zinc-400 text-xs">
                          contatos
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-zinc-300">{group.date}</TableCell>
                    <TableCell>
                      <Badge
                        variant={group.status === "ativo" ? "default" : "secondary"}
                        className={
                          group.status === "ativo"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
                        }
                      >
                        {group.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-8 h-8 p-0 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-8 h-8 p-0 text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-8 h-8 p-0 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-8 h-8 p-0 text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
