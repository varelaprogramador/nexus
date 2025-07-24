import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    // Captura o IP real do usuário
    const forwarded = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const userIp = forwarded ? forwarded.split(",")[0].trim() : realIp || "";
    await prisma.disparoLog.create({
      data: {
        ...data,
        userIp, // sobrescreve o userIp enviado pelo cliente
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : e },
      { status: 500 }
    );
  }
}
