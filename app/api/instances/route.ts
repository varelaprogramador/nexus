"use server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const EVOLUTION_API_URL = process.env.NEXT_PUBLIC_EVOLUTION_API_URL || "";
const API_KEY = process.env.NEXT_PUBLIC_EVOLUTION_API_KEY || "";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const instances = await prisma.instance.findMany({ where: { userId } });
  if (!instances || instances.length === 0) {
    return NextResponse.json({ instances: [] }, { status: 200 });
  }

  // Buscar todas as instâncias do Evolution API de uma vez
  try {
    const evoRes = await fetch(`${EVOLUTION_API_URL}/instance/fetchInstances`, {
      method: "GET",
      headers: { apikey: API_KEY },
    });

    if (evoRes.ok) {
      const evoInstances = await evoRes.json();

      // Mapear instâncias do Evolution com as do banco local
      const detailedInstances = instances.map((localInst) => {
        const evoInst = evoInstances.find(
          (evo: any) => evo.name === localInst.name
        );

        if (evoInst) {
          // Atualizar status da instância no banco
          const updateData: any = {
            connectionStatus: evoInst.connectionStatus || "close",
            profileName: evoInst.profileName || null,
            profilePicUrl: evoInst.profilePicUrl || null,
            number: evoInst.number || null,
            token: evoInst.token || null,
            disconnectionReason: evoInst.disconnectionReasonCode
              ? `Código: ${evoInst.disconnectionReasonCode} - ${
                  evoInst.disconnectionObject?.error?.message || "Desconectado"
                }`
              : null,
          };

          // Atualizar timestamps de conexão/desconexão
          if (
            evoInst.connectionStatus === "open" &&
            localInst.connectionStatus !== "open"
          ) {
            updateData.lastConnectionAt = new Date();
          } else if (
            evoInst.connectionStatus === "close" &&
            localInst.connectionStatus === "open"
          ) {
            updateData.lastDisconnectionAt = new Date();
          }

          // Atualizar no banco de forma assíncrona (não bloquear a resposta)
          prisma.instance
            .update({
              where: { id: localInst.id },
              data: updateData,
            })
            .catch((error) => {
              console.error(
                `Erro ao atualizar instância ${localInst.name}:`,
                error
              );
            });

          return {
            ...localInst,
            ...updateData,
            evolution: evoInst,
            _count: evoInst._count || { Message: 0, Contact: 0, Chat: 0 },
          };
        }

        return localInst;
      });

      return NextResponse.json({ instances: detailedInstances });
    }
  } catch (error) {
    console.error("Erro ao buscar instâncias do Evolution API:", error);
  }

  // Fallback: retornar instâncias locais se a API falhar
  return NextResponse.json({ instances });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const { name } = await req.json();
  if (!name)
    return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 });

  // Cria a instância no Evolution API
  try {
    const evoRes = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: API_KEY,
      },
      body: JSON.stringify({
        instanceName: name,
        integration: "WHATSAPP-BAILEYS",
      }),
    });
    if (!evoRes.ok) {
      const err = await evoRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: "Erro ao criar instância no Evolution", details: err },
        { status: 500 }
      );
    }
  } catch (e) {
    return NextResponse.json(
      {
        error: "Erro ao conectar ao Evolution API",
        details: e instanceof Error ? e.message : e,
      },
      { status: 500 }
    );
  }

  // Salva no banco local
  const instance = await prisma.instance.create({ data: { name, userId } });
  return NextResponse.json({ instance });
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const instanceId = searchParams.get("id");
  const instanceName = searchParams.get("name");

  console.log("DELETE request - userId:", userId);
  console.log("DELETE request - instanceId:", instanceId);
  console.log("DELETE request - instanceName:", instanceName);

  if (!instanceId && !instanceName) {
    return NextResponse.json(
      { error: "ID ou nome da instância é obrigatório" },
      { status: 400 }
    );
  }

  try {
    // Buscar a instância no banco local
    const whereClause = {
      OR: [
        { id: instanceId || undefined },
        { name: instanceName || undefined },
      ],
      userId,
    };

    console.log("WHERE clause:", JSON.stringify(whereClause, null, 2));

    const instance = await prisma.instance.findFirst({
      where: whereClause,
    });

    console.log("Instance found:", instance);

    if (!instance) {
      // Vamos verificar se existem instâncias para este usuário
      const allUserInstances = await prisma.instance.findMany({
        where: { userId },
        select: { id: true, name: true },
      });
      console.log("All user instances:", allUserInstances);

      return NextResponse.json(
        {
          error: "Instância não encontrada",
          debug: {
            searchedId: instanceId,
            searchedName: instanceName,
            userId,
            availableInstances: allUserInstances,
          },
        },
        { status: 404 }
      );
    }

    // Deletar da Evolution API primeiro
    try {
      const evoRes = await fetch(
        `${EVOLUTION_API_URL}/instance/delete/${instance.name}`,
        {
          method: "DELETE",
          headers: { apikey: API_KEY },
        }
      );

      if (!evoRes.ok) {
        const errorData = await evoRes.json().catch(() => ({}));
        console.error(
          `Erro ao deletar instância ${instance.name} da Evolution API:`,
          evoRes.status,
          errorData
        );

        // Se falhar ao deletar da Evolution API, retornar erro
        return NextResponse.json(
          {
            error: "Erro ao deletar instância da Evolution API",
            details: errorData,
            status: evoRes.status,
          },
          { status: 500 }
        );
      }

      console.log(
        `Instância ${instance.name} deletada com sucesso da Evolution API`
      );
    } catch (error) {
      console.error(
        `Erro ao conectar com Evolution API para deletar instância ${instance.name}:`,
        error
      );

      return NextResponse.json(
        {
          error: "Erro ao conectar com Evolution API",
          details: error instanceof Error ? error.message : error,
        },
        { status: 500 }
      );
    }

    // Só deletar do banco local se a exclusão da Evolution API foi bem-sucedida
    await prisma.instance.delete({
      where: { id: instance.id },
    });

    return NextResponse.json({
      success: true,
      message: `Instância ${instance.name} deletada com sucesso da Evolution API e do banco local`,
    });
  } catch (error) {
    console.error("Erro ao deletar instância:", error);
    return NextResponse.json(
      { error: "Erro interno ao deletar instância" },
      { status: 500 }
    );
  }
}
