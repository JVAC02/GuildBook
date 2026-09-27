# Clinical states — bloco 1

> Execução: superpowers:executing-plans, nesta sessão. Especificação: pedido do usuário para o bloco 1, PR #8.

**Objetivo:** recuperar utilidade do conteúdo histórico explícito sem validar ou inventar esquemas.
**Arquitetura:** estado clínico por combinação; catálogo resume o melhor conteúdo disponível. Gate único produz prévia e cópia, com confirmação transitória vinculada ao texto em revisão. Contextos ambulatorial/urgência separados; alto risco somente consulta.
**Tecnologia:** JavaScript existente em web/index.html, Node test, Playwright já instalado.

## Restrições
- Branch fix/clinical-validation-v63, PR #8, base confirmada 6ba71c1; sem merge/deploy/dependências novas.
- Preservar 322 cadastros, 49 patologias e as fontes/esquemas de diclofenaco/cetoprofeno.
- Recuperar apenas dados explícitos do HEAD/da main remota; nenhum fallback clínico pelo nome.
- REVIEW_PENDING não é validação clínica; quantidades não calculáveis devem ser declaradas como revisão manual.

## Tarefas
- [x] Testar estados, gate de confirmação, quantidade exata/embalagem, isolamento pediátrico e de apresentações.
- [x] Preservar histórico; registrar apresentações adultas explícitas e algoritmos pediátricos históricos compatíveis. INCOMPLETE explica lacunas; HIGH_RISK preserva consulta.
- [x] Implementar funções puras de quantidade e estado por rota, usando-as na interface existente.
- [x] Testar Playwright: revisão recusada/confirmada, clipboard, peso global, ida e volta entre rotas, apresentação, quantidade, patologias, desktop/mobile e standalone.
- [x] Regenerar, executar suíte completa, revisar diff, commit e push somente na branch autorizada.

## Pontos de revisão
- Confirmação não pode sobreviver a alteração de texto nem habilitar INCOMPLETE/HIGH_RISK.
- Quantidade por embalagem não pode aceitar qualquer número no intervalo.
- Migração não pode transferir limite/forma/via do adulto à pediatria.
- Busca e filtro de uma rota não podem destruir seleção de outra.
- Dados hospitalares e apresentações conflitantes continuam consultáveis sem receita domiciliar.
