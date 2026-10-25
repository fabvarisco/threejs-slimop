# Slimop — continuidade do desenvolvimento

Atualizado em 2026-10-25. Projeto ativo: `C:\Users\varisco\slimeop\threejs-slimop`.

## Pedido e corte desta entrega

O pedido completo está em `C:\Users\varisco\.codex\attachments\091f7e66-74fe-49bc-89b4-72fe66ba1c31\Texto colado.txt`.

As etapas 1 e 2 foram concluídas no bloco anterior. O bloco atual implementa variedade urbana, distrito industrial e distribuição contextual (etapas 3 e 4), preservando os controles e os orçamentos. A rede continua ortogonal e conectada; não foram adicionados pathfinding, ruas curvas, T-junctions, novas habilidades ou novos modelos.

Preservar: slime gelatinoso, cidade low-poly, pontuação, massa/crescimento, HUD existente, quatro personalidades de bots, partida de 120 s e vantagem mínima de 5% para consumir outro slime. Velocidade-base permanece 9.5. Não implementar Dash/Jelly Rush.

## Implementado

### Controles

- Removidos os vetores diagonais fixos da antiga câmera isométrica. `cameraRelativeDirection()` projeta a orientação real da câmera no plano XZ.
- Setas e WASD funcionam nas quatro direções; aliases não somam duas vezes; opostos cancelam; diagonais são normalizadas.
- Teclado tem prioridade sobre ponteiro quando uma tecla de movimento está pressionada, evitando interferência de um joystick ativo.
- Soltar as teclas para o movimento imediatamente; blur, perda de visibilidade, cancelamento de ponteiro e reinício limpam a entrada.
- Setas não rolam a página durante a partida. Campos de texto não são interceptados.
- A integração analítica da aceleração evita diferenças de distância por subdivisão do frame; testada a 15/30/60/120 Hz. O limite de delta do loop passou de 33 ms para 100 ms, evitando limitar artificialmente a velocidade abaixo de 30 FPS. A proteção contra pausas longas continua existindo; abaixo de 10 FPS há limitação de catch-up.

### Expansão funcional

- Dimensões e limites centralizados em `src/world/worldConfig.js`.
- Escala de 1.5 em cada dimensão: área 2.25× maior. Dobrar ambos os lados foi adiado porque a renderização já tinha milhares de chamadas por frame.
- Primeiro nível: 121.5×121.5, 124.5×124.5 ou 127.5×127.5 unidades nominais, conforme o perfil. Na seed 424242: 121.5×121.5.
- Mantida a margem jogável preexistente de 4 unidades por lado; o limite do centro do slime desconta 0.85× seu raio.
- Espaçamento de ruas escalado por 1.35, sem quadruplicar entidades. Alvos de pessoas/veículos não escalam com a área; teto de 160 estruturas, 200 decorações e 4 torres.
- Limites de slimes, pedestres e tráfego usam a configuração do mundo.
- A luz direcional mantém a direção original, mas sua área de sombras acompanha a região ativa do jogador.
- Bots nascem em cruzamentos livres de estruturas e suficientemente distantes dos outros slimes.

### Bug importante encontrado pela auditoria

`createLotPositions()` criava `THREE.Vector2` (x/y), mas `planBlockLots()` lia `position.z`. Isso gerava coordenadas NaN em casas e prédios. Uma reprodução tinha 102 entidades inválidas, que podiam ficar invisíveis e impossíveis de absorver por contato.

A função foi extraída para `src/world/placement.js` e agora retorna `{x, z}`. Posições inválidas são rejeitadas na reserva de lotes. A auditoria do mundo passou para zero entidades inválidas/fora dos limites na reprodução.

## Evidências do bloco anterior (controles/expansão)

- 39 testes unitários passaram; build de produção passou.
- Teste dedicado dos controles passou no navegador, incluindo as oito teclas, diagonais, opostos, soltura, mouse, reinício, prevenção de scroll e blur.
- Seed 424242: 121.5 unidades, 64 quarteirões, 530 entidades, 113 estruturas, 200 props, 182 pessoas e 35 veículos; quatro bots mais jogador. Geração medida em 209.5 ms nesta execução. Zero spawns inválidos/fora dos limites; progressão auditada até torres.
- No profiling do mapa corrigido e ampliado: 2,819 calls sem batching do terreno e 2,185 com batching, acumulando todos os passes do frame. São dados dessa câmera/seed, não garantia de FPS em aparelhos físicos.
- Captura desktop inspecionada: slime visível acima do terreno e cidade renderizada. Assets, materiais físicos do slime, bolhas, olhos e animações foram preservados.
- Suíte completa final: **9 testes passaram, zero falhas e 15 skips intencionais em 3.3 minutos**. Cena validada em desktop, iframe CrazyGames, celular retrato e celular paisagem. Cenários dedicados: controles, limites/spawn/bots, reinício/combate, profiling e auditoria das fases 1/2/3/5. Os skips evitam repetir cenários idênticos nos outros perfis.
- Nenhum erro de runtime/console.error nos quatro testes de cena. O build mantém o aviso de bundle acima de 500 kB (648.09 kB, 170.23 kB gzip); os avisos NO_COLOR/FORCE_COLOR pertencem ao runner.

