import { NextRequest, NextResponse } from "next/server";

// Mock database
let instances = [
  { id: 1, name: "Instância 1", status: "online" },
  { id: 2, name: "Instância 2", status: "offline" },
];

export async function GET(req: NextRequest) {
  return NextResponse.json(instances);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const newInstance = {
    id: instances.length + 1,
    ...data,
    status: data.status || "offline",
  };
  instances.push(newInstance);
  return NextResponse.json(newInstance, { status: 201 });
}
