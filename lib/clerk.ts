import { clerkClient, auth } from "@clerk/nextjs/server";

export const getCurrentUser = async () => {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    const user = await clerkClient.users.getUser(userId);
    return user;
  } catch (error) {
    console.error("Erro ao obter usuário atual:", error);
    return null;
  }
};

export const getCurrentUserId = async () => {
  try {
    const { userId } = await auth();
    return userId;
  } catch (error) {
    console.error("Erro ao obter ID do usuário:", error);
    return null;
  }
};
