import { auth } from "@clerk/nextjs/server";
import { createClerkClient } from "@clerk/nextjs/server";

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function checkUserRole(requiredRole: string = "admin") {
  const { userId } = await auth();
  
  console.log("Debug auth - userId:", userId);
  
  if (!userId) {
    console.log("Debug auth - Usuário não encontrado");
    return { authorized: false, user: null };
  }

  try {
    const user = await clerk.users.getUser(userId);
    const userRole = user.publicMetadata?.role as string;
    
    console.log("Debug auth - User role:", userRole);
    console.log("Debug auth - Required role:", requiredRole);
    console.log("Debug auth - publicMetadata:", user.publicMetadata);
    
    return { 
      authorized: userRole === requiredRole, 
      user,
      role: userRole 
    };
  } catch (error) {
    console.error("Erro ao verificar role do usuário:", error);
    return { authorized: false, user: null, role: null };
  }
}

export async function requireAdmin() {
  const { authorized, user, role } = await checkUserRole("admin");
  
  if (!authorized) {
    throw new Error(
      !user 
        ? "Acesso negado: usuário não autenticado" 
        : `Acesso negado: role "${role || 'none'}" não tem permissão de administrador`
    );
  }
  
  return { user, role };
}