# Configuração do Clerk para Autenticação

## Passos para Configurar

### 1. Criar Conta no Clerk

- Acesse [clerk.com](https://clerk.com)
- Crie uma conta e um novo projeto

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_sua_chave_publica_aqui
CLERK_SECRET_KEY=sk_test_sua_chave_secreta_aqui

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### 3. Configurar Domínios no Clerk Dashboard

- No dashboard do Clerk, vá em "Settings" > "Domains"
- Adicione seu domínio local (ex: `localhost:3000`)
- Configure as URLs de redirecionamento

### 4. Funcionalidades Implementadas

#### Autenticação Automática

- Todas as rotas do dashboard (`/dashboard/*`) são protegidas
- Usuários não autenticados são redirecionados para `/sign-in`
- Middleware configurado para proteger rotas automaticamente

#### Componentes de Usuário

- `UserButton` integrado no sidebar e header
- Informações do usuário exibidas dinamicamente
- Avatar com fallback para iniciais do nome
- Estado de loading durante carregamento

#### Rotas Públicas

- `/` - Página inicial
- `/sign-in` - Página de login
- `/sign-up` - Página de cadastro

#### Rotas Protegidas

- `/dashboard/*` - Todas as páginas do dashboard
- `/api/*` - Todas as APIs (protegidas automaticamente)

### 5. Uso nos Componentes

```tsx
import { useUser } from "@clerk/nextjs";

function MeuComponente() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return <div>Carregando...</div>;
  if (!user) return <div>Não autenticado</div>;

  return <div>Olá, {user.fullName}!</div>;
}
```

### 6. APIs Protegidas

```tsx
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Não autorizado", { status: 401 });
  }

  // Sua lógica aqui
}
```

## Estrutura de Arquivos

- `middleware.ts` - Configuração de proteção de rotas
- `components/ProtectedRoute.tsx` - Componente de proteção
- `lib/clerk.ts` - Utilitários do Clerk
- `app/(dashboard)/layout.tsx` - Layout protegido do dashboard
- `app/(dashboard)/clientLayout.tsx` - Layout cliente com informações do usuário

## Notas Importantes

- O Clerk já está instalado como dependência
- O middleware está configurado para proteger automaticamente as rotas
- Todas as páginas do dashboard herdam a proteção do layout
- O componente `ProtectedRoute` garante que apenas usuários autenticados acessem o dashboard
