---
description: Processo para desenvolver e entregar novas funcionalidades no CRM Ambulância
---

## /feature — Nova Funcionalidade

1. Entender o requisito (módulo afetado: pacientes/ordenes/historias/ambulancias/tripulantes)
2. Criar server action em `src/app/dashboard/[modulo]/actions.ts`
3. Criar/atualizar página em `src/app/dashboard/[modulo]/page.tsx`
4. Criar formulário em `src/app/dashboard/[modulo]/nuevo/page.tsx`
5. Testar no navegador em `http://localhost:3000`
6. Verificar que dados aparecem no Supabase

**Lembrar:**
- Todo texto em espanhol colombiano
- Usar classes de `globals.css` (card, btn-primary, form-input, etc.)
- IDs das tabelas são UUIDs gerados pelo Supabase
