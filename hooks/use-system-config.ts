import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import React from "react";

interface SystemConfig {
  id: string;
  logoUrl?: string;
  logoBase64?: string;
  systemName: string;
  systemSubtitle: string;
  primaryColor: string;
  secondaryColor: string;
  favicon?: string;
  createdAt: string;
  updatedAt: string;
}

interface ConfigUpdate {
  logoUrl?: string;
  logoBase64?: string;
  systemName?: string;
  systemSubtitle?: string;
  primaryColor?: string;
  secondaryColor?: string;
  favicon?: string;
}

// Hook para buscar configuração global
export function useSystemConfig() {
  return useQuery({
    queryKey: ["systemConfig"],
    queryFn: async (): Promise<SystemConfig> => {
      const response = await fetch("/api/config");
      if (!response.ok) {
        throw new Error("Erro ao buscar configurações");
      }
      const data = await response.json();
      return data.config;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
  });
}

// Hook para atualizar configurações
export function useUpdateSystemConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: ConfigUpdate) => {
      const response = await fetch("/api/config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao atualizar configurações");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["systemConfig"] });
      toast.success(data.message || "Configurações atualizadas com sucesso");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Hook para resetar configurações
export function useResetSystemConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/config", {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao resetar configurações");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["systemConfig"] });
      toast.success(data.message || "Configurações resetadas com sucesso");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Hook para upload de logo
export function useUploadLogo() {
  const updateConfig = useUpdateSystemConfig();

  const uploadAsBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
      reader.readAsDataURL(file);
    });
  };

  const uploadLogo = async (file: File) => {
    try {
      // Validações
      if (!file.type.startsWith("image/")) {
        throw new Error("Arquivo deve ser uma imagem");
      }

      if (file.size > 2 * 1024 * 1024) {
        // 2MB
        throw new Error("Arquivo deve ter menos de 2MB");
      }

      // Converter para base64
      const base64 = await uploadAsBase64(file);

      // Atualizar configuração
      await updateConfig.mutateAsync({
        logoBase64: base64,
        logoUrl: undefined, // Limpar URL se usando base64
      });

      return base64;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao fazer upload"
      );
      throw error;
    }
  };

  return {
    uploadLogo,
    isUploading: updateConfig.isPending,
  };
}

// Hook para aplicar configurações no CSS
export function useApplySystemConfig() {
  const { data: config } = useSystemConfig();

  React.useEffect(() => {
    if (config) {
      const root = document.documentElement;

      // Converter cores hex para HSL para compatibilidade com shadcn/ui
      const hexToHsl = (hex: string) => {
        // Remove o # se presente
        const cleanHex = hex.replace('#', '');
        
        // Converte hex para RGB
        const r = parseInt(cleanHex.substr(0, 2), 16) / 255;
        const g = parseInt(cleanHex.substr(2, 2), 16) / 255;
        const b = parseInt(cleanHex.substr(4, 2), 16) / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0, s = 0, l = (max + min) / 2;

        if (max !== min) {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          
          switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
          }
          h /= 6;
        }

        return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
      };

      // Converter cores hex para RGB para uso em rgba()
      const hexToRgb = (hex: string) => {
        const cleanHex = hex.replace('#', '');
        const r = parseInt(cleanHex.substr(0, 2), 16);
        const g = parseInt(cleanHex.substr(2, 2), 16);
        const b = parseInt(cleanHex.substr(4, 2), 16);
        return `${r}, ${g}, ${b}`;
      };

      // Aplicar cores CSS customizadas usando as variáveis do shadcn/ui
      const primaryHsl = hexToHsl(config.primaryColor);
      const secondaryHsl = hexToHsl(config.secondaryColor);
      const primaryRgb = hexToRgb(config.primaryColor);
      const secondaryRgb = hexToRgb(config.secondaryColor);
      
      // Aplicar nas variáveis do shadcn/ui
      root.style.setProperty("--primary", primaryHsl);
      root.style.setProperty("--accent", primaryHsl);
      root.style.setProperty("--ring", primaryHsl);
      
      // Aplicar nas variáveis customizadas para override das cores hardcoded
      root.style.setProperty("--custom-primary", config.primaryColor);
      root.style.setProperty("--custom-secondary", config.secondaryColor);
      root.style.setProperty("--custom-primary-rgb", primaryRgb);
      root.style.setProperty("--custom-secondary-rgb", secondaryRgb);
      
      // Manter cores customizadas também para uso direto
      root.style.setProperty("--primary-color", config.primaryColor);
      root.style.setProperty("--secondary-color", config.secondaryColor);

      // Atualizar título da página
      document.title = `${config.systemName} - ${config.systemSubtitle}`;

      // Atualizar favicon se existir
      if (config.favicon) {
        let favicon = document.querySelector(
          'link[rel="icon"]'
        ) as HTMLLinkElement;
        if (!favicon) {
          favicon = document.createElement("link");
          favicon.rel = "icon";
          document.head.appendChild(favicon);
        }
        favicon.href = config.favicon;
      }
    }
  }, [config]);

  return config;
}

export type { SystemConfig, ConfigUpdate };
