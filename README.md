# GuildBook

Consulta clínica com estados explícitos de revisão. A versão 6.3.1 preserva 322 cadastros e 49 patologias. Apenas 2 medicamentos, em 4 esquemas adultos específicos, têm validação individual. O bloco 1 acrescenta conteúdo histórico estruturado em REVIEW_PENDING, com prévia identificada e confirmação obrigatória a cada cópia. Registros incompletos e hospitalares/alto risco continuam disponíveis para consulta.

Consulte [a arquitetura do bloco 1](docs/clinical-states-block1.md), [o relatório de revisão e fontes](docs/clinical-review-v6.3.1.md) e [a auditoria nominal das expansões](docs/expansion-audit.json).

## Desenvolvimento

Requer Node.js 24.

```sh
npm ci
npm run build
npm run export:standalone
npm test
npx playwright install chromium
npm run test:ui
npm run preview
```

- Fonte de verdade: web/index.html. Não editar os HTML/JS gerados separadamente.
- Worker: worker/index.js; build gera dist/server/index.js e embute web/.
- Exportação offline: GuildBook-v6-Site.html, gerado pelo script export:standalone.
- Testes clínicos: tests/clinical-content.test.mjs e tests/clinical-workflow.test.mjs. Testes de interface: tests/browser.e2e.mjs (390/1440 px, fonte web e standalone, cópia real, confirmação, navegação, quantidade e geometria).
- Prévia local: http://127.0.0.1:4173.

## Critério para habilitar receita

Cada esquema VALIDATED precisa de medicamento, sal, concentração, forma, via, população, indicação, dose, intervalo, limite, duração quando definida e fonte direta com título, ano e revisão. getPrescription produz a prévia e o texto copiado. REVIEW_PENDING preserva dados explícitos anteriores e referências históricas, sem afirmar validação; copyMedicinePrescription exige confirmação transitória. Não há fallback para nomes ou strings arbitrárias. Registros novos sem dados essenciais começam como INCOMPLETE. RENAME identifica apresentações; não é fonte de dose nem selo automático do catálogo.

A quantidade calculável aceita o total necessário exato ou, selecionando embalagem fechada, ceil(necessária / tamanho) × tamanho. Não aceita números intermediários como arredondamento. Quantidades históricas não calculáveis exigem preenchimento manual explícito, sem presumir tamanho de embalagem. A duração dos quatro esquemas validados é informada pelo prescritor, pois suas fontes não fixam número de dias. Estados de Prescrições/Dosagens e seus modos adulto/pediátrico são independentes; o peso global é compartilhado apenas por ação explícita nesse campo. Nenhum dado de paciente é persistido; favoritos e tema permanecem locais.

## Publicação

GitHub Pages: https://JVAC02.github.io/GuildBook/. O workflow de publicação usa web/ quando main é atualizada; abrir uma PR não publica a mudança. O workflow testa e verifica a versão após publicar.

O projeto também contém Worker com autenticação e controle de acesso para a hospedagem Sites. Atualizar GitHub Pages não atualiza automaticamente essa hospedagem. A versão pública estática não inclui login ChatGPT, painel administrativo ou D1.

Não incluir senhas, tokens, arquivos .env ou dados reais de pacientes no repositório.