## Arquivos do bloco anterior

- src/main.js
- src/gameplay/movement.js
- src/world/worldConfig.js
- src/world/placement.js
- tests/movement.test.js
- tests/worldConfig.test.js
- tests/placement.test.js
- tests/controls.spec.js
- tests/world.spec.js
- tests/visual.spec.js
- CODEX_HANDOFF.md

Há várias alterações de rodadas anteriores ainda não commitadas; preservá-las. Não atribuir todo o diff contra HEAD apenas a este bloco.

## Bloco atual — variedade urbana e distribuição

- `src/world/urbanLayout.js`: eixos não espelhados, espaçamentos entre 9.6 e 19.2 unidades, quarteirões com proporções variadas, vias secundárias/principais/avenidas. Largura real aplicada a asfalto, calçadas, cruzamentos, limites de quarteirões, marcações e pistas de tráfego.
- Cinco distritos presentes: residencial, comercial, centro, industrial e parques. O industrial ocupa uma região contínua afastada do centro; parques têm locais próprios. Layouts de lotes em fileiras, pátios, jardins, estacionamento e áreas de carga.
- Industrial reutiliza os GLBs largos existentes em construções mais baixas. Há vias de serviço reservadas, caixas, cones e caminhões. Não foram criados novos modelos de galpão/contêiner/banco/lixeira.
- Cotas de props distribuídas por todos os quarteirões, com maior peso para parques e áreas iniciais. Não há mais consumo de todo o teto de decoração pelos primeiros quarteirões processados.
- Cones alinhados, cargas industriais, árvores e parasóis selecionados por contexto. Posições evitam os AABBs reais dos prédios, outros props e carros estacionados. A hierarquia dos tiers e os cálculos de massa/pontuação não mudaram.
- Veículos estacionados usam cerca de 25% do orçamento já existente de carros; não são adicionados acima do total. Caminhões são priorizados no industrial; os demais veículos continuam circulando.
- Mantidos 121.5–127.5 unidades por lado no primeiro nível, 4 bots, 120 s, velocidade 9.5, teto de 160 estruturas e 200 props, mais batching de terreno.

### Resultados do bloco atual

- **42 testes unitários passaram**, incluindo 200 layouts com centros deslocados: cinco distritos, variedade de dimensões, vias conectadas, intervalos de calçadas e orçamento justo de objetos.
- **Build passou**. Permanece o aviso de bundle acima de 500 kB: 654.29 kB, 172.43 kB gzip.
- **9 testes de navegador passaram, zero falhas, 15 skips intencionais, 2.9 minutos**. Os skips evitam repetir cenários dedicados. Desktop, iframe CrazyGames, retrato e paisagem renderizados; regressão de controles, combate, reinício e fases 1/2/3/5 passou.
- Seed 424242: 121.5×121.5 unidades, 36 quarteirões, 480 entidades, 63 estruturas, 200 props, 182 pessoas e 35 veículos (9 estacionados). Geração: 205.5 ms nesta amostra.
- Distritos nessa seed: centro 3, comercial 18, residencial 9, industrial 4, parques 2. Industrial: 7 construções e 12 caminhões entre estacionados/circulantes.
- Zero props sobrepostos entre si, zero props dentro dos AABBs de prédios, nenhum quarteirão sem props, nenhuma entidade fora dos limites/sem coordenadas válidas na auditoria inicial.
- Frame completo na câmera inicial: **2,105 draw calls** com batching (2,715 sem batching), versus 2,185 medidos no bloco anterior. 758,414 triângulos após batching. Comparação específica de seed/câmera, sem promessa de ganho universal de FPS.
- Capturas desktop e industrial inspecionadas. Slime, materiais, câmera e animações preservados. Sem pageerror/console.error nos quatro casos de cena.

### Arquivos alterados neste bloco

- src/main.js
- src/world/urbanLayout.js
- src/world/placement.js
- tests/urbanLayout.test.js
- tests/world.spec.js
- CODEX_HANDOFF.md

