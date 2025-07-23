import * as React from "react"
import { useDropzone } from "react-dropzone"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button"

const FileUploadTable = ({ onData }: { onData?: (data: any[], columns: string[]) => void }) => {
    const [fileName, setFileName] = React.useState<string>("")
    const [columns, setColumns] = React.useState<string[]>([])
    const [rows, setRows] = React.useState<any[]>([])
    const [error, setError] = React.useState<string>("")

    const onDrop = React.useCallback((acceptedFiles: File[]) => {
        setError("")
        if (!acceptedFiles.length) return
        const file = acceptedFiles[0]
        setFileName(file.name)
        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer)
                const workbook = XLSX.read(data, { type: "array" })
                const sheetName = workbook.SheetNames[0]
                const worksheet = workbook.Sheets[sheetName]
                const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" })
                if (json.length === 0) throw new Error("Arquivo vazio ou sem dados.")
                const firstRow = typeof json[0] === 'object' && json[0] !== null ? json[0] : {}
                const cols = Object.keys(firstRow)
                setColumns(cols)
                setRows(json)
                onData?.(json, cols)
            } catch (err: any) {
                setError("Falha ao ler arquivo. Verifique o formato.")
                setColumns([])
                setRows([])
            }
        }
        reader.readAsArrayBuffer(file)
    }, [onData])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
            'application/vnd.ms-excel': ['.xls'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
        },
        multiple: false
    })

    return (
        <div className="space-y-4">
            <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-emerald-400 bg-emerald-50/10' : 'border-zinc-700/50 bg-zinc-900/30'}`}>
                <input {...getInputProps()} />
                <p className="text-zinc-300">Arraste e solte um arquivo XLS, XLSX ou CSV aqui, ou clique para selecionar</p>
                {fileName && <p className="mt-2 text-emerald-400 text-sm">Arquivo: {fileName}</p>}
                {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
            </div>
            {columns.length > 0 && (
                <div className="overflow-x-auto border border-zinc-700/50 rounded-lg bg-zinc-900/30">
                    <table className="min-w-full text-xs text-zinc-200">
                        <thead>
                            <tr>
                                {columns.map(col => (
                                    <th key={col} className="px-3 py-2 border-b border-zinc-700/30 text-left font-semibold">{col}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.slice(0, 5).map((row, i) => (
                                <tr key={i} className="border-b border-zinc-800/20">
                                    {columns.map(col => (
                                        <td key={col} className="px-3 py-2">{row[col]}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="p-2 text-xs text-zinc-400">Mostrando as 5 primeiras linhas</div>
                </div>
            )}
        </div>
    )
}

export default FileUploadTable 