# GuildBook 6.3.1 — revisão de segurança

**Atualização — bloco 1:** o bloqueio global descrito abaixo é o estado histórico da primeira correção. A arquitetura atual preserva os quatro esquemas validados e recupera dados históricos estruturados como REVIEW_PENDING, com confirmação por cópia. Consulte [estados clínicos e limitações atuais](clinical-states-block1.md). Os documentos clínicos abaixo não foram revalidados neste bloco.

Revisão documental: 25/09/2026. Base preservada: 96adcbcf8a970723e6c99729af6e53ab095d2ee1. Fonte de verdade: web/index.html.

## Alcance real

- 322 cadastros e 49 patologias preservados. A contagem não equivale a medicamentos auditados.
- 2 medicamentos têm 4 esquemas adultos VALIDATED, restritos às indicações, apresentações e condições abaixo. Isso não valida todas as combinações dos dois medicamentos.
- 46 cadastros possuem algum esquema REVIEW_PENDING; 204 são INCOMPLETE e 70 HIGH_RISK. A classificação é por combinação; ter um esquema disponível não libera outras apresentações.
- Há 27 algoritmos pediátricos históricos disponíveis em revisão, condicionados à apresentação, idade, peso e contexto. Nenhum deles é declarado VALIDATED; protocolos integrais de patologias continuam sem cópia.
- 272 registros das expansões eram gerados por nome; a inferência continua removida. Os 50 registros iniciais preservam seu conteúdo explícito sem ganhar revisão clínica por isso.
- VALIDATED, REVIEW_PENDING, INCOMPLETE e HIGH_RISK distinguem validação de disponibilidade. Consulta a uma apresentação não habilita automaticamente a cópia.

## Esquemas documentados e habilitados

A cópia exige apresentação, indicação, adulto 18–64 anos, duração individual, quantidade compatível e avaliação registrada de contraindicações, interações, gestação/lactação, função renal/hepática e risco cardiovascular. Idosos, pediatria, gestação/lactação ou necessidade de ajuste ficam fora destes modelos. Não há duração numérica predefinida quando a bula não a define.

