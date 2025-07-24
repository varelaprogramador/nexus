import { useState } from "react";
import api from "@/lib/api";
import prisma from "@/lib/prisma";
import { useUser } from "@clerk/nextjs";
import os from "os";

interface DisparoResult {
  numero: string;
  status: "sucesso" | "erro";
  mensagem?: string;
}

interface ButtonOption {
  title: string;
  displayText: string;
  id: string;
}

interface QuotedOption {
  key: { id: string };
  message: { conversation: string };
}

interface UseDisparo {
  dispararMensagem: (params: {
    instance: string;
    numeros: string[];
    mensagem: string;
    delay?: number;
    linkPreview?: boolean;
    mentionsEveryOne?: boolean;
    apikey?: string;
  }) => Promise<DisparoResult[]>;
  dispararImagem: (params: {
    instance: string;
    numeros: string[];
    base64: string;
    mimetype: string;
    caption?: string;
    fileName?: string;
    delay?: number;
    apikey?: string;
  }) => Promise<DisparoResult[]>;
  dispararArquivo: (params: {
    instance: string;
    numeros: string[];
    base64: string;
    mimetype: string;
    caption?: string;
    fileName?: string;
    delay?: number;
    apikey?: string;
  }) => Promise<DisparoResult[]>;
  dispararAudio: (params: {
    instance: string;
    numeros: string[];
    base64: string;
    delay?: number;
    apikey?: string;
  }) => Promise<DisparoResult[]>;
  dispararEnquete: (params: {
    instance: string;
    numeros: string[];
    name: string;
    values: string[];
    selectableCount?: number;
    delay?: number;
    apikey?: string;
  }) => Promise<DisparoResult[]>;
  dispararBotao: (params: {
    instance: string;
    numeros: string[];
    title: string;
    description: string;
    footer: string;
    buttons: ButtonOption[];
    delay?: number;
    linkPreview?: boolean;
    mentionsEveryOne?: boolean;
    mentioned?: string[];
    quoted?: QuotedOption;
    apikey?: string;
  }) => Promise<DisparoResult[]>;
  loading: boolean;
  error: string | null;
}

// Função utilitária para registrar log de disparo
const registrarLogDisparo = async (logData: any) => {
  try {
    const res = await fetch("/api/log-disparo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(logData),
    });
    if (!res.ok) {
      const err = await res.json();
      console.error("[LOG DISPARO][ERRO API]", logData, err);
    }
  } catch (e) {
    console.error("[LOG DISPARO][ERRO FETCH]", logData, e);
  }
};

// Função para obter o IP local (server-side)
const getLocalIp = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "";
};

