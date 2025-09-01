import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// GET - Listar campanhas do usuário
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const requestedUserId = searchParams.get("userId");
    
    // Verificar se está tentando acessar campanhas de outro usuário
    if (requestedUserId && requestedUserId !== userId) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const campaigns = await prisma.campaign.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            logs: true
          }
        }
      }
    });

    // Mapear status do banco para interface
    const mappedCampaigns = campaigns.map(campaign => ({
      ...campaign,
      status: campaign.status.toLowerCase().replace('_', '-'),
    }));

    return NextResponse.json({ campaigns: mappedCampaigns });
  } catch (error) {
    console.error("Erro ao buscar campanhas:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// POST - Criar nova campanha
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, instance, scheduledAt, messageBlocks = [], contacts = [] } = body;

    if (!name || !instance) {
      return NextResponse.json({ error: "Nome e instância são obrigatórios" }, { status: 400 });
    }

    const campaign = await prisma.campaign.create({
      data: {
        name,
        description: description || null,
        instance,
        userId,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: scheduledAt ? "SCHEDULED" : "DRAFT",
        totalContacts: contacts.length,
        messageBlocks: messageBlocks,
        contacts: contacts,
        settings: {}
      }
    });

    return NextResponse.json({ 
      campaign: {
        ...campaign,
        status: campaign.status.toLowerCase().replace('_', '-')
      }
    });
  } catch (error) {
    console.error("Erro ao criar campanha:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}