| Medicamento e apresentação | Indicações parametrizadas | Esquema | Fonte |
|---|---|---|---|
| Diclofenaco potássico 50 mg — comprimido revestido (Cataflam) | Dor inflamatória pós-traumática (entorse/distensão); Dor e inflamação pós-operatória | 50 mg (1 comprimido) a cada 12 h = 100 mg/dia. Bula: 100–150 mg/dia, em 2–3 tomadas; casos leves 75–100 mg/dia. 100 mg/dia neste esquema; faixa usual até 150 mg/dia. O teto de 200 mg/dia da dismenorreia não se aplica a esta indicação. | [Cataflam 50 mg comprimido revestido — bula profissional, Novartis (VPS13)](https://www.pro.novartis.com/br-pt/sites/pro_novartis_com_br/files/2026-01/Bula-CATAFLAM-Dragea-Medico.pdf), 2025; rev. 2026-09-25 |
| Diclofenaco potássico 50 mg — comprimido revestido (Cataflam) | Dor inflamatória pós-traumática (entorse/distensão); Dor e inflamação pós-operatória | 50 mg (1 comprimido) a cada 8 h = 150 mg/dia. Bula: 100–150 mg/dia, em 2–3 tomadas; casos leves 75–100 mg/dia. 150 mg/dia neste esquema; faixa usual até 150 mg/dia. O teto de 200 mg/dia da dismenorreia não se aplica a esta indicação. | [Cataflam 50 mg comprimido revestido — bula profissional, Novartis (VPS13)](https://www.pro.novartis.com/br-pt/sites/pro_novartis_com_br/files/2026-01/Bula-CATAFLAM-Dragea-Medico.pdf), 2025; rev. 2026-09-25 |
| Cetoprofeno 50 mg — cápsula dura (Sanofi Medley; não é lisinato) | Dor por entorse ou contusão; Lombalgia aguda; Dor pós-operatória | 50 mg (1 cápsula) a cada 8 h = 150 mg/dia. Bula: 50 mg 3 vezes/dia ou 100 mg 2 vezes/dia. 150 mg/dia neste esquema; máximo de bula 300 mg/dia não autoriza aumentar o esquema. | [Cetoprofeno 50 mg cápsula dura — bula profissional, Sanofi Medley (IB150725)](https://sm.far.br/assets/pdfs/bula_183260234_1053070250_1_p.pdf), 2025; rev. 2026-09-25 |
| Cetoprofeno 50 mg — cápsula dura (Sanofi Medley; não é lisinato) | Dor por entorse ou contusão; Lombalgia aguda; Dor pós-operatória | 100 mg (2 cápsulas) a cada 12 h = 200 mg/dia. Bula: 50 mg 3 vezes/dia ou 100 mg 2 vezes/dia. 200 mg/dia neste esquema; máximo de bula 300 mg/dia não autoriza aumentar o esquema. | [Cetoprofeno 50 mg cápsula dura — bula profissional, Sanofi Medley (IB150725)](https://sm.far.br/assets/pdfs/bula_183260234_1053070250_1_p.pdf), 2025; rev. 2026-09-25 |

As apresentações sódica oral, dismenorreia, tópicas e injetáveis têm doses numéricas de consulta com fonte e diferenças explícitas. Continuam bloqueadas onde área, titulação, intervalo, aplicação hospitalar ou atualidade regulatória não estão parametrizados. Fontes antigas são identificadas; não se extrapola concentração, sal ou liberação.

## Riscos e patologias

- Alteplase e cisatracúrio: não há comprimidos orais inferidos; via intravenosa documentada, receita bloqueada.
- Glargina/Lantus 100 U/mL: subcutânea, explicitamente proibida a administração EV; receita bloqueada.
- Demais insulinas, anticoagulantes, opioides, bloqueadores neuromusculares, sedativos, vasoativos, eletrólitos concentrados e antimicrobianos hospitalares: sem receitas genéricas; validação posológica individual ainda pendente.
- Adrenalina/epinefrina são sinônimos, com IDs históricos preservados e sem transferência automática de esquema. Outros vínculos: acetilcisteína/N-acetilcisteína, formoterol+budesonida/budesonida+formoterol, azitromicina/di-hidratada/suspensão (apresentações distintas exigem revisão).
- Tuberculose: 2RHZE/4RH no recorte adulto/adolescente ≥10 anos; etambutol na fase intensiva. Não extrapolar a TB resistente, formas especiais ou critérios pediátricos atualizados.
- Cetoacidose, PAC pediátrica, dengue, sífilis gestacional e AVC: notas específicas de revisão, sem protocolo completo nem cópia combinada. Anticoagulação e demais emergências permanecem em elaboração, sem uma ordem artificial de primeira/segunda linha.
- Prontuário: somente modelo em branco. Não declara orientação, exame ou reavaliação realizados.

## Expansão e corte histórico

| Lista | Incluídos | Duplicatas pela regra antiga | Excluídos pelo corte |
|---|---:|---:|---:|
| expansão anterior | 122 | 0 | 75 |
| v6.3 | 150 | 3 | 62 |

O código novo preserva nominalmente os 322 cadastros existentes e não usa uma meta numérica para escolher itens. Os candidatos ausentes ficam documentados para curadoria, sem inclusão automática de dados clínicos. A normalização de busca não remove sais. O JSON acompanha todas as decisões históricas. A coluna de presença usa a normalização histórica, e não afirma equivalência de apresentação.

### Nomes que ficaram de fora na v6.3 pelo corte

Motivo de cada nome abaixo: limite numérico antigo ao atingir 322; não foi encontrada justificativa clínica de exclusão.

- Estradiol + Noretisterona
- Progesterona micronizada
- Dinoprostone
- Carbetocina
- Terbutalina
- Betametasona
- Clotrimazol vaginal
- Terconazol
- Secuquinumabe
- Adalimumabe
- Etanercepte
- Infliximabe
- Rituximabe
- Tocilizumabe
- Abatacepte
- Ustequinumabe
- Golimumabe
- Certolizumabe pegol
- Tofacitinibe
- Baricitinibe
- Upadacitinibe
- Natalizumabe
- Fingolimode
- Glatirâmer
- Interferona beta-1a
- Dimetilfumarato
- Teriflunomida
- Eculizumabe
- Alfaepoetina
- Darbepoetina alfa
- Somatropina
- Teriparatida
- Denosumabe
- Zoledronato
- Calcitonina
- Alfacalcidol
- Paricalcitol
- Lanthanum carbonate
- Ivabradina
- Sacubitril + Valsartana
- Empagliflozina + Metformina
- Dapagliflozina + Metformina
- Valsartana
- Telmisartana
- Olmesartana
- Ramipril
- Lisinopril
- Perindopril
- Felodipino
- Isradipino
- Eplerenona
- Amilorida
- Acetazolamida
- Bumetanida
- Torsemida
- Ticagrelor
- Prasugrel
- Cilostazol
- Tenecteplase
- Protamina
- Idarucizumabe
- Andexanet alfa

### Duplicatas descartadas na lista v6.3

- Tartarato de metoprolol — Duplicata pela normalização antiga (que também removia sais); verificar formulação antes de consolidar.
- Aztreonam — Duplicata pela normalização antiga (que também removia sais); verificar formulação antes de consolidar.
- Alteplase — Duplicata pela normalização antiga (que também removia sais); verificar formulação antes de consolidar.

A regra antiga descartou Tartarato de metoprolol ao remover o sal e compará-lo ao Succinato de metoprolol. Isso não prova equivalência terapêutica; formulações devem ser cadastradas separadamente após revisão.

### Corte da expansão anterior

- Colchicina — posteriormente presente na v6.3 pela chave histórica.
- Alopurinol — continua ausente do catálogo preservado.
- Ciclobenzaprina — continua ausente do catálogo preservado.
- Baclofeno — continua ausente do catálogo preservado.
- Tramadol — continua ausente do catálogo preservado.
- Codeína — continua ausente do catálogo preservado.
- Codeína + Paracetamol — continua ausente do catálogo preservado.
- Morfina — continua ausente do catálogo preservado.
- Fentanila — continua ausente do catálogo preservado.
- Metadona — continua ausente do catálogo preservado.
- Petidina — continua ausente do catálogo preservado.
- Cetamina — continua ausente do catálogo preservado.
- Etomidato — continua ausente do catálogo preservado.
- Propofol — continua ausente do catálogo preservado.
- Rocurônio — continua ausente do catálogo preservado.
- Succinilcolina — continua ausente do catálogo preservado.
- Diazepam — continua ausente do catálogo preservado.
- Clonazepam — continua ausente do catálogo preservado.
- Midazolam — posteriormente presente na v6.3 pela chave histórica.
- Lorazepam — continua ausente do catálogo preservado.
- Fenobarbital — continua ausente do catálogo preservado.
- Fenitoína — posteriormente presente na v6.3 pela chave histórica.
- Carbamazepina — continua ausente do catálogo preservado.
- Ácido valproico — continua ausente do catálogo preservado.
- Lamotrigina — continua ausente do catálogo preservado.
- Gabapentina — continua ausente do catálogo preservado.
- Pregabalina — continua ausente do catálogo preservado.
- Topiramato — continua ausente do catálogo preservado.
- Levetiracetam — continua ausente do catálogo preservado.
- Levodopa + Benserazida — continua ausente do catálogo preservado.
- Biperideno — continua ausente do catálogo preservado.
- Haloperidol — posteriormente presente na v6.3 pela chave histórica.
- Decanoato de haloperidol — continua ausente do catálogo preservado.
- Clorpromazina — continua ausente do catálogo preservado.
- Levomepromazina — continua ausente do catálogo preservado.
- Risperidona — continua ausente do catálogo preservado.
- Quetiapina — continua ausente do catálogo preservado.
- Olanzapina — continua ausente do catálogo preservado.
- Carbonato de lítio — continua ausente do catálogo preservado.
- Amitriptilina — continua ausente do catálogo preservado.
- Nortriptilina — continua ausente do catálogo preservado.
- Clomipramina — continua ausente do catálogo preservado.
- Fluoxetina — posteriormente presente na v6.3 pela chave histórica.
- Sertralina — posteriormente presente na v6.3 pela chave histórica.
- Escitalopram — posteriormente presente na v6.3 pela chave histórica.
- Citalopram — continua ausente do catálogo preservado.
- Paroxetina — continua ausente do catálogo preservado.
- Venlafaxina — continua ausente do catálogo preservado.
- Duloxetina — continua ausente do catálogo preservado.
- Bupropiona — continua ausente do catálogo preservado.
- Trazodona — continua ausente do catálogo preservado.
- Ocitocina — continua ausente do catálogo preservado.
- Misoprostol — continua ausente do catálogo preservado.
- Metilergometrina — continua ausente do catálogo preservado.
- Noretisterona + Estradiol — continua ausente do catálogo preservado.
- Levonorgestrel — continua ausente do catálogo preservado.
- Etinilestradiol + Levonorgestrel — continua ausente do catálogo preservado.
- Medroxiprogesterona — continua ausente do catálogo preservado.
- Tansulosina — continua ausente do catálogo preservado.
- Doxazosina — continua ausente do catálogo preservado.
- Finasterida — continua ausente do catálogo preservado.
- Tiamina — continua ausente do catálogo preservado.
- Complexo B — continua ausente do catálogo preservado.
- Piridoxina — continua ausente do catálogo preservado.
- Ácido ascórbico — continua ausente do catálogo preservado.
- Sulfato ferroso — posteriormente presente na v6.3 pela chave histórica.
- Ácido fólico — continua ausente do catálogo preservado.
- Carbonato de cálcio + Colecalciferol — continua ausente do catálogo preservado.
- Eritropoietina — continua ausente do catálogo preservado.
- Tobramicina colírio — continua ausente do catálogo preservado.
- Ciprofloxacino colírio/otológico — continua ausente do catálogo preservado.
- Timolol colírio — continua ausente do catálogo preservado.
- Dexametasona colírio — continua ausente do catálogo preservado.
- Nitrato de prata colírio — continua ausente do catálogo preservado.
- Cerumin — continua ausente do catálogo preservado.

## Fontes documentais registradas

- [Cataflam 50 mg comprimido revestido — bula profissional, Novartis (VPS13)](https://www.pro.novartis.com/br-pt/sites/pro_novartis_com_br/files/2026-01/Bula-CATAFLAM-Dragea-Medico.pdf) — 2025; revisão 2026-09-25. 1, 4–6 e 8; aprovação Anvisa 21/10/2025.
- [Cetoprofeno 50 mg cápsula dura — bula profissional, Sanofi Medley (IB150725)](https://sm.far.br/assets/pdfs/bula_183260234_1053070250_1_p.pdf) — 2025; revisão 2026-09-25. 1, 4–6 e 8; bula padrão Anvisa 15/07/2025.
- [Profenid — bulas profissionais por formulação, Sanofi Medley](https://sm.far.br/assets/pdfs/bula_183260360_1412923255_2_p.pdf) — 2025; revisão 2026-09-25. Seção 8 de cada formulação; IM não intercambiável com IV.
- [Diclofenaco dietilamônio 11,6 mg/g — bula profissional, Medley](https://sm.far.br/assets/pdfs/bula_183260142_1153077256_1_p.pdf) — 2018; revisão 2026-09-25. 1, 4–6 e 8; texto antigo disponível no fabricante, somente consulta.
- [Diclofenaco sódico 25 mg/mL — bula profissional, União Química](https://www.uniaoquimica.com.br/wp-content/uploads/2020/01/bula-DICLOFENACO-PROFISSIONAL.pdf) — 2022; revisão 2026-09-25. 1, 4–6 e 8; uso exclusivamente IM deste produto.
- [Diclofenaco sódico — bula profissional, Medley](https://sm.far.br/assets/pdfs/bula_183260072_0793908264_1_p.pdf) — 2026; revisão 2026-09-25. 1, 4–6 e 8.
- [Cetoprofeno gel 25 mg/g — bula profissional, Teuto (PDF original espelhado)](https://uploads.consultaremedios.com.br/drug_leaflet/pro/Bula-Cetoprofeno-Gel-Teuto-Profissional-Consulta-Remedios.pdf) — 2022; revisão 2026-09-25. 1, 4–6 e 8; atualidade regulatória pendente, cópia bloqueada.
- [CIS (besilato de cisatracúrio) — bula profissional, Cristália](https://www.cristalia.com.br/produto/65/bula-profissional) — ano não identificado; revisão 2026-09-25. Identificação e via; posologia não validada no aplicativo.
- [Lantus (insulina glargina 100 U/mL) — bula profissional, Sanofi](https://sm.far.br/assets/pdfs/bula_183260348_0833965255_1_p.pdf) — 2019; revisão 2026-09-25. 8; arquivo com texto IB100619A (2019), apenas via conferida, esquema individual bloqueado.
- [PCDT resumido — Acidente Vascular Cerebral Isquêmico Agudo, Ministério da Saúde](https://www.gov.br/conitec/pt-br/midias/protocolos/resumidos/pcdt-resumido-avc.pdf) — 2023; revisão 2026-09-25. Trombólise IV; não é receita ambulatorial.
- [Cetoprofeno IV 100 mg — bula profissional Eurofarma (VPS V9)](https://eurofarma.com.br/produtos/bulas/healthcare/pt/bula-cetoprofeno-iv.pdf) — 2022; revisão 2026-09-25. 8, página 9/13; bula padrão 02/09/2022, somente consulta hospitalar.

## Verificação e publicação

- Build: node scripts/build.mjs. Exportação: node scripts/export-standalone.mjs. Ambos usam web/index.html.
- Testes: npm test; npm run test:ui (Chromium, 390 e 1440 px, web e standalone). CI executa ambos e confere que os artefatos estão sincronizados.
- A execução inicial no Windows restrito precisou de --test-isolation=none. Posteriormente npm test e npm run test:ui foram executados com autorização para subprocessos; os resultados do bloco 1 constam da entrega e de clinical-states-block1.md. Dados de teste são sintéticos.
- GitHub Pages publica a pasta web somente após atualização de main. Branch/PR não representa publicação no site. Verificação final do endereço e versão publicada consta da entrega.
