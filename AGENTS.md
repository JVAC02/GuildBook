# AGENTS.md — GuildBook

## 1. Identidade do projeto

Este repositório é o projeto oficial **GuildBook**.

Fonte canônica:
- Repositório: `JVAC02/GuildBook`
- Branch-base padrão: `main`
- Fonte de verdade: GitHub remoto / ambiente Cloud
- Não criar outro repositório GuildBook.
- Não usar cópia local como fonte principal quando o ambiente remoto estiver disponível.
- Não recriar arquivos ou estruturas que já existam sem antes verificar o repositório atual.

Antes de qualquer tarefa:
1. considerar a `main` remota mais recente;
2. verificar a estrutura atual do repositório;
3. identificar arquivos realmente afetados;
4. evitar alterações fora do escopo solicitado.

---

## 2. Ferramentas obrigatórias

### Superpowers

Use **Superpowers como fluxo padrão para qualquer alteração não trivial** no GuildBook.

Inclui:
- novas funcionalidades;
- correções de bugs;
- refatorações;
- mudanças em múltiplos arquivos;
- atualização de banco de dados;
- alterações de arquitetura;
- criação ou modificação de testes;
- mudanças com risco de regressão;
- investigação de falhas;
- mudanças relevantes em conteúdo clínico estruturado.

Fluxo esperado:

**analisar → planejar → implementar → testar → depurar → revisar → concluir**

Não considere uma tarefa concluída apenas porque o código foi alterado.

Para alterações absolutamente triviais, não introduza complexidade desnecessária apenas para usar um workflow extenso.

---

### Context7

Use **Context7 sempre que a tarefa depender de documentação técnica externa atual**.

Inclui:
- frameworks;
- bibliotecas;
- APIs;
- SDKs;
- pacotes npm;
- banco de dados;
- Drizzle;
- ferramentas de build;
- autenticação;
- deploy;
- workers;
- breaking changes;
- versões;
- sintaxe ou comportamento que possa ter mudado.

Antes de implementar algo baseado em dependência externa:

1. consultar Context7;
2. verificar a documentação atual;
3. confirmar versão e comportamento;
4. implementar somente depois da verificação.

Não inventar:
- APIs;
- propriedades;
- métodos;
- opções de configuração;
- comportamento de bibliotecas.

Não usar apenas a memória do modelo quando documentação atual puder ser consultada.

---

## 3. Conteúdo médico

O GuildBook contém conteúdo clínico, farmacológico e de prescrição.

Alterações médicas têm impacto potencial em segurança do paciente.

### Fontes clínicas

Não utilizar Context7 como fonte clínica principal.

Priorizar:

1. Ministério da Saúde / órgãos oficiais brasileiros;
2. ANVISA;
3. RENAME vigente;
4. PCDTs/MS;
5. Bulário Eletrônico da ANVISA;
6. sociedades médicas brasileiras;
7. diretrizes internacionais relevantes quando não houver equivalente brasileiro adequado;
8. PubMed/MEDLINE;
9. Cochrane;
10. SciELO quando pertinente.

Evitar como fonte clínica:
- blogs;
- fóruns;
- redes sociais;
- Wikipédia;
- páginas comerciais;
- conteúdo sem referência verificável.

Sempre preferir documentação recente e vigente.

Quando fontes divergirem:
- não misturar recomendações;
- identificar a divergência;
- priorizar a diretriz aplicável ao contexto brasileiro.

---

## 4. Medicamentos

Ao alterar qualquer medicamento, verificar quando aplicável:

- princípio ativo;
- nome comercial quando utilizado;
- indicação;
- apresentação;
- concentração;
- dose;
- via;
- intervalo;
- duração;
- dose máxima;
- ajuste renal;
- ajuste hepático;
- contraindicações;
- interações relevantes;
- gestação;
- lactação;
- pediatria;
- idosos;
- diluição;
- velocidade de infusão;
- monitorização;
- alertas de segurança;
- exigência de receita;
- controle especial;
- antimicrobianos;
- disponibilidade/apresentações utilizadas no Brasil.

