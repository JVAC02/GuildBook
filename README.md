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

## Prévia web pelo GitHub Pages

O workflow `.github/workflows/deploy-pages.yml` publica automaticamente a pasta `web/` a cada atualização enviada para `main` ou `work`. Assim, a interface e as funcionalidades locais do navegador podem ser acompanhadas em:

```text
https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/
```

No GitHub, abra **Settings → Pages** e selecione **GitHub Actions** em **Source** uma única vez. Depois, acompanhe a publicação na aba **Actions**; o endereço definitivo aparece no resumo da execução `Publicar GuildBook no GitHub Pages`.

> Adicionar o workflow ao código não cria um repositório nem publica o site sozinho. O repositório precisa estar conectado a um remoto do GitHub, o commit precisa ser enviado e o Pages precisa estar habilitado. Não divulgue um endereço `github.io` antes de a execução aparecer como concluída na aba **Actions**.

Para localizar o endereço real, entre em `github.com`, abra a foto do perfil → **Your repositories** e procure por `GuildBook`. O endereço do navegador nessa página, no formato `https://github.com/USUARIO/REPOSITORIO`, é o remoto que deve ser configurado. Se a busca não encontrar o projeto, o repositório ainda precisa ser criado; não presuma um endereço `github.io`.

Faça a autenticação do GitHub somente no seu próprio navegador ou terminal. Nunca envie senha ou token em conversa. Depois da publicação, o próprio workflow acessa o endereço gerado e confere a versão 6 e as prescrições corrigidas de dipirona e paracetamol.

A versão do GitHub Pages é uma prévia web pública e não inclui login ChatGPT, painel administrativo ou banco D1. Esses recursos dependem do Worker da hospedagem atual. Não armazene dados de pacientes na versão pública.

## Visualização local como site

Execute `npm run preview` e abra `http://127.0.0.1:4173`. A prévia serve diretamente a pasta `web/`, sem cache, para conferir o visual e as funcionalidades antes da publicação. Use `HOST=0.0.0.0 PORT=4173 npm run preview` quando o ambiente de desenvolvimento precisar expor a porta.
