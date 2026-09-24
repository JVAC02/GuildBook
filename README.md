# GuildBook

Aplicativo de apoio clínico para consulta rápida de prescrições e cálculos de dose.

## Desenvolvimento

Requer Node.js. Na raiz do projeto:

```sh
npm ci
npm test
npm run build
```

- `web/`: interface e arquivos estáticos.
- `worker/`: servidor e controle de acesso.
- `db/` e `drizzle/`: esquema e migrações do banco.
- `tests/`: testes de acesso.
- `.openai/hosting.json`: identificação do Site e vínculo lógico com o banco D1.

## Publicação

O site atual é [guildbook.joaovitor91094.chatgpt.site](https://guildbook.joaovitor91094.chatgpt.site), publicado via Sites. Este repositório contém uma cópia do código-fonte da versão 5, importada em 24/09/2026. **Enviar alterações ao GitHub não atualiza automaticamente o site publicado.** Revise as mudanças e sincronize-as com o projeto Sites antes de publicar uma nova versão.

Não inclua senhas, tokens, arquivos `.env` ou dados de pacientes no repositório. Conteúdo clínico novo ou corrigido exige conferência nas diretrizes vigentes.
