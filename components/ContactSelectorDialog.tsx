import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { X } from "lucide-react"

const mockContacts = [
    { id: 1, name: "João Silva", avatar: "JS" },
    { id: 2, name: "Maria Santos", avatar: "MS" },
    { id: 3, name: "Pedro Costa", avatar: "PC" },
    { id: 4, name: "Ana Lima", avatar: "AL" },
    { id: 5, name: "Carlos Souza", avatar: "CS" },
]

const ContactSelectorDialog = ({ open, onOpenChange, selected, setSelected }: { open: boolean, onOpenChange: (o: boolean) => void, selected: any[], setSelected: (s: any[]) => void }) => {
    const [search, setSearch] = useState("")
    const filtered = mockContacts.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    const toggleSelect = (contact: any) => {
        if (selected.some(s => s.id === contact.id)) setSelected(selected.filter(s => s.id !== contact.id))
        else setSelected([...selected, contact])
    }
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Selecionar Contatos</DialogTitle>
                </DialogHeader>
                <Input placeholder="Buscar contato..." value={search} onChange={e => setSearch(e.target.value)} className="mb-4" />
                <div className="max-h-60 overflow-y-auto space-y-2">
                    {filtered.map(c => (
                        <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800 cursor-pointer" onClick={() => toggleSelect(c)}>
                            <Avatar className="w-8 h-8"><AvatarFallback>{c.avatar}</AvatarFallback></Avatar>
                            <span className="text-white flex-1">{c.name}</span>
                            {selected.some(s => s.id === c.id) && <span className="text-emerald-400 font-bold">Selecionado</span>}
                        </div>
                    ))}
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                    {selected.map(c => (
                        <div key={c.id} className="flex items-center gap-1 bg-zinc-800 text-white rounded-full px-3 py-1 text-sm">
                            <Avatar className="w-6 h-6"><AvatarFallback>{c.avatar}</AvatarFallback></Avatar>
                            {c.name}
                            <button onClick={() => setSelected(selected.filter(s => s.id !== c.id))}><X className="w-3 h-3 ml-1" /></button>
                        </div>
                    ))}
                </div>
                <Button className="w-full mt-4" onClick={() => onOpenChange(false)}>Confirmar</Button>
            </DialogContent>
        </Dialog>
    )
}

export default ContactSelectorDialog 