const useDisparo = (): UseDisparo => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const userId = user?.id || undefined;
  const userName =
    user?.fullName ||
    user?.username ||
    user?.emailAddresses?.[0]?.emailAddress ||
    undefined;
  const userEmail = user?.emailAddresses?.[0]?.emailAddress || undefined;
  const userIp = getLocalIp();

  const dispararMensagem = async ({
    instance,
    numeros,
    mensagem,
    delay = 5,
    linkPreview = true,
    mentionsEveryOne = false,
    apikey = "",
  }: {
    instance: string;
    numeros: string[];
    mensagem: string;
    delay?: number;
    linkPreview?: boolean;
    mentionsEveryOne?: boolean;
    apikey?: string;
  }): Promise<DisparoResult[]> => {
    setLoading(true);
    setError(null);
    const results: DisparoResult[] = [];
    try {
      for (const numero of numeros) {
        try {
          const { data } = await api.post(
            `/message/sendText/${instance}`,
            {
              number: numero,
              text: mensagem,
              delay,
              linkPreview,
              mentionsEveryOne,
            },
            {
              headers: {
                apikey,
                "Content-Type": "application/json",
              },
            }
          );
          results.push({
            numero,
            status: "sucesso",
            mensagem: data?.message || "Enviado",
          });
          await registrarLogDisparo({
            type: "text",
            status: "sucesso",
            instance,
            numero,
            mensagem: mensagem, // ou outra mensagem principal
            payload: { mensagem, delay, linkPreview, mentionsEveryOne },
            response: data,
            error: undefined,
            userId,
            userName,
            userIp,
            extra: { userEmail },
          });
        } catch (err: any) {
          results.push({
            numero,
            status: "erro",
            mensagem: err?.response?.data?.message || err?.message || "Erro",
          });
          await registrarLogDisparo({
            type: "text",
            status: "erro",
            instance,
            numero,
            mensagem: mensagem, // ou outra mensagem principal
            payload: { mensagem, delay, linkPreview, mentionsEveryOne },
            response: err?.response?.data,
            error: err?.response?.data?.message || err?.message,
            userId,
            userName,
            userIp,
            extra: { userEmail },
          });
        }
      }
      return results;
    } catch (err: any) {
      setError(err?.message || "Erro ao disparar mensagens");
      return numeros.map((numero) => ({
        numero,
        status: "erro",
        mensagem: err?.message || "Erro",
      }));
    } finally {
      setLoading(false);
    }
  };

  const dispararImagem = async ({
    instance,
    numeros,
    base64,
    mimetype,
    caption = "",
    fileName = "imagem.png",
    delay = 5,
    apikey = "",
  }: {
    instance: string;
    numeros: string[];
    base64: string;
    mimetype: string;
    caption?: string;
    fileName?: string;
    delay?: number;
    apikey?: string;
  }): Promise<DisparoResult[]> => {
    setLoading(true);
    setError(null);
    const results: DisparoResult[] = [];
    try {
      for (const numero of numeros) {
        try {
          const { data } = await api.post(
            `/message/sendMedia/${instance}`,
            {
              number: numero,
              mediatype: "image",
              mimetype,
              caption,
              media: base64,
              fileName,
              delay,
            },
            {
              headers: {
                apikey,
                "Content-Type": "application/json",
              },
            }
          );
          results.push({
            numero,
            status: "sucesso",
            mensagem: data?.message || "Enviado",
          });
          await registrarLogDisparo({
            type: "image",
            status: "sucesso",
            instance,
            numero,
            mensagem: data?.message || "Enviado", // ou outra mensagem principal
            payload: { base64, mimetype, caption, fileName, delay },
            response: data,
            error: undefined,
            userId,
            userName,
            userIp,
            extra: { userEmail },
          });
        } catch (err: any) {
          results.push({
            numero,
            status: "erro",
            mensagem: err?.response?.data?.message || err?.message || "Erro",
          });
          await registrarLogDisparo({
            type: "image",
            status: "erro",
            instance,
            numero,
            mensagem: err?.response?.data?.message || err?.message || "Erro", // ou outra mensagem principal
            payload: { base64, mimetype, caption, fileName, delay },
            response: err?.response?.data,
            error: err?.response?.data?.message || err?.message,
            userId,
            userName,
            userIp,
            extra: { userEmail },
          });
        }
      }
      return results;
    } catch (err: any) {
      setError(err?.message || "Erro ao disparar imagens");
      return numeros.map((numero) => ({
        numero,
        status: "erro",
        mensagem: err?.message || "Erro",
      }));
    } finally {
      setLoading(false);
    }
  };

  const dispararArquivo = async ({
    instance,
    numeros,
    base64,
    mimetype,
    caption = "",
    fileName = "arquivo.pdf",
    delay = 5,
    apikey = "",
  }: {
    instance: string;
    numeros: string[];
    base64: string;
    mimetype: string;
    caption?: string;
    fileName?: string;
    delay?: number;
    apikey?: string;
  }): Promise<DisparoResult[]> => {
    setLoading(true);
    setError(null);
    const results: DisparoResult[] = [];
    try {
      for (const numero of numeros) {
        try {
          const { data } = await api.post(
            `/message/sendMedia/${instance}`,
            {
              number: numero,
              mediatype: "document",
              mimetype,
              caption,
              media: base64,
              fileName,
              delay,
            },
            {
              headers: {
                apikey,
                "Content-Type": "application/json",
              },
            }
          );
          results.push({
            numero,
            status: "sucesso",
            mensagem: data?.message || "Enviado",
          });
          await registrarLogDisparo({
            type: "document",
            status: "sucesso",
            instance,
            numero,
            mensagem: data?.message || "Enviado", // ou outra mensagem principal
            payload: { base64, mimetype, caption, fileName, delay },
            response: data,
            error: undefined,
            userId,
            userName,
            userIp,
            extra: { userEmail },
          });
        } catch (err: any) {
          results.push({
            numero,
            status: "erro",
            mensagem: err?.response?.data?.message || err?.message || "Erro",
          });
          await registrarLogDisparo({
            type: "document",
            status: "erro",
            instance,
            numero,
            mensagem: err?.response?.data?.message || err?.message || "Erro", // ou outra mensagem principal
            payload: { base64, mimetype, caption, fileName, delay },
            response: err?.response?.data,
            error: err?.response?.data?.message || err?.message,
            userId,
            userName,
            userIp,
            extra: { userEmail },
          });
        }
      }
      return results;
    } catch (err: any) {
      setError(err?.message || "Erro ao disparar arquivos");
      return numeros.map((numero) => ({
        numero,
        status: "erro",
        mensagem: err?.message || "Erro",
      }));
    } finally {
      setLoading(false);
    }
  };

  const dispararAudio = async ({
    instance,
    numeros,
    base64,
    delay = 5,
    apikey = "",
  }: {
    instance: string;
    numeros: string[];
    base64: string;
    delay?: number;
    apikey?: string;
  }): Promise<DisparoResult[]> => {
    setLoading(true);
    setError(null);
    const results: DisparoResult[] = [];
    try {
      for (const numero of numeros) {
        try {
          const { data } = await api.post(
            `/message/sendWhatsAppAudio/${instance}`,
            {
              audio: base64,
              number: numero,
              delay,
            },
            {
              headers: {
                apikey,
                "Content-Type": "application/json",
              },
            }
          );
          results.push({
            numero,
            status: "sucesso",
            mensagem: data?.message || "Enviado",
          });
          await registrarLogDisparo({
            type: "audio",
            status: "sucesso",
            instance,
            numero,
            mensagem: data?.message || "Enviado", // ou outra mensagem principal
            payload: { base64, delay },
            response: data,
            error: undefined,
            userId,
            userName,
            userIp,
            extra: { userEmail },
          });
        } catch (err: any) {
          results.push({
            numero,
            status: "erro",
            mensagem: err?.response?.data?.message || err?.message || "Erro",
          });
          await registrarLogDisparo({
            type: "audio",
            status: "erro",
            instance,
            numero,
            mensagem: err?.response?.data?.message || err?.message || "Erro", // ou outra mensagem principal
            payload: { base64, delay },
            response: err?.response?.data,
            error: err?.response?.data?.message || err?.message,
            userId,
            userName,
            userIp,
            extra: { userEmail },
          });
        }
      }
      return results;
    } catch (err: any) {
      setError(err?.message || "Erro ao disparar áudios");
      return numeros.map((numero) => ({
        numero,
        status: "erro",
        mensagem: err?.message || "Erro",
      }));
    } finally {
      setLoading(false);
    }
  };

  const dispararEnquete = async ({
    instance,
    numeros,
    name,
    values,
    selectableCount = 1,
    delay = 5,
    apikey = "",
  }: {
    instance: string;
    numeros: string[];
    name: string;
    values: string[];
    selectableCount?: number;
    delay?: number;
    apikey?: string;
  }): Promise<DisparoResult[]> => {
    setLoading(true);
    setError(null);
    const results: DisparoResult[] = [];
    try {
      for (const numero of numeros) {
        try {
          const { data } = await api.post(
            `/message/sendPoll/${instance}`,
            {
              number: numero,
              name,
              values,
              selectableCount,
              delay,
            },
            {
              headers: {
                apikey,
                "Content-Type": "application/json",
              },
            }
          );
          results.push({
            numero,
            status: "sucesso",
            mensagem: data?.message || "Enviado",
          });
          await registrarLogDisparo({
            type: "poll",
            status: "sucesso",
            instance,
            numero,
            mensagem: data?.message || "Enviado", // ou outra mensagem principal
            payload: { name, values, selectableCount, delay },
            response: data,
            error: undefined,
            userId,
            userName,
            userIp,
            extra: { userEmail },
          });
        } catch (err: any) {
          results.push({
            numero,
            status: "erro",
            mensagem: err?.response?.data?.message || err?.message || "Erro",
          });
          await registrarLogDisparo({
            type: "poll",
            status: "erro",
            instance,
            numero,
            mensagem: err?.response?.data?.message || err?.message || "Erro", // ou outra mensagem principal
            payload: { name, values, selectableCount, delay },
            response: err?.response?.data,
            error: err?.response?.data?.message || err?.message,
            userId,
            userName,
            userIp,
            extra: { userEmail },
          });
        }
      }
      return results;
    } catch (err: any) {
      setError(err?.message || "Erro ao disparar enquetes");
      return numeros.map((numero) => ({
        numero,
        status: "erro",
        mensagem: err?.message || "Erro",
      }));
    } finally {
      setLoading(false);
    }
  };

  const dispararBotao = async ({
    instance,
    numeros,
    title,
    description,
    footer,
    buttons,
    delay = 5,
    apikey = "",
  }: {
    instance: string;
    numeros: string[];
    title: string;
    description: string;
    footer: string;
    buttons: ButtonOption[];
    delay?: number;
    apikey?: string;
  }): Promise<DisparoResult[]> => {
    setLoading(true);
    setError(null);
    const results: DisparoResult[] = [];
    try {
      for (const numero of numeros) {
        try {
          const { data } = await api.post(
            `/message/sendButtons/${instance}`,
            {
              number: numero,
              title,
              description,
              footer,
              buttons,
              delay,
            },
            {
              headers: {
                apikey,
                "Content-Type": "application/json",
              },
            }
          );
          results.push({
            numero,
            status: "sucesso",
            mensagem: data?.message || "Enviado",
          });
          await registrarLogDisparo({
            type: "buttons",
            status: "sucesso",
            instance,
            numero,
            mensagem: data?.message || "Enviado", // ou outra mensagem principal
            payload: { title, description, footer, buttons, delay },
            response: data,
            error: undefined,
            userId,
            userName,
            userIp,
            extra: { userEmail },
          });
        } catch (err: any) {
          results.push({
            numero,
            status: "erro",
            mensagem: err?.response?.data?.message || err?.message || "Erro",
          });
          await registrarLogDisparo({
            type: "buttons",
            status: "erro",
            instance,
            numero,
            mensagem: err?.response?.data?.message || err?.message || "Erro", // ou outra mensagem principal
            payload: { title, description, footer, buttons, delay },
            response: err?.response?.data,
            error: err?.response?.data?.message || err?.message,
            userId,
            userName,
            userIp,
            extra: { userEmail },
          });
        }
      }
      return results;
    } catch (err: any) {
      setError(err?.message || "Erro ao disparar botões");
      return numeros.map((numero) => ({
        numero,
        status: "erro",
        mensagem: err?.message || "Erro",
      }));
    } finally {
      setLoading(false);
    }
  };

  return {
    dispararMensagem,
    dispararImagem,
    dispararArquivo,
    dispararAudio,
    dispararEnquete,
    dispararBotao,
    loading,
    error,
  };
};

export default useDisparo;
