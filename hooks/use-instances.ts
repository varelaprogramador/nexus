import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export type EvolutionInstance = {
  id: string;
  name: string;
  connectionStatus: string;
  ownerJid: string;
  profileName: string;
  profilePicUrl?: string | null;
  integration?: string;
  number?: string | null;
  businessId?: string | null;
  token?: string;
  clientName?: string;
  disconnectionReasonCode?: number;
  disconnectionObject?: string;
  disconnectionAt?: string;
  createdAt?: string;
  updatedAt?: string;
  Chatwoot?: any;
  Proxy?: any;
  Rabbitmq?: any;
  Nats?: any;
  Sqs?: any;
  Websocket?: any;
  Setting?: {
    id: string;
    rejectCall: boolean;
    msgCall: string;
    groupsIgnore: boolean;
    alwaysOnline: boolean;
    readMessages: boolean;
    readStatus: boolean;
    syncFullHistory: boolean;
    wavoipToken: string;
    createdAt: string;
    updatedAt: string;
    instanceId: string;
  };
  _count?: {
    Message: number;
    Contact: number;
    Chat: number;
  };
};

export function useInstances(apikey: string) {
  return useQuery<EvolutionInstance[]>({
    queryKey: ["instances", apikey],
    queryFn: async () => {
      const { data } = await api.get("/instance/fetchInstances", {
        headers: { apikey },
      });
      return Array.isArray(data)
        ? data.map((item: EvolutionInstance) => item)
        : [];
    },
  });
}

// Criar instância
export function useCreateInstance(apikey: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post("/instance/create", payload, {
        headers: { apikey, "Content-Type": "application/json" },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instances", apikey] });
    },
  });
}

// Logout de instância
export function useLogoutInstance(apikey: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (instanceId: string) => {
      const { data } = await api.delete(`/instance/logout/${instanceId}`, {
        headers: { apikey },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instances", apikey] });
    },
  });
}

// Deletar instância
export const useDeleteInstance = (apikey: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (instanceId: string) => {
      const response = await api.delete(`/instance/delete/${instanceId}`, {
        headers: { apikey },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instances", apikey] });
    },
  });
};

export function useQrCodeInstance(
  instanceName: string,
  apikey: string,
  enabled = true
) {
  return useQuery({
    queryKey: ["qr", instanceName, apikey],
    queryFn: async () => {
      const { data } = await api.get(`/instance/connect/${instanceName}`, {
        headers: { apikey },
      });
      return data;
    },
    enabled: enabled && !!instanceName,
  });
}
