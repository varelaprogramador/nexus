import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";

// GET - Buscar configuração global
export async function GET() {
  try {
    let config = await prisma.systemConfig.findUnique({
      where: { id: "global" },
    });

    // Se não existe configuração, criar uma com valores padrão
    if (!config) {
      config = await prisma.systemConfig.create({
        data: {
          id: "global",
          systemName: "NEXUS",
          systemSubtitle: "WhatsApp Manager",
          primaryColor: "#10b981",
          secondaryColor: "#06b6d4",
        },
      });
    }

    return NextResponse.json({ config });
  } catch (error) {
    console.error("Erro ao buscar configurações:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST - Atualizar configuração global (requer role admin)
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const {
      logoUrl,
      logoBase64,
      systemName,
      systemSubtitle,
      primaryColor,
      secondaryColor,
      favicon,
    } = body;

    // Verificar se já existe a configuração global
    const existingConfig = await prisma.systemConfig.findUnique({
      where: { id: "global" },
    });

    let config;
    if (existingConfig) {
      // Atualizar configuração existente
      config = await prisma.systemConfig.update({
        where: { id: "global" },
        data: {
          logoUrl: logoUrl !== undefined ? logoUrl : existingConfig.logoUrl,
          logoBase64:
            logoBase64 !== undefined ? logoBase64 : existingConfig.logoBase64,
          systemName: systemName || existingConfig.systemName,
          systemSubtitle: systemSubtitle || existingConfig.systemSubtitle,
          primaryColor: primaryColor || existingConfig.primaryColor,
          secondaryColor: secondaryColor || existingConfig.secondaryColor,
          favicon: favicon !== undefined ? favicon : existingConfig.favicon,
        },
      });
    } else {
      // Criar nova configuração global
      config = await prisma.systemConfig.create({
        data: {
          id: "global",
          logoUrl: logoUrl || null,
          logoBase64: logoBase64 || null,
          systemName: systemName || "NEXUS",
          systemSubtitle: systemSubtitle || "WhatsApp Manager",
          primaryColor: primaryColor || "#10b981",
          secondaryColor: secondaryColor || "#06b6d4",
          favicon: favicon || null,
        },
      });
    }

    return NextResponse.json({
      config,
      message: "Configurações salvas com sucesso",
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Acesso negado")) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 403 }
      );
    }
    console.error("Erro ao salvar configurações:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar configurações específicas da configuração global (requer role admin)
export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();

    // Atualizar apenas os campos fornecidos na configuração global
    const config = await prisma.systemConfig.upsert({
      where: { id: "global" },
      update: body,
      create: {
        id: "global",
        systemName: "NEXUS",
        systemSubtitle: "WhatsApp Manager",
        primaryColor: "#10b981",
        secondaryColor: "#06b6d4",
        ...body,
      },
    });

    return NextResponse.json({
      config,
      message: "Configurações atualizadas com sucesso",
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Acesso negado")) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 403 }
      );
    }
    console.error("Erro ao atualizar configurações:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Resetar configuração global para padrão (requer role admin)
export async function DELETE() {
  try {
    await requireAdmin();

    const config = await prisma.systemConfig.upsert({
      where: { id: "global" },
      update: {
        logoUrl: null,
        logoBase64: null,
        systemName: "NEXUS",
        systemSubtitle: "WhatsApp Manager",
        primaryColor: "#10b981",
        secondaryColor: "#06b6d4",
        favicon: null,
      },
      create: {
        id: "global",
        systemName: "NEXUS",
        systemSubtitle: "WhatsApp Manager",
        primaryColor: "#10b981",
        secondaryColor: "#06b6d4",
      },
    });

    return NextResponse.json({
      config,
      message: "Configurações resetadas para o padrão",
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Acesso negado")) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 403 }
      );
    }
    console.error("Erro ao resetar configurações:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
