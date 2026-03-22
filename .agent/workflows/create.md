---
description: Processo para criar novos componentes, páginas ou arquivos
---

## /create — Criar Novo Arquivo

1. Identificar o tipo: página, componente, server action, tipo TypeScript
2. Seguir a estrutura de pastas em `AGENTS.md`
3. Usar idioma espanhol colombiano em todo texto da UI
4. Usar classes CSS de `globals.css`
5. Para páginas: criar em `src/app/dashboard/[modulo]/`
6. Para componentes reutilizáveis: criar em `src/components/`

**Convenções de nomenclatura:**
- Arquivos: kebab-case (`lista-pacientes.tsx`)
- Componentes: PascalCase (`ListaPacientes`)
- Server actions: camelCase (`crearPaciente`)
