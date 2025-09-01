import { useUser } from "@clerk/nextjs";

export function useIsAdmin() {
  const { user, isLoaded } = useUser();
  
  if (!isLoaded || !user) {
    return {
      isAdmin: false,
      isLoading: !isLoaded,
      user: null
    };
  }
  
  const userRole = user.publicMetadata?.role as string;
  
  return {
    isAdmin: userRole === "admin",
    isLoading: false,
    user,
    role: userRole
  };
}

export function useRequireAdmin() {
  const { isAdmin, isLoading, user, role } = useIsAdmin();
  
  return {
    isAdmin,
    isLoading,
    user,
    role,
    isAuthorized: isAdmin,
    error: !isLoading && !isAdmin ? "Acesso restrito a administradores" : null
  };
}