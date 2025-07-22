import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export type Instance = {
  id: string;
  name: string;
  status: string;
};

// Hook para listar instâncias
export function useInstances() {
  return useQuery<Instance[]>({
    queryKey: ["instances"],
    queryFn: async () => {
      const { data } = await api.get<Instance[]>("/instances");
      return data;
    },
  });
}

// Hook para criar uma nova instância
export function useCreateInstance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string }) => {
      const { data } = await api.post<Instance>("/instances", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instances"] });
    },
  });
}
