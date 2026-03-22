---
description: Como criar novos componentes, páginas e funcionalidades neste projeto
---

## Stack do Projeto
- **Framework:** Next.js 15 (App Router)
- **Banco de Dados:** Supabase (PostgreSQL) — projeto: servicios-ambulancia
- **Estilo:** CSS puro com classes utilitárias em `globals.css`
- **Idioma:** Espanhol colombiano (es-CO) — TODO texto da UI em espanhol
- **TypeScript:** Strict mode ativado

## Regras Obrigatórias
1. Todo texto da interface DEVE estar em **espanhol colombiano**
2. Usar cliente Supabase em `@/lib/supabase`
3. Componentes do servidor por padrão — só usar `"use client"` quando necessário (hooks, eventos)
4. Usar as classes CSS definidas em `globals.css` (card, btn, form-input, etc.)
5. Sem bibliotecas de componentes externas — só CSS customizado

## Estrutura de Pastas
```
src/
  app/
    dashboard/          ← layout com sidebar
      pacientes/        ← CRUD pacientes
      ordenes/          ← CRUD órdenes de servicio
      historias/        ← CRUD historias clínicas APH
      ambulancias/      ← CRUD ambulancias
      tripulantes/      ← CRUD tripulantes
  lib/
    supabase.ts         ← cliente Supabase
  types/
    database.ts         ← tipos gerados do Supabase
```

## Tabelas do Supabase
- `paciente` — datos del paciente
- `orden_servicio` — órdenes de servicio (FK → paciente)
- `ambulancia` — flota de ambulancias
- `tripulante` — personal médico/paramédico
- `asignacion_tripulacion` — asignación de tripulación a una OS
- `historia_clinica_aph` — historia clínica pre-hospitalaria

## Padrões de Código

### Server Action para CRUD
```typescript
// src/app/dashboard/pacientes/actions.ts
"use server";
import { supabase } from "@/lib/supabase";

export async function crearPaciente(data: FormData) {
  const { error } = await supabase.from("paciente").insert({...});
  if (error) throw new Error(error.message);
}
```

### Formulário Padrão
```tsx
<form>
  <div className="form-group">
    <label className="form-label">Primer Nombre <span className="required">*</span></label>
    <input className="form-input" placeholder="Ej: Juan Carlos" required />
  </div>
</form>
```

## Workflow de Desenvolvimento
1. Criar server action em `actions.ts` na pasta da rota
2. Criar página de listagem em `page.tsx`  
3. Criar formulário em `nuevo/page.tsx` ou `[id]/editar/page.tsx`
4. Sempre validar dados no servidor antes de salvar
