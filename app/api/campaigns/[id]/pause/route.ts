import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: {
    id: string;
  };
}

// POST - Pausar campanha
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

    // Verificar se pode pausar
    if (campaign.status !== "RUNNING") {
      return NextResponse.json({ 
        error: "Apenas campanhas em execução podem ser pausadas" 
      }, { status: 400 });
    }

    // Atualizar status para pausada
    const updatedCampaign = await prisma.campaign.update({
      where: { id: params.id },
      data: {
        status: "PAUSED"
      }
    });

    return NextResponse.json({ 
      campaign: {
        ...updatedCampaign,
        status: updatedCampaign.status.toLowerCase().replace('_', '-')
      },
      message: "Campanha pausada com sucesso"
    });

  } catch (error) {
    console.error("Erro ao pausar campanha:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}