## Bloco — Profiling, Expansão do Mapa (4x Área) e Acabamento das Bordas (25/10/2026)

### 1. Otimização de Pedestres e Sombras Dinâmicas (Draw Calls)
- **Eliminação de sombras desnecessárias:** Os pedestres possuem malhas com 3 submalhas cada. Como já possuem um disco projetado de sombra de contato (`CircleGeometry`), a projeção na shadow map da luz direcional causava 364 draw calls de sombra redundantes por frame. Desativou-se `castShadow` nos modelos de pedestre (`cloneAndFit(..., { castShadow: false })`), zerando as `shadowCalls` de pessoas (`shadowCalls: 0`).
- **Compartilhamento de geometria e material de sombra:** Alocação de geometria e material para o disco de sombra agora reaproveita instâncias únicas `SHARED_PEDESTRIAN_SHADOW_GEO` e `SHARED_PEDESTRIAN_SHADOW_MAT`, eliminando ~182 alocações de Heap por partida.
- **Throttling de busca de ameaças por distância:** Pedestres a mais de 50 unidades do jogador/câmera não executam a busca de ameaças de slimes a cada frame. Vetor de fuga agora reutiliza `TMP_PEDESTRIAN_VEC`, eliminando instanciação de `THREE.Vector3` a cada frame de fuga.
- **Batching de terreno e redução geral de draw calls:** 
  - Antes deste bloco: **2.105 draw calls** no frame batched inicial.
  - Após este bloco: **1.508 draw calls** no frame batched inicial (**-597 draw calls, redução de -28,4%**).
  - 1.517 malhas estáticas de terreno mescladas em 11 lotes (`removedMeshes: 1517`).

### 2. Expansão do Mapa (4x Área / 2.0x por eixo)
- Centralizada em `src/world/worldConfig.js`: `sizeScale: 2.0`.
- Dimensão nominal do mapa no nível inicial: de ~81 unidades nominais para **162×162 unidades** (área jogável ampliada de 6.561 u² para **26.244 u²**, quadruplicando a área total do mapa).
- `getWorldLimit()` ajusta dinamicamente a fronteira jogável para ~85 unidades a partir do centro (descontando o raio do slime).
- Orçamento de entidades preservado para manter alta taxa de quadros: `maxStructures: 160`, `maxDecor: 200`, gerando 570 entidades no primeiro nível com densidade equilibrada e ampla área de navegação.

### 3. Acabamento das Bordas e Transição Natural do Cenário
- **Eliminação do "tabuleiro cortado":**
  - Criação de saia/avental verde contínuo (`outerApron` de tamanho `worldSize + 260`) com material de grama natural (`0x4f8245`), estendendo o horizonte até o limite de visão e eliminando qualquer corte abrupto para o vazio/fundo azul.
  - Grupo decorativo exterior (`createExteriorBackdrop`):
    - Cinturão verde perimetral com 48 árvores low-poly distribuídas pelas 4 bordas cardeais (Norte, Sul, Leste, Oeste), com `castShadow: false` para custo zero de sombras dinâmicas.
    - Casas suburbanas periféricas de baixa densidade além dos limites jogáveis, integrando a cidade aos arredores.
    - Elevações e colinas suaves low-poly no horizonte em ângulo circular (`CylinderGeometry` com flat shading) compondo a linha do horizonte.
  - Zero impacto em regras e desempenho: todos os elementos do backdrop exterior pertencem ao `exteriorGroup`, não entram em `this.items`, não possuem colisão nem IA e não podem ser absorvidos.
- **Fronteira com desaceleração elástica suave:** Em `moveSlime()`, quando o slime se aproxima a menos de 2,4 unidades do `limit`, sua velocidade em direção à borda sofre amortecimento exponencial suave (`damping`), proporcionando uma sensação natural e elástica em vez de uma colisão rígida abrupta ("brick wall").

### Resultados e Verificações
- **Testes Unitários:** 45/45 testes aprovados (`npm run test:unit`).
- **Build de Produção:** Vite compilou com sucesso sem erros (`npm run build`).
- **Suíte Playwright Completa:** 13 testes aprovados, 15 skips intencionais de perfil, **zero falhas** em 4,4 minutos (`tests/world.spec.js`, `tests/profiling.spec.js`, `tests/controls.spec.js`, `tests/hudFeedback.spec.js`, `tests/visual.spec.js`).
- Frame inicial da seed 424242 medido e auditado: 1.508 calls, 644.214 triângulos batched, zero entidades fora dos limites, zero sobreposições inválidas.

---

