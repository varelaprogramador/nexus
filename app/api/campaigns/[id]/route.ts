import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: {
    id: string;
  };
}

// GET - Buscar campanha específica
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const campaign = await prisma.campaign.findFirst({
      where: {
        id: params.id,
        userId
      },
      include: {
        logs: {
          orderBy: { createdAt: "desc" },
          take: 100 // Últimos 100 logs
        }
      }
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campanha não encontrada" }, { status: 404 });
    }

    return NextResponse.json({ 
      campaign: {
        ...campaign,
        status: campaign.status.toLowerCase().replace('_', '-')
      }
    });
  } catch (error) {
    console.error("Erro ao buscar campanha:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// PUT - Atualizar campanha
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, instance, scheduledAt, messageBlocks, contacts } = body;

    // Verificar se a campanha existe e pertence ao usuário
    const existingCampaign = await prisma.campaign.findFirst({
      where: {
        id: params.id,
        userId
      }
    });

    if (!existingCampaign) {
      return NextResponse.json({ error: "Campanha não encontrada" }, { status: 404 });
    }

    // Não permitir edição de campanhas em execução
    if (existingCampaign.status === "RUNNING") {
      return NextResponse.json({ error: "Não é possível editar campanha em execução" }, { status: 400 });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (instance) updateData.instance = instance;
    if (scheduledAt !== undefined) {
      updateData.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
      updateData.status = scheduledAt ? "SCHEDULED" : "DRAFT";
    }
    if (messageBlocks) updateData.messageBlocks = messageBlocks;
    if (contacts) {
      updateData.contacts = contacts;
      updateData.totalContacts = contacts.length;
    }

    const campaign = await prisma.campaign.update({
      where: { id: params.id },
      data: updateData
    });

    return NextResponse.json({ 
      campaign: {
        ...campaign,
        status: campaign.status.toLowerCase().replace('_', '-')
      }
    });
  } catch (error) {
    console.error("Erro ao atualizar campanha:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// DELETE - Excluir campanha
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se a campanha existe e pertence ao usuário
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: params.id,
        userId
      }
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campanha não encontrada" }, { status: 404 });
    }

    // Não permitir exclusão de campanhas em execução
    if (campaign.status === "RUNNING") {
      return NextResponse.json({ error: "Não é possível excluir campanha em execução" }, { status: 400 });
    }

    await prisma.campaign.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: "Campanha excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir campanha:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}