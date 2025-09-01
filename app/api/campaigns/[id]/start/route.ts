import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import api from "@/lib/api";

interface RouteParams {
  params: {
    id: string;
  };
}

// POST - Iniciar campanha
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const resolvedParams = await params;

    // Buscar campanha
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: resolvedParams.id,
        userId
      }
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campanha não encontrada" }, { status: 404 });
    }

    // Verificar se pode iniciar
    if (campaign.status !== "DRAFT" && campaign.status !== "SCHEDULED" && campaign.status !== "PAUSED") {
      return NextResponse.json({ 
        error: "Campanha não pode ser iniciada no status atual" 
      }, { status: 400 });
    }

    // Verificar se tem contatos e mensagens
    const contacts = campaign.contacts as any[];
    let messageBlocks = campaign.messageBlocks as any[];

    if (!contacts || contacts.length === 0) {
      return NextResponse.json({ error: "Campanha não tem contatos" }, { status: 400 });
    }

    // Se não há messageBlocks, criar uma mensagem padrão
    if (!messageBlocks || messageBlocks.length === 0) {
      messageBlocks = [{
        type: 'text',
        text: 'Olá! Esta é uma mensagem da campanha.',
        delay: 5
      }];
    }

    // Atualizar status para execução
    const updatedCampaign = await prisma.campaign.update({
      where: { id: resolvedParams.id },
      data: {
        status: "RUNNING",
        startedAt: new Date(),
        // Reset contadores se estiver reiniciando
        ...(campaign.status === "DRAFT" && {
          sentCount: 0,
          deliveredCount: 0,
          failedCount: 0
        })
      }
    });

    // Criar registros de execução para rastreamento
    const executionRecords = [];
    
    for (let blockIndex = 0; blockIndex < messageBlocks.length; blockIndex++) {
      for (const contact of contacts) {
        executionRecords.push({
          campaignId: campaign.id,
          blockIndex,
          contact: typeof contact === 'string' ? contact : (contact.phone || contact.id || contact.remoteJid || contact.number),
          status: 'pending'
        });
      }
    }

    // Inserir registros em lotes para performance
    await prisma.campaignExecution.createMany({
      data: executionRecords,
      skipDuplicates: true
    });

    // Aqui você pode integrar com um sistema de queue/worker
    // Por enquanto, vamos simular o início do processamento
    processCampaign(campaign.id).catch(console.error);

    return NextResponse.json({ 
      campaign: {
        ...updatedCampaign,
        status: updatedCampaign.status.toLowerCase().replace('_', '-')
      },
      message: "Campanha iniciada com sucesso"
    });

  } catch (error) {
    console.error("Erro ao iniciar campanha:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// Função para processar campanha em background
async function processCampaign(campaignId: string) {
  try {
    console.log(`🚀 Iniciando processamento da campanha ${campaignId}`);
    
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    });

    if (!campaign) {
      console.error(`❌ Campanha ${campaignId} não encontrada`);
      return;
    }

    let messageBlocks = campaign.messageBlocks as any[];
    const contacts = campaign.contacts as any[];
    
    // Se não há messageBlocks, usar mensagem padrão
    if (!messageBlocks || messageBlocks.length === 0) {
      messageBlocks = [{
        type: 'text',
        text: 'Olá! Esta é uma mensagem da campanha.',
        delay: 5
      }];
    }
    
    console.log(`📊 Campanha "${campaign.name}" - ${contacts.length} contatos, ${messageBlocks.length} blocos de mensagem`);
    
    let totalProcessed = 0;
    const totalMessages = contacts.length * messageBlocks.length;
    
    // Processar cada bloco de mensagem para cada contato
    for (let blockIndex = 0; blockIndex < messageBlocks.length; blockIndex++) {
      const block = messageBlocks[blockIndex];
      console.log(`📝 Processando bloco ${blockIndex + 1}/${messageBlocks.length}: "${block.text?.substring(0, 50) || 'Mídia'}..."`);
      
      for (let contactIndex = 0; contactIndex < contacts.length; contactIndex++) {
        const contact = contacts[contactIndex];
        totalProcessed++;
        
        console.log(`📱 Enviando para contato ${contactIndex + 1}/${contacts.length} (${Math.round((totalProcessed/totalMessages)*100)}% concluído)`);
        // Verificar se deve parar (campanha pausada/cancelada)
        const currentCampaign = await prisma.campaign.findUnique({
          where: { id: campaignId }
        });
        
        if (!currentCampaign || currentCampaign.status !== "RUNNING") {
          console.log(`Campanha ${campaignId} não está mais em execução`);
          return;
        }

        try {
          // Atualizar status para enviando
          await prisma.campaignExecution.updateMany({
            where: {
              campaignId,
              blockIndex,
              contact: typeof contact === 'string' ? contact : (contact.phone || contact.id || contact.remoteJid || contact.number),
              status: 'pending'
            },
            data: {
              status: 'sending',
              attemptedAt: new Date()
            }
          });

          // Fazer disparo real através da API Evolution
          const result = await sendMessage(campaign.instance, contact, block);
          const success = result.success;

          if (success) {
            await prisma.campaignExecution.updateMany({
              where: {
                campaignId,
                blockIndex,
                contact: typeof contact === 'string' ? contact : (contact.phone || contact.id || contact.remoteJid || contact.number),
                status: 'sending'
              },
              data: {
                status: 'sent',
                sentAt: new Date()
              }
            });

            // Atualizar contador de enviados
            await prisma.campaign.update({
              where: { id: campaignId },
              data: {
                sentCount: {
                  increment: 1
                }
              }
            });

          } else {
            await prisma.campaignExecution.updateMany({
              where: {
                campaignId,
                blockIndex,
                contact: typeof contact === 'string' ? contact : (contact.phone || contact.id || contact.remoteJid || contact.number),
                status: 'sending'
              },
              data: {
                status: 'failed',
                error: result.error || 'Falha no envio'
              }
            });

            // Atualizar contador de falhas
            await prisma.campaign.update({
              where: { id: campaignId },
              data: {
                failedCount: {
                  increment: 1
                }
              }
            });
          }

          // Delay entre envios
          const delay = block.delay || (campaign.settings as any)?.defaultDelay || 5;
          console.log(`⏳ Aguardando ${delay}s antes do próximo envio...`);
          await new Promise(resolve => setTimeout(resolve, delay * 1000));

        } catch (error) {
          console.error(`Erro ao processar envio:`, error);
          
          await prisma.campaignExecution.updateMany({
            where: {
              campaignId,
              blockIndex,
              contact: typeof contact === 'string' ? contact : (contact.phone || contact.id || contact.remoteJid || contact.number),
              status: 'sending'
            },
            data: {
              status: 'failed',
              error: error instanceof Error ? error.message : 'Erro desconhecido'
            }
          });

          await prisma.campaign.update({
            where: { id: campaignId },
            data: {
              failedCount: {
                increment: 1
              }
            }
          });
        }
      }
    }

    // Buscar estatísticas finais
    const finalStats = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { sentCount: true, failedCount: true, totalContacts: true }
    });

    // Marcar campanha como concluída
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: "COMPLETED",
        completedAt: new Date()
      }
    });

    console.log(`🎉 Campanha ${campaignId} concluída com sucesso!`);
    console.log(`📈 Resumo: ${finalStats?.sentCount || 0} enviadas, ${finalStats?.failedCount || 0} falhas, de ${finalStats?.totalContacts || 0} total`);

  } catch (error) {
    console.error(`Erro no processamento da campanha ${campaignId}:`, error);
    
    // Marcar como falha
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: "CANCELLED"
      }
    });
  }
}

