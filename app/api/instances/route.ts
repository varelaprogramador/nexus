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

  // Buscar detalhes de cada instância no Evolution API
  const detailedInstances = await Promise.all(
    instances.map(async (inst) => {
      try {
        const evoRes = await fetch(
          `${EVOLUTION_API_URL}/instance/${inst.name || inst.id}`,
          {
            method: "GET",
            headers: { apikey: API_KEY },
          }
        );
        if (!evoRes.ok) return inst;
        const evoData = await evoRes.json();
        return { ...inst, evolution: evoData };
      } catch {
        return inst;
      }
    })
  );

  return NextResponse.json({ instances: detailedInstances });
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
