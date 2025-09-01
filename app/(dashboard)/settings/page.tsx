"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, Upload, RotateCcw, Save, Palette, Type, Image, Globe, Lock } from "lucide-react"
import { useSystemConfig, useUpdateSystemConfig, useResetSystemConfig, useUploadLogo } from "@/hooks/use-system-config"
import { useIsAdmin } from "@/hooks/use-admin-check"
import { toast } from "sonner"

export default function SettingsPage() {
  const { data: config, isLoading } = useSystemConfig()
  const updateConfig = useUpdateSystemConfig()
  const resetConfig = useResetSystemConfig()
  const { uploadLogo, isUploading } = useUploadLogo()
  const { isAdmin, isLoading: isAdminLoading } = useIsAdmin()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    systemName: "",
    systemSubtitle: "",
    primaryColor: "",
    secondaryColor: "",
    favicon: ""
  })

  // Atualizar formData quando config carrega
  useEffect(() => {
    if (config) {
      setFormData({
        systemName: config.systemName,
        systemSubtitle: config.systemSubtitle,
        primaryColor: config.primaryColor,
        secondaryColor: config.secondaryColor,
        favicon: config.favicon || ""
      })
    }
  }, [config])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      await uploadLogo(file)
      toast.success("Logo atualizado com sucesso!")
    } catch (error) {
      console.error("Erro ao fazer upload:", error)
    }
  }

  const handleSave = async () => {
    try {
      await updateConfig.mutateAsync(formData)
    } catch (error) {
      console.error("Erro ao salvar:", error)
    }
  }

  const handleReset = async () => {
    if (window.confirm("Tem certeza que deseja resetar todas as configurações para o padrão?")) {
      try {
        await resetConfig.mutateAsync()
        // Resetar o formData para os valores padrão após sucesso
        setFormData({
          systemName: "NEXUS",
          systemSubtitle: "WhatsApp Manager",
          primaryColor: "#10b981",
          secondaryColor: "#06b6d4",
          favicon: ""
        })
      } catch (error) {
        console.error("Erro ao resetar:", error)
      }
    }
  }

  if (isLoading || isAdminLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Carregando configurações...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-red-500/10 border-2 border-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-10 h-10 text-red-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Acesso Restrito</h2>
            <p className="text-zinc-400 max-w-md">
              Você não tem permissão para acessar as configurações do sistema.
              Apenas administradores podem modificar essas configurações.
            </p>
          </div>
        </div>

        <Card className="bg-gradient-to-br from-red-900/20 to-red-800/10 border-red-500/30 max-w-md">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                <Lock className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <h3 className="text-red-300 font-medium text-sm">Acesso de Administrador Necessário</h3>
                <p className="text-red-400/80 text-xs mt-1">
                  Para acessar esta página, você precisa ter a role "admin" configurada em sua conta.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Configurações Globais
          </h1>
          <p className="text-zinc-400 mt-1">Personalize a aparência e identidade aplicada para todos os usuários</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleReset}
            variant="outline"
            className="border-red-600 text-red-400 hover:bg-red-600/10"
            disabled={resetConfig.isPending}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Resetar
          </Button>
          <Button
            onClick={handleSave}
            className="bg-emerald-600 hover:bg-emerald-700"
            disabled={updateConfig.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logo e Identidade Visual */}
        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Image className="w-5 h-5 text-emerald-400" />
              Logo e Identidade
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Configure o logo e informações visuais do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Preview do Logo Atual */}
            <div className="flex items-center gap-4 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/30">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg">
                  {config?.logoBase64 ? (
                    <img
                      src={config.logoBase64}
                      alt="Logo"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : config?.logoUrl ? (
                    <img
                      src={config.logoUrl}
                      alt="Logo"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <span className="text-black font-bold text-sm">
                      {formData.systemName.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-white font-semibold">{formData.systemName}</h3>
                <p className="text-zinc-400 text-sm">{formData.systemSubtitle}</p>
              </div>
            </div>

            {/* Upload de Logo */}
            <div>
              <Label className="text-zinc-300 mb-2 block">Logo do Sistema</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                disabled={isUploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? "Enviando..." : "Fazer Upload do Logo"}
              </Button>
              <p className="text-xs text-zinc-500 mt-1">PNG, JPG até 2MB</p>
            </div>

            {/* Nome do Sistema */}
            <div>
              <Label htmlFor="systemName" className="text-zinc-300">Nome do Sistema</Label>
              <Input
                id="systemName"
                value={formData.systemName}
                onChange={(e) => handleInputChange("systemName", e.target.value)}
                className="mt-1 bg-zinc-800/50 border-zinc-600 text-white"
                placeholder="Ex: NEXUS"
              />
            </div>

            {/* Subtítulo */}
            <div>
              <Label htmlFor="systemSubtitle" className="text-zinc-300">Subtítulo/Descrição</Label>
              <Input
                id="systemSubtitle"
                value={formData.systemSubtitle}
                onChange={(e) => handleInputChange("systemSubtitle", e.target.value)}
                className="mt-1 bg-zinc-800/50 border-zinc-600 text-white"
                placeholder="Ex: WhatsApp Manager"
              />
            </div>
          </CardContent>
        </Card>

        {/* Cores e Tema */}
        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Palette className="w-5 h-5 text-emerald-400" />
              Cores e Tema
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Customize as cores principais do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Preview das Cores */}
            <div className="p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/30">
              <p className="text-zinc-300 text-sm mb-3">Preview das Cores:</p>
              <div className="flex gap-3">
                <div className="text-center">
                  <div
                    className="w-12 h-12 rounded-lg shadow-md border border-zinc-600"
                    style={{ backgroundColor: formData.primaryColor }}
                  ></div>
                  <p className="text-xs text-zinc-400 mt-1">Primária</p>
                </div>
                <div className="text-center">
                  <div
                    className="w-12 h-12 rounded-lg shadow-md border border-zinc-600"
                    style={{ backgroundColor: formData.secondaryColor }}
                  ></div>
                  <p className="text-xs text-zinc-400 mt-1">Secundária</p>
                </div>
              </div>
            </div>

            {/* Cor Primária */}
            <div>
              <Label htmlFor="primaryColor" className="text-zinc-300">Cor Primária</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="primaryColor"
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => handleInputChange("primaryColor", e.target.value)}
                  className="w-16 h-10 p-1 bg-zinc-800/50 border-zinc-600 rounded-lg cursor-pointer"
                />
                <Input
                  value={formData.primaryColor}
                  onChange={(e) => handleInputChange("primaryColor", e.target.value)}
                  className="flex-1 bg-zinc-800/50 border-zinc-600 text-white"
                  placeholder="#10b981"
                />
              </div>
            </div>

            {/* Cor Secundária */}
            <div>
              <Label htmlFor="secondaryColor" className="text-zinc-300">Cor Secundária</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) => handleInputChange("secondaryColor", e.target.value)}
                  className="w-16 h-10 p-1 bg-zinc-800/50 border-zinc-600 rounded-lg cursor-pointer"
                />
                <Input
                  value={formData.secondaryColor}
                  onChange={(e) => handleInputChange("secondaryColor", e.target.value)}
                  className="flex-1 bg-zinc-800/50 border-zinc-600 text-white"
                  placeholder="#06b6d4"
                />
              </div>
            </div>

            {/* Favicon */}
            <div>
              <Label htmlFor="favicon" className="text-zinc-300">URL do Favicon (opcional)</Label>
              <Input
                id="favicon"
                value={formData.favicon}
                onChange={(e) => handleInputChange("favicon", e.target.value)}
                className="mt-1 bg-zinc-800/50 border-zinc-600 text-white"
                placeholder="https://exemplo.com/favicon.ico"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informações sobre Aplicação */}
      <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-400" />
            Configuração Global - Aplicada para Todos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-zinc-800/30 rounded-lg border border-zinc-700/30">
              <h4 className="font-medium text-white mb-2">🌐 Global</h4>
              <p className="text-zinc-400">Uma única configuração aplicada para todos os usuários do sistema</p>
            </div>
            <div className="p-3 bg-zinc-800/30 rounded-lg border border-zinc-700/30">
              <h4 className="font-medium text-white mb-2">🎨 Visual</h4>
              <p className="text-zinc-400">Logo, cores e identidade visual aplicados instantaneamente</p>
            </div>
            <div className="p-3 bg-zinc-800/30 rounded-lg border border-zinc-700/30">
              <h4 className="font-medium text-white mb-2">💾 Persistente</h4>
              <p className="text-zinc-400">Configurações salvas no banco de dados permanentemente</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}