// Função para enviar mensagem através da API Evolution
async function sendMessage(instanceName: string, contact: any, messageBlock: any) {
  try {
    const apikey = process.env.EVOLUTION_API_KEY || process.env.NEXT_PUBLIC_EVOLUTION_API_KEY;
    
    if (!apikey) {
      console.error('API Key não configurada');
      return { success: false, error: 'API Key não configurada' };
    }

    // Extrair informações do contato
    let phone: string = '';
    
    if (typeof contact === 'string') {
      phone = contact;
    } else if (contact && typeof contact === 'object') {
      phone = contact.phone || contact.id || contact.remoteJid || contact.number || '';
    }
    
    if (!phone) {
      console.error('Número de telefone não encontrado no contato:', contact);
      return { success: false, error: 'Número de telefone não encontrado' };
    }

    // Limpar o número removendo caracteres especiais, mantendo apenas dígitos
    const cleanPhone = phone.replace(/[^\d]/g, '');
    
    if (!cleanPhone) {
      console.error('Número de telefone inválido após limpeza:', phone);
      return { success: false, error: 'Número de telefone inválido' };
    }

    // Preparar payload baseado no tipo de mensagem
    let payload: any = {
      number: cleanPhone,
    };

    // Verificar tipo de mensagem no messageBlock
    if (messageBlock.type === 'text' || !messageBlock.type) {
      payload.text = messageBlock.text || messageBlock.content || '';
    } else if (messageBlock.type === 'media') {
      payload.mediaMessage = {
        mediatype: messageBlock.mediatype || 'image',
        media: messageBlock.media || messageBlock.url,
        caption: messageBlock.caption || messageBlock.text || ''
      };
    }

    console.log(`Enviando mensagem para ${cleanPhone} na instância ${instanceName}:`, JSON.stringify(payload));

    // Fazer a chamada para a API Evolution
    const response = await api.post(`/message/sendText/${instanceName}`, payload, {
      headers: {
        'apikey': apikey,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 segundos timeout
    });

    if (response.data && (response.data.key || response.data.message)) {
      console.log(`✅ Mensagem enviada com sucesso para ${cleanPhone}:`, response.data.key?.id || 'ID não disponível');
      return { 
        success: true, 
        data: response.data,
        messageId: response.data.key?.id || null
      };
    } else {
      console.error('❌ Resposta inesperada da API:', response.data);
      return { success: false, error: 'Resposta inesperada da API' };
    }

  } catch (error: any) {
    console.error('Erro ao enviar mensagem:', error.response?.data || error.message);
    
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Erro desconhecido no envio';

    return { 
      success: false, 
      error: errorMessage,
      statusCode: error.response?.status
    };
  }
}