Não escrever frases genéricas como:

- “usar conforme protocolo”;
- “dose conforme indicação”;
- “seguir orientação médica”;

quando o sistema deveria fornecer uma orientação objetiva.

Se existirem apresentações diferentes do mesmo princípio ativo com esquemas diferentes, manter os esquemas separados.

Não utilizar duração arbitrária de tratamento.

Não extrapolar dose ou duração de um medicamento para outro.

---

## 5. Estrutura atual do repositório

O repositório possui, entre outros:

- `.github/workflows/`
- `.openai/`
- `db/`
- `dist/`
- `drizzle/`
- `scripts/`
- `tests/`
- `web/`
- `worker/`
- `GuildBook-v6-Site.html`
- `package.json`
- `package-lock.json`
- `drizzle.config.ts`

Antes de alterar um arquivo compilado ou distribuído, verificar de onde ele é gerado.

Não editar somente um artefato derivado se existir uma fonte correspondente.

Exemplo:

**fonte → build/geração → dist/arquivo publicado**

Manter fonte e artefatos gerados sincronizados.

---

## 6. Arquivos gerados

Quando arquivos como:

- `dist/*`
- `GuildBook-v6-Site.html`
- arquivos publicados;
- bundles;
- artefatos de build;

forem derivados de outros arquivos:

1. alterar a fonte correta;
2. executar o processo de geração/build;
3. regenerar os artefatos;
4. confirmar que fonte e versão distribuída são equivalentes.

Não fazer correção manual apenas no arquivo compilado se isso criar divergência com a fonte.

---

## 7. Git e branches

Branch-base padrão:

`main`

Antes de iniciar alterações significativas:
- considerar a versão mais recente da `main`;
- criar branch própria quando apropriado;
- evitar alterações diretas desnecessárias na `main`.

Se já existir branch ou Pull Request da mesma tarefa:
- verificar primeiro;
- preferir continuar o trabalho existente;
- não criar duplicatas sem necessidade.

Não sobrescrever alterações válidas existentes.

Nunca deixar marcadores de conflito:

`<<<<<<<`

`=======`

`>>>>>>>`

Se houver conflito:
1. entender as duas versões;
2. preservar as alterações mais recentes e corretas;
3. resolver conscientemente;
4. executar novamente testes e build.

---

## 8. Pull Requests

Antes de considerar um PR pronto:

- verificar diff completo;
- confirmar ausência de alterações não relacionadas;
- executar testes relevantes;
- executar build;
- verificar arquivos gerados;
- revisar regressões;
- confirmar que não há conflitos;
- confirmar que o comportamento solicitado realmente funciona.

Não fazer merge apenas porque o código compila.

---

## 9. Testes

Testes são obrigatórios quando a alteração possuir risco relevante.

Antes de concluir:

1. executar os testes existentes relacionados;
2. criar novos testes quando houver comportamento novo ou bug reproduzível;
3. corrigir falhas causadas pela alteração;
4. não remover testes válidos apenas para fazer o pipeline passar.

Quando aplicável, executar:

`npm test`

e demais scripts definidos em `package.json`.

Se algum teste não puder ser executado:
- informar claramente;
- explicar o motivo;
- não declarar que “todos os testes passaram”.

---

## 10. Build

Após alterações que impactem código executável, frontend, distribuição ou artefatos:

- executar o build adequado;
- corrigir erros;
- confirmar geração correta dos arquivos finais.

Só declarar:

“build passou”

se ele tiver sido realmente executado com sucesso.

---

## 11. Debugging

Quando existir bug:

1. reproduzir o problema;
2. identificar a causa;
3. corrigir a causa, não apenas o sintoma;
4. testar o cenário original;
5. verificar regressões relacionadas.

Não fazer mudanças aleatórias repetidamente esperando que o problema desapareça.