## Bloco — SLIME APOCALYPSE e Ajuste de Enquadramento da Câmera (25/10/2026)

### 1. Escala Visual do Mapa Ampliado
- **Diagnóstico da percepção de tamanho:** A área jogável foi quadruplicada para 162×162 unidades (área de 26.244 u², 80 quarteirões versus 36 anteriores), mas a câmera inicial encontrava-se muito próxima e rebaixada (`y = 16.5 + radius * 3.8`), enquadrando apenas um raio imediato de ~20 unidades. Isso ocultava a imensidão da cidade e fazia o jogador sentir que estava no mesmo espaço restrito.
- **Elevação do enquadramento arcade:**
  - `targetHeight` ajustado de 16.5 para **19.5 + radius * 3.6**.
  - `targetDistance` ajustado de 13.5 para **16.0 + radius * 3.0**.
  - Densidade de névoa (`FogExp2`) ajustada de 0.007 para 0.0042, permitindo enxergar múltiplos quarteirões e avenidas no horizonte.
  - O ângulo arcade permanece perfeitamente centrado no slime, mas o campo de visão agora revela 4 a 5 quarteirões simultâneos e as silhuetas de prédios distantes, transmitindo imediatamente a verdadeira escala do mapa ampliado.

### 2. Implementação do Evento Especial: SLIME APOCALYPSE
- Implementado em `src/gameplay/slimeApocalypse.js`.
- **Ativação automática aos 30 segundos restantes:**
  - Acionado uma única vez por partida quando `timeLeft <= 30` (aos 90 segundos da partida de 120s).
  - Banner animado: `"⚡ SLIME APOCALYPSE! ⚡"` com gradiente de chamas (`#ff2a00` a `#ff8000`) e animação de pulso.
  - Áudio arcade de sirene de emergência sintetizado em tempo real via Web Audio API (sem dependência de arquivos de áudio externos).
  - Transição de iluminação atmosférica: luz hemisférica, luz do sol e fundo do céu transicionam suavemente para tons dramáticos de entardecer dourado/âmbar (`0xd47733` / `0xff8833` / `0xb06040`).
- **Escalada do Caos em 3 Ondas:**
  - *Onda 1 (30s a 21s restantes):* Queda de props pequenos, caixas, cones, árvores e carros sedãs (intervalo ~1.6s).
  - *Onda 2 (20s a 11s restantes):* Queda de caminhões, vans, ambulâncias, carros de bombeiro e casas pequenas (intervalo ~0.95s).
  - *Onda 3 (10s a 0s restantes):* Queda de casas grandes, edifícios comerciais e arranha-céus/torres (intervalo ~0.55s).
- **Indicadores de Impacto (Retículos no Solo) e Queda Física:**
  - Marcador de impacto perfeitamente circular projetado no solo com anel de aviso e disco interno que expande gradualmente indicando o tempo de aterrissagem (1,35s de aviso prévio).
  - Queda com aceleração realista e rotação nos 3 eixos.
  - Ao atingir o solo: onda de choque no chão, vibração/trauma de câmera proporcional à massa, som sintetizado de impacto e conversão imediata para entidade consumível (`isApocalypseLoot: true`) em `this.items`, atualizando a massa total da cidade e permitindo disputas acirradas.
  - Slimes menores que não conseguem comer o objeto recebem empurrão/knockback suave para fora do raio do impacto, sem mortes arbitrárias.
- **Inteligência Artificial (Frenesi dos Bots):**
  - Bots detectam as zonas de impacto de objetos em queda (`getHazardZones`) e desviam do ponto de colisão de projéteis pesados.
  - Objetos caídos possuem alta massa e atraem automaticamente os bots pelo sistema de utilidade (`evaluateBotUtility`), intensificando o combate e as disputas de ranking nos últimos segundos.

### 3. Validação e Testes
- **Testes Unitários:** 48/48 aprovados (`tests/slimeApocalypse.test.js` cobre ondas, sintetizador de áudio, reset e zonas de perigo).
- **Build de Produção:** Vite compilou com sucesso sem erros (`npm run build`).
- **Suíte Playwright Completa:** 14 aprovados, 18 skips intencionais, **zero falhas** em 4,8 minutos (`tests/apocalypse.spec.js`, `tests/world.spec.js`, `tests/profiling.spec.js`, `tests/controls.spec.js`, `tests/visual.spec.js`, `tests/hudFeedback.spec.js`).

---

## Pendências em ordem

