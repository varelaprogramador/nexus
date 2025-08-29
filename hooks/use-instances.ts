import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import axios from "axios";

export type EvolutionInstance = {
  id: string;
  name: string;
  connectionStatus: string;
  profileName?: string | null;
  profilePicUrl?: string | null;
  number?: string | null;
  token?: string | null;
  disconnectionReason?: string | null;
  lastConnectionAt?: Date | null;
  lastDisconnectionAt?: Date | null;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    Message: number;
    Contact: number;
    Chat: number;
  };
  userId?: string;
  evolution?: {
    id: string;
    ownerJid: string;
    integration: string;
    businessId?: string | null;
    clientName: string;
    disconnectionReasonCode?: number | null;
    disconnectionObject?: any;
    disconnectionAt?: string | null;
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
    };
  };
};

export function useInstances() {
  return useQuery<EvolutionInstance[]>({
    queryKey: ["instances"],
    queryFn: async () => {
      const { data } = await axios.get("/api/instances");
      return Array.isArray(data.instances) ? data.instances : [];
    },
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });
}

// Criar instância
export function useCreateInstance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string }) => {
      const { data } = await axios.post("/api/instances", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instances"] });
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
    mutationFn: async (instanceIdentifier: string) => {
      // Se parece ser um UUID, usa como ID, senão usa como nome
      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          instanceIdentifier
        );

      const params = isUUID
        ? `id=${instanceIdentifier}`
        : `name=${instanceIdentifier}`;

      const { data } = await axios.delete(`/api/instances?${params}`, {
        headers: { apikey },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instances"] });
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