Use o workflow de debugging estruturado do Superpowers quando disponível.

---

## 12. Segurança

Não reduzir segurança apenas para fazer uma funcionalidade funcionar.

Não remover sem justificativa:
- autenticação;
- autorização;
- validação;
- isolamento de usuário;
- proteção de dados;
- controles de acesso;
- verificações de integridade.

Se uma solução exigir redução de segurança:
1. interromper;
2. explicar o risco;
3. propor alternativa segura.

Nunca inserir:
- senhas;
- tokens;
- secrets;
- chaves privadas;
- credenciais;

diretamente no repositório.

---

## 13. Banco de dados

Antes de alterar banco de dados:

- analisar schema atual;
- verificar migrations existentes;
- consultar documentação técnica atual quando necessário;
- usar Context7 para Drizzle, banco, ORM ou API relacionada;
- preservar dados existentes;
- evitar alterações destrutivas não solicitadas.

Mudanças de schema devem ter migration adequada quando aplicável.

Não alterar banco de produção diretamente sem necessidade explícita.

---

## 14. Mudanças mínimas e controladas

Preferir a menor alteração capaz de resolver corretamente a tarefa.

Evitar:
- reescrever grandes partes do projeto sem necessidade;
- alterar arquitetura sem motivo;
- mudar estilo de código de arquivos não relacionados;
- criar dependências desnecessárias;
- duplicar lógica já existente.

Preservar funcionalidades existentes fora do escopo solicitado.

---

## 15. Verificação visual

Quando a tarefa alterar interface:

- verificar desktop;
- verificar mobile quando pertinente;
- verificar responsividade;
- verificar textos cortados;
- verificar overflow;
- verificar estados vazios;
- verificar botões;
- verificar formulários;
- verificar erros de console quando possível.

Não considerar uma alteração visual concluída apenas porque o HTML/CSS foi modificado.

---

## 16. Atualização de grandes bases de dados/conteúdo

Quando houver importação ou atualização grande, como centenas de medicamentos:

1. validar formato antes de importar;
2. evitar duplicidades;
3. preservar registros válidos existentes;
4. detectar registros incompletos;
5. detectar campos genéricos ou placeholders;
6. validar consistência entre apresentação e posologia;
7. executar testes automatizados;
8. revisar amostras representativas;
9. verificar regressões após a atualização.

Não considerar quantidade de registros como prova de qualidade.

---

## 17. Não inventar conclusão

Nunca afirmar que:

- “foi corrigido”;
- “funciona”;
- “deploy passou”;
- “testes passaram”;
- “build passou”;
- “está publicado”;

sem evidência real correspondente.

Diferenciar claramente:

- implementado;
- testado;
- validado;
- publicado.

---

## 18. Checklist obrigatório antes de finalizar

Antes de responder que uma tarefa relevante foi concluída, verificar:

- [ ] pedido do usuário foi atendido;
- [ ] Superpowers foi utilizado quando aplicável;
- [ ] Context7 foi consultado quando documentação técnica externa foi necessária;
- [ ] conteúdo clínico foi validado em fontes médicas apropriadas quando aplicável;
- [ ] arquivos corretos foram alterados;
- [ ] arquivos gerados foram regenerados;
- [ ] testes relevantes foram executados;
- [ ] build foi executado quando necessário;
- [ ] bugs encontrados foram corrigidos ou relatados;
- [ ] não existem conflitos Git;
- [ ] não existem regressões conhecidas relevantes;
- [ ] nenhuma funcionalidade fora do escopo foi removida;
- [ ] não existem secrets ou credenciais expostos.

---

## 19. Regra final

O objetivo não é apenas produzir código.

O objetivo é entregar uma alteração:

**correta + verificável + testada + atualizada + segura + sem regressões conhecidas.**

Se houver dúvida relevante, falta de acesso, documentação insuficiente ou impossibilidade de validação:

**não inventar. Informar claramente a limitação antes de concluir.**