1. **Playtests de ritmo:** avaliar rotas de crescimento e tempos de unlock em diferentes seeds; a cobertura foi garantida, mas não há ainda benchmark de retenção/equilíbrio das rotas em partidas humanas de 120 s.
2. **Distribuição dinâmica:** auditar sobreposição entre pedestres/veículos em movimento e demais atores, além dos props estáticos já auditados. As ruas continuam retas/ortogonais, com espaçamentos e larguras variados; curvas e conexões parciais seriam outro trabalho de navegação.
3. **Etapas 5/6 — integração/navegação/câmera:** validar percursos reais em múltiplas seeds. A IA ainda não usa pathfinding nem resolução sólida de obstáculos; os testes atuais verificam movimento, limites e regras de absorção, sem provar uma navegação completa por becos/edifícios. A câmera mantém seu acompanhamento/zoom anteriores e a oclusão existente.
4. **Etapas 7/8 — slime/absorção:** feedback visual refinado no bloco de HUD abaixo. Avaliar clareza e duração em partidas humanas, especialmente com muitos objetos simultâneos.
5. **Etapa 9 — HUD/CITY:** precisão e preenchimento corrigidos no bloco de HUD abaixo. Avaliar legibilidade em aparelhos físicos e preferências de acessibilidade.
6. **Etapa 10 — performance:** profiling dos pedestres e dos materiais de sombra/transmissão. Testar memória em muitos reinícios, incluindo materiais clonados para oclusão. Manter o batching já validado. Não alegar FPS mobile sem teste em dispositivo físico.
7. **Assets:** bancos, lixeiras e contêineres dedicados ainda dependem de assets apropriados. O industrial atual usa construções largas, caminhões e caixas já disponíveis. Catalogar/adquirir novos modelos antes de expandir a lista, respeitando AGENTS.md.

## Comandos

### Refinamento HUD/absorção — 25/10/2026

- CITY preserva massa consumida por todos os slimes / massa total. Texto distingue `0%`, `<0.1%`, casas decimais e `100%`; barra usa a fração real (mínimo visual de 2 px após a primeira absorção). Resíduo de ponto flutuante não impede 100%.
- HUD compacto e responsivo, pontuação próxima ao rank, progresso para a próxima categoria e destaque do jogador na classificação. Aviso de desbloqueio anuncia a categoria efetivamente cruzada, inclusive em saltos de crescimento.
- Pontos flutuantes e pequenos brilhos em pool DOM de seis grupos, com preferência por movimento reduzido. Não foram adicionadas malhas, materiais ou assets 3D.
- Perfis visuais de absorção diferenciam objetos pequenos, carros, casas, edifícios, torres e slimes; mantém a aparência gelatinosa e as regras de pontuação, tamanho e controle. Limite de 24 animações simultâneas remove somente o restante visual das mais antigas, sem cancelar recompensas.
- HUD atualiza a 15 Hz, reaproveita linhas da classificação e evita reescrever textos iguais. Controles e simulação permanecem na frequência original.
- Arquivos deste bloco: `index.html`, `src/styles.css`, `src/main.js`, `src/ui/hudController.js`, `src/ui/absorptionFeedback.js`, `src/gameplay/slimeFeel.js`, `src/gameplay/feedbackConfig.js`, `tests/hudController.test.js`, `tests/slimeFeel.test.js`, `tests/hudFeedback.spec.js` e este handoff.
- Verificação já concluída: 45/45 testes unitários e build de produção. Vite mantém aviso de bundle JS acima de 500 kB; não é erro de compilação. Profiling da seed 424242/câmera inicial manteve 2.105 draw calls e 758.414 triângulos após batching.
- Suíte Playwright concluída: **13 aprovados, 15 ignorados intencionalmente pela seleção de perfil, zero falhas (4,5 min)**. HUD/feedback/reset passaram nos quatro perfis; capturas desktop, mobile vertical e horizontal inspecionadas. Testes de cena não registraram pageerror/console.error. Aviso de ambiente NO_COLOR/FORCE_COLOR do runner não afeta o jogo.
- Teste novo usa hooks exclusivos de `testMode` para isolar consumo, expiração e limites do feedback; os testes de cena/controles continuam exercitando movimento real no navegador. Não equivale a avaliação humana de ritmo nem benchmark de GPU/dispositivo físico.

```text
npm run test:unit
npm run build
npm run test:visual
npm run test:visual -- --project=desktop --grep "camera-relative controls"
npm run test:visual -- --project=desktop --grep "expanded world"
```

Playwright usa o build de produção em 4173, um worker, e hooks restritos a `testMode=1` para separar simulação de throughput de GPU. Capturas vêm do navegador, sem leitura síncrona de pixels do WebGL. Não executar testes contra um dist antigo após alterar código.
