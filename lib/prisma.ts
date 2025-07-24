import { PrismaClient } from "@/lib/generated/prisma";

// Singleton do PrismaClient para evitar múltiplas instâncias em dev
let prisma: PrismaClient;

if (typeof global !== "undefined") {
  // @ts-ignore
  if (!global.prisma) {
    // @ts-ignore
    global.prisma = new PrismaClient();
  }
  // @ts-ignore
  prisma = global.prisma;
} else {
  prisma = new PrismaClient();
}

export default prisma;
