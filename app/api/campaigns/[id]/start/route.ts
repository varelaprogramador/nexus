import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

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

    // Buscar campanha
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: params.id,
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
    const messageBlocks = campaign.messageBlocks as any[];

    if (!contacts || contacts.length === 0) {
      return NextResponse.json({ error: "Campanha não tem contatos" }, { status: 400 });
    }

    if (!messageBlocks || messageBlocks.length === 0) {
      return NextResponse.json({ error: "Campanha não tem mensagens configuradas" }, { status: 400 });
    }

    // Atualizar status para execução
    const updatedCampaign = await prisma.campaign.update({
      where: { id: params.id },
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
          contact: typeof contact === 'string' ? contact : contact.phone || contact.number,
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
    console.log(`Iniciando processamento da campanha ${campaignId}`);
    
    // Esta função seria executada em background
    // Você pode integrar com Redis Queue, Bull Queue, ou similar
    
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    });

    if (!campaign) return;

    const messageBlocks = campaign.messageBlocks as any[];
    const contacts = campaign.contacts as any[];
    
    // Processar cada bloco de mensagem para cada contato
    for (let blockIndex = 0; blockIndex < messageBlocks.length; blockIndex++) {
      const block = messageBlocks[blockIndex];
      
      for (const contact of contacts) {
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
              contact: typeof contact === 'string' ? contact : contact.phone || contact.number,
              status: 'pending'
            },
            data: {
              status: 'sending',
              attemptedAt: new Date()
            }
          });

          // Aqui você faria a chamada real para a API de disparo
          // const result = await sendMessage(campaign.instance, contact, block);
          
          // Simular envio (substituir pela lógica real)
          await new Promise(resolve => setTimeout(resolve, 1000));
          const success = Math.random() > 0.1; // 90% de sucesso

          if (success) {
            await prisma.campaignExecution.updateMany({
              where: {
                campaignId,
                blockIndex,
                contact: typeof contact === 'string' ? contact : contact.phone || contact.number,
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
                contact: typeof contact === 'string' ? contact : contact.phone || contact.number,
                status: 'sending'
              },
              data: {
                status: 'failed',
                error: 'Erro simulado'
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
          const delay = block.delay || campaign.settings?.defaultDelay || 5;
          await new Promise(resolve => setTimeout(resolve, delay * 1000));

        } catch (error) {
          console.error(`Erro ao processar envio:`, error);
          
          await prisma.campaignExecution.updateMany({
            where: {
              campaignId,
              blockIndex,
              contact: typeof contact === 'string' ? contact : contact.phone || contact.number,
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

    // Marcar campanha como concluída
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: "COMPLETED",
        completedAt: new Date()
      }
    });

    console.log(`Campanha ${campaignId} concluída`);

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

