import { useState } from "react";
import api from "@/lib/api";

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

const useDisparo = (): UseDisparo => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        } catch (err: any) {
          results.push({
            numero,
            status: "erro",
            mensagem: err?.response?.data?.message || err?.message || "Erro",
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
        } catch (err: any) {
          results.push({
            numero,
            status: "erro",
            mensagem: err?.response?.data?.message || err?.message || "Erro",
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
        } catch (err: any) {
          results.push({
            numero,
            status: "erro",
            mensagem: err?.response?.data?.message || err?.message || "Erro",
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
        } catch (err: any) {
          results.push({
            numero,
            status: "erro",
            mensagem: err?.response?.data?.message || err?.message || "Erro",
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
        } catch (err: any) {
          results.push({
            numero,
            status: "erro",
            mensagem: err?.response?.data?.message || err?.message || "Erro",
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
        } catch (err: any) {
          results.push({
            numero,
            status: "erro",
            mensagem: err?.response?.data?.message || err?.message || "Erro",
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
