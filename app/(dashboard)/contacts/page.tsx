"use client"
import { MessageSquare, Plus, Upload, Search, Filter, Edit, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ContactsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black p-6">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Contatos
            </h1>
            <p className="text-zinc-400 mt-2">Gerencie sua base de contatos</p>
          </div>
          <div className="flex space-x-3">
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
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <Input placeholder="Buscar contatos..." className="pl-10 bg-zinc-900/50 border-zinc-700 text-white" />
          </div>
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

        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50 shadow-xl shadow-black/20">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-700/50">
                  <TableHead className="text-zinc-300 font-medium">Contato</TableHead>
                  <TableHead className="text-zinc-300 font-medium">Número</TableHead>
                  <TableHead className="text-zinc-300 font-medium">Grupo</TableHead>
                  <TableHead className="text-zinc-300 font-medium">Última Mensagem</TableHead>
                  <TableHead className="text-zinc-300 font-medium">Status</TableHead>
                  <TableHead className="text-zinc-300 font-medium">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  {
                    name: "João Silva",
                    number: "+55 11 99999-9999",
                    group: "Marketing",
                    lastMessage: "2 horas atrás",
                    status: "ativo",
                  },
                  {
                    name: "Maria Santos",
                    number: "+55 11 88888-8888",
                    group: "Vendas",
                    lastMessage: "1 dia atrás",
                    status: "ativo",
                  },
                  {
                    name: "Pedro Costa",
                    number: "+55 11 77777-7777",
                    group: "Suporte",
                    lastMessage: "3 dias atrás",
                    status: "inativo",
                  },
                  {
                    name: "Ana Lima",
                    number: "+55 11 66666-6666",
                    group: "Premium",
                    lastMessage: "Hoje",
                    status: "ativo",
                  },
                ].map((contact, i) => (
                  <TableRow key={i} className="border-zinc-700/30 hover:bg-zinc-800/20 transition-colors">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage
                            src={`/placeholder.svg?height=40&width=40&text=${contact.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}`}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-cyan-400 text-black font-bold text-sm">
                            {contact.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-white font-medium">{contact.name}</p>
                          <p className="text-zinc-400 text-sm">Contato ativo</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-zinc-300 font-mono">{contact.number}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 bg-emerald-500/10">
                        {contact.group}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-zinc-300">{contact.lastMessage}</TableCell>
                    <TableCell>
                      <Badge
                        variant={contact.status === "ativo" ? "default" : "secondary"}
                        className={
                          contact.status === "ativo"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
                        }
                      >
                        {contact.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
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
                          <MessageSquare className="w-4 h-4" />
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
