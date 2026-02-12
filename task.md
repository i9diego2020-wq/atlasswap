
# Projeto Atlas Swap - Checklist de Desenvolvimento [x]

## 1. Fundação e Design System [x]
- [x] Configurar estrutura base do projeto (Vite + React + Tailwind)
- [x] Definir paleta de cores Glassmorphism (Indigo, Emerald, Rose)
- [x] Criar componentes UI básicos (Button, Card, Input, Badge)
- [x] Implementar animações suaves (Framer Motion / Tailwind Animate)

## 2. Interface do Usuário (Cliente) [x]
- [x] Sidebar responsiva com navegação
- [x] Navbar com perfil e logout
- [x] Dashboard: Cards de estatísticas e gráficos de volume
- [x] NewTransaction: Formulário de Swap com calculadora de taxas

## 3. Integração Supabase e Backend [x]
- [x] Configurar Supabase Client e variáveis de ambiente
- [x] Definir Schema do Banco (Profiles, Transactions, Settings)
- [x] Implementar Sistema de Autenticação completo (Login/Registro)
- [x] Sincronizar bloqueio e suporte na tela de Login

## 4. Painel Administrativo (Admin) [x]
- [x] Admin Dashboard: Visão global de faturamento e usuários
- [x] Admin Customers: Gestão e busca de perfis de clientes
- [x] Admin Settings: Controle global de taxas e cotações
- [x] Admin Transactions: Filtros avançados e processamento [x]
- [x] Implementar Modais de Confirmação e Sucesso Customizados [x]
- [x] Ajustar cores de bloqueio (Vermelho) e formatação de WhatsApp (Limite 11 dígitos) [x]

## 5. Refinamento e Entrega [x]
- [x] Diagnose the white screen on `http://localhost:3000`
- [x] Implement initial fixes (index.css, ErrorBoundary)
- [/] Deep Debugging
    - [x] Simplify entry point further to find crash (SUCCESS: React works)
    - [x] Verify Supabase, Liquid, Auth, Sidebar imports (SUCCESS: Purple Screen)
    - [/] Verify Navbar, NewTransaction imports (TESTING)
- [/] Restore and Fix
    - [ ] Restore original `App.tsx` logic
    - [ ] Identify and fix the real crashing component (if any remains)
- [ ] Verify fix
- [x] Sincronizar spread dinâmico na Nova Transação
- [x] Blindar lógica de login para bloqueados no App.tsx
- [x] Gerar documentação final (Walkthrough)

## 6. Segurança e Controle de Acesso (RBAC) [x]
- [x] Implementar Guardas de Rota no App.tsx para administradores [x]
- [x] Impedir acesso via manipulação direta de estado/URL [x]
- [x] Validar sessões de administradores no carregamento [x]

## 7. Sincronização de Auth e Perfis [x]
- [x] Criar Trigger SQL para sincronizar e-mail e role no auth.users [x]
- [x] Validar atualização imediata de credenciais [x]

## 8. Deploy (Vercel) [x]
- [x] Criar vercel.json para roteamento SPA [x]
- [x] Configurar Root Directory para 'atlasswap' [x]
- [x] Configurar Variáveis de Ambiente na Vercel [x]

## 9. Integração Liquid Network (Produção) [x]
- [x] Corrigir suporte a WebAssembly (Wasm) e Polyfills no Vite [x]
- [x] Resolver erros de conflito de Buffer e readable-stream [x]
- [x] Integrar UI de Pagamento (QR Code + Monitoramento) na Nova Transação [x]
- [x] Gerir índice de derivação no Supabase (settings) [x]
- [x] Limpeza final de logs e depuração para produção [x]
- [x] Realizar build final e validar walkthrough [x]
