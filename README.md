# GuildBook

Consulta clínica com estados explícitos de revisão. A versão 6.3.1 preserva 322 cadastros e 49 patologias: somente 2 medicamentos, em 4 esquemas adultos específicos, têm receita habilitada. Os demais 320 cadastros, toda a pediatria e os protocolos integrais de patologias permanecem bloqueados.

Consulte [o relatório de revisão e fontes](docs/clinical-review-v6.3.1.md) e [a auditoria nominal das expansões](docs/expansion-audit.json).

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
- Testes clínicos: tests/clinical-content.test.mjs. Testes de interface: tests/browser.e2e.mjs (390/1440 px, fonte web e standalone, cópia real e geometria).
- Prévia local: http://127.0.0.1:4173.

## Critério para habilitar receita

Cada esquema precisa de medicamento, sal, concentração, forma, via, população, indicação, dose, intervalo, limite, duração quando definida e fonte direta com título, ano e revisão. getPrescription é a barreira usada tanto na prévia quanto na cópia. Não há fallback a strings históricas. Registros novos começam como cadastro, sem dose ou via inferida pelo nome. RENAME identifica apresentações; não é fonte de dose nem selo automático do catálogo.

A quantidade deve cobrir o tratamento e pode ser arredondada dentro de uma embalagem documentada. A duração dos esquemas orais habilitados é obrigatoriamente informada pelo prescritor: a bula não fixa um número de dias. Não há dados clínicos de paciente persistidos; favoritos e tema permanecem locais.

## Publicação

GitHub Pages: https://JVAC02.github.io/GuildBook/. O workflow de publicação usa web/ quando main é atualizada; abrir uma PR não publica a mudança. O workflow testa e verifica a versão após publicar.

O projeto também contém Worker com autenticação e controle de acesso para a hospedagem Sites. Atualizar GitHub Pages não atualiza automaticamente essa hospedagem. A versão pública estática não inclui login ChatGPT, painel administrativo ou D1.

Não incluir senhas, tokens, arquivos .env ou dados reais de pacientes no repositório.
