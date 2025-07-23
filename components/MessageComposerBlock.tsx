import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Image, Mic, List, BarChart2, X } from "lucide-react"

const blockTypes = [
    { type: "text", label: "Texto", icon: <Plus className="w-4 h-4" /> },
    { type: "image", label: "Imagem", icon: <Image className="w-4 h-4" /> },
    { type: "audio", label: "Áudio", icon: <Mic className="w-4 h-4" /> },
    { type: "list", label: "Lista", icon: <List className="w-4 h-4" /> },
    { type: "poll", label: "Enquete", icon: <BarChart2 className="w-4 h-4" /> },
]

const defaultBlock = { type: "text", value: "" }

const MessageComposerBlock = ({ blocks, setBlocks }: { blocks: any[], setBlocks: (b: any[]) => void }) => {
    const addBlock = (type: string) => setBlocks([...blocks, { type, value: "" }])
    const removeBlock = (idx: number) => setBlocks(blocks.filter((_, i) => i !== idx))
    const updateBlock = (idx: number, value: any) => setBlocks(blocks.map((b, i) => i === idx ? { ...b, value } : b))

    return (
        <div className="space-y-4">
            {blocks.map((block, idx) => (
                <div key={idx} className="relative bg-zinc-900/70 border border-zinc-700 rounded-lg p-4 flex flex-col gap-2">
                    <Button size="icon" variant="ghost" className="absolute top-2 right-2" onClick={() => removeBlock(idx)}><X className="w-4 h-4" /></Button>
                    {block.type === "text" && (
                        <Textarea
                            placeholder="Digite sua mensagem..."
                            className="bg-zinc-800/50 border-zinc-700 text-white min-h-24"
                            value={block.value}
                            onChange={e => updateBlock(idx, e.target.value)}
                        />
                    )}
                    {block.type === "image" && (
                        <input type="file" accept="image/*" className="text-white" onChange={e => updateBlock(idx, e.target.files?.[0])} />
                    )}
                    {block.type === "audio" && (
                        <input type="file" accept="audio/*" className="text-white" onChange={e => updateBlock(idx, e.target.files?.[0])} />
                    )}
                    {block.type === "list" && (
                        <Textarea
                            placeholder="Insira uma lista, um item por linha"
                            className="bg-zinc-800/50 border-zinc-700 text-white min-h-16"
                            value={block.value}
                            onChange={e => updateBlock(idx, e.target.value)}
                        />
                    )}
                    {block.type === "poll" && (
                        <Textarea
                            placeholder="Insira opções da enquete, um item por linha"
                            className="bg-zinc-800/50 border-zinc-700 text-white min-h-16"
                            value={block.value}
                            onChange={e => updateBlock(idx, e.target.value)}
                        />
                    )}
                </div>
            ))}
            <div className="flex gap-2">
                {blockTypes.map(bt => (
                    <Button key={bt.type} variant="outline" className="border-zinc-700 text-zinc-300" onClick={() => addBlock(bt.type)}>{bt.icon} <span className="ml-1">{bt.label}</span></Button>
                ))}
            </div>
        </div>
    )
}

export default MessageComposerBlock 