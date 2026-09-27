# GuildBook — estados clínicos, bloco 1

Implementação sobre o HEAD oficial 6ba71c1 do PR #8, na branch fix/clinical-validation-v63. A main remota foi consultada para recuperar algoritmos históricos explícitos; ela não substituiu o HEAD do PR. Não houve nova revisão médica integral, alteração ampla de fontes, redesign, merge ou deploy.

## Antes e depois

Antes: o início do aplicativo apagava adult.rx dos 50 registros iniciais; calcPediatric retornava erro incondicional; receita-habilitada era o único estado funcional. Dosagens mudava o modo de todos os medicamentos no mesmo objeto utilizado por Prescrições.

Depois: os 50 registros preservam dados históricos. Um registro literal de apresentações vincula os textos às formulações correspondentes. A expansão genérica continua sem receita inventada. O estado é avaliado por apresentação/população; o cadastro resume o conteúdo disponível, sem habilitar outras combinações.

| Estado | Comportamento |
|---|---|
| VALIDATED | 4 esquemas adultos de 2 medicamentos, com fontes e controles da v6.3.1 preservados |
| REVIEW_PENDING | Consulta, cálculo/prévia quando estruturados e cópia identificada após confirmação explícita a cada tentativa |
| INCOMPLETE | Consulta preservada; ausência, placeholder ou conflito essencial impede geração |
| HIGH_RISK | Consulta; não produz prescrição automática ambulatorial nem é liberado pelo diálogo de revisão |

O estado não muda após confirmação. A confirmação recebe o texto já gerado e a cópia reavalia os campos após o diálogo; mudanças invalidam a tentativa. A API não aceita flag persistente de consentimento nem uma string de receita arbitrária.

Contagem do catálogo neste bloco: 2 VALIDATED, 46 REVIEW_PENDING, 204 INCOMPLETE e 70 HIGH_RISK. Há 72 combinações históricas em revisão (45 adultas e 27 pediátricas), além dos quatro esquemas validados. Nenhuma confirmação torna essas combinações clinicamente auditadas.

## Quantidade

quantityOptions(requiredQuantity, packSize) mantém dois valores separados:

- requiredQuantity: quantidade matemática exigida;
- packQuantity: Math.ceil(requiredQuantity / packSize) * packSize.

validateQuantity exige inteiro positivo e igualdade com a alternativa selecionada. Para 15/24: 15 no modo quantidade necessária; 24 no modo embalagem. 16, 20, 23, 25, decimais, zero e negativos são recusados. Embalagem desconhecida nunca recebe tamanho presumido.

Nos esquemas históricos com curso fixo, a quantidade decorre dos números expressos naquele curso. Uso contínuo, condicional e frascos sem volume de embalagem não permitem calcular cobertura: o campo exige quantidade definida pelo usuário e o documento declara que embalagem/cobertura não foram calculadas. Esta é uma limitação de REVIEW_PENDING, não um arredondamento automático.

## Pediatria e contexto

calculateHistoricalPediatric preserva regras explícitas por mg/kg ou faixa etária/peso da base remota, identificadas como revisão pendente. Não utiliza adult.rx. Para líquidos ponderais, o volume é arredondado para baixo em 0,1 mL e respeita limite por administração e diário. Idade, peso quando necessário, concentração e limites são verificados. Não há conversão automática de mL em gotas.

Regras manuais, concentrações finais hospitalares ausentes, combinações não cadastradas e aplicação tópica sem quantidade por administração permanecem consultáveis sem gerar receita. O histórico de permetrina mistura creme/loção e permanece INCOMPLETE. Metoclopramida adulta depende de limite por peso ainda não parametrizado e também fica INCOMPLETE; isso não apaga o cálculo pediátrico separado.

careContext diferencia ambulatory, urgent e o espaço reservado resuscitation. Um esquema assistencial, como o histórico de salbutamol na crise, exige escolha explícita de Urgência. O estado HIGH_RISK não ganha cópia por essa escolha. Nenhum módulo Sala Vermelha foi implementado.

## Navegação e Patologias

state.routeView guarda busca, filtro e medicamentos separadamente em cada rota. Cada medicamento mantém dados adulto/pediátrico separados. O peso global altera pesos apenas quando o usuário interage com esse campo, e serve como valor inicial nos contextos ainda não abertos.

Patologias usa REVIEW_PENDING, mantém definição, critérios, classificação, exames, tratamento, linhas/alternativas, urgência, alta, seguimento, sinais de alarme, vínculos e fontes. Campos vazios aparecem como Em revisão. A lista de medicamentos não vira protocolo; cópia combinada continua recusada, inclusive para pediatria ou objetos forjados. SOAP continua em branco. Etambutol permanece na fase intensiva RHZE.

## Limitações

- Os dados em revisão podem conter fontes antigas e precisam de auditoria individual. Confirmar cópia não valida dose nem indicação.
- Os registros genéricos não contêm dados suficientes para recuperar posologia; o estado INCOMPLETE decorre dessa ausência.
- A lista explícita de alto risco é uma fila de desenvolvimento conservadora, não uma declaração de equivalência entre contextos clínicos.
- Não há editor de dados clínicos persistidos neste projeto; o desenvolvimento continua no registro estruturado da fonte.
- Consultas de alta gravidade não substituem futuro módulo assistencial com preparo, titulação e monitorização.

## Verificação

- Testes regressivos primeiro falharam para estados ausentes, gate de revisão, cálculos pediátricos e lacunas estruturais; passaram após as correções.
- Revisão independente identificou quantidades históricas calculáveis que ainda aceitavam preenchimento arbitrário. Testes reproduziram e corrigiram omeprazol (28 unidades) e oseltamivir pediátrico (10 ou 20 cápsulas conforme a faixa); ondansetrona adulta ficou vinculada à dose única.
- npm run build e npm run export:standalone regeneram os dois artefatos.
- npm test: 33 testes aprovados. npm run test:ui: web e standalone em 390/1440 px, quatro cenários aprovados, incluindo clipboard nativo no Windows (normalização apenas de CRLF).
- Nenhuma validação médica nova é atribuída aos testes de software. Não foi feito merge nem deploy neste bloco.
