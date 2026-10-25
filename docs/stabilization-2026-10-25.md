# Slimop — estabilização da versão atual

## Correções

- Partida restaurada para 120 segundos; velocidade-base preservada em 9.5.
- Consumo entre slimes exige vantagem de raio de 5%.
- Ranking, posição no HUD e resultados compartilham a ordenação por pontuação. Massa continua determinando tamanho e capacidade de absorção. Competidores eliminados mantêm seus pontos no resultado.
- Reinício limpa matchFinished, estado do HUD, teclado, ponteiro, joystick e referências de oclusão da cidade anterior.
- Resultados por tempo, cidade consumida e eliminação usam o mesmo fluxo, incluindo posição, massa e pontos.
- Consumo duplicado de entidades e uso de slimes já eliminados na mesma resolução de combate são impedidos.
- Proteção inicial é aplicada à caça e ao combate com o jogador, além da comida da região inicial.
- HUD usa os tempos centralizados, recebe delta real e anuncia a categoria recém-liberada.
- Bots mantêm quatro personalidades, avaliam no seu reactionDelay, preservam intenção por um intervalo mínimo e podem interromper a coleta para fugir. O tempo restante aumenta a prioridade de caça no fim da partida.
- Debug registra personalidade, intenção, número de avaliações/mudanças de intenção e métricas básicas de renderização.

## Desempenho e testes

A auditoria completa de progressão saiu do caminho normal do HUD: agora roda somente em testMode e no máximo a cada 250 ms. Decisões da IA deixam de alocar e percorrer toda a cidade em cada frame. Não foi implementada grade espacial, instancing ou outra reestruturação grande.

O Playwright serve o build de produção, usa um worker e não reutiliza servidor antigo. A captura usa o compositor do navegador, com o loop pausado por um hook exclusivo de teste. A leitura de pixels WebGL e preserveDrawingBuffer foram removidos. Os cenários de movimento usam eventos de teclado e avançam a simulação em passos controlados, separados da velocidade da GPU do navegador de testes.

Isso verifica renderização e lógica, mas não constitui um benchmark de FPS. Na reprodução móvel anterior à separação, foram registrados 1.489 draw calls, 492.984 triângulos e cerca de 49 ms na média suavizada de processamento/submissão de frame. O tempo de GPU não foi medido isoladamente. A carga gráfica merece profiling em hardware real antes de otimizações maiores.

## Evidências finais

- Testes unitários: 28 passaram, zero falhas.
- Build de produção: concluído com exit code 0; aviso de bundle JavaScript acima de 500 kB (aproximadamente 639 kB, 167 kB gzip).
- git diff --check: sem erros de whitespace; Git informou apenas normalização futura LF/CRLF em arquivos já modificados.
- Capturas de desktop e celular inspecionadas: cidade renderizada, slime gelatinoso visível e HUD preservado.
- Suíte visual contra o build final: 6 testes passaram, zero falhas, 6 skips intencionais; duração total de 5,2 minutos. Renderização, tráfego, pedestres, entrada por teclado, posição vertical e consumo de todos os tiers foram exercitados em desktop, iframe CrazyGames, celular retrato e celular paisagem.
- Reinício/combate executados uma vez no desktop: dois ciclos por tempo, reset de score/HUD, proteção inicial, limiares de 4% e 6%, consumo de rival, derrota do jogador e reinício após derrota. Auditoria de fases 1, 2, 3 e 5 executada uma vez no perfil iframe. Os skips evitam repetir esses mesmos cenários nos demais perfis.
- Nenhum pageerror ou console.error foi registrado nos quatro casos de cena. A suíte usa simulação em passos controlados para as regras de movimento e absorção; não mede fluidez de gameplay em tempo real.

## Arquivos alterados nesta estabilização

- src/main.js
- src/gameConfig.js
- src/mechanics.js
- src/ai/utilityAi.js
- src/ui/hudController.js
- playwright.config.js
- tests/gameConfig.test.js
- tests/mechanics.test.js
- tests/hudController.test.js
- tests/utilityAi.test.js
- tests/visual.spec.js
- docs/stabilization-2026-10-25.md

As demais alterações existentes no repositório são anteriores a esta rodada. Não foram adicionados modos, regiões, Dash ou Jelly Rush.

## Limitações e próximas verificações

- Playtest de toque e FPS em celulares físicos Android/iOS.
- Perfil de GPU, draw calls, sombras e materiais translúcidos em dispositivos-alvo.
- Sessão prolongada para verificar memória e recursos de GPU após muitos reinícios.
- Percurso manual por obstáculos e bordas do mapa; as verificações automáticas não equivalem a percorrer fisicamente todos os prédios e carros.
- Testes reais do SDK no ambiente da CrazyGames: a suíte usa um stub dos eventos da plataforma.

O próximo trabalho recomendado é medir a carga gráfica em dispositivos-alvo e reduzir os draw calls conforme o perfil encontrado, antes de expandir conteúdo.
