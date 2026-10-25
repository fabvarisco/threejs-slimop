# Profiling e redução de draw calls

## Método

Build de produção, Chromium desktop em 1366×768, seed 424242. O teste congela a simulação e mede antes/depois na mesma cena e câmera, sem mover entidades ou recriar o mapa entre amostras. `renderer.info.autoReset = false` contabiliza o frame completo, incluindo sombras e passes auxiliares/transmissão. Callbacks temporários identificam cada categoria e são restaurados ao final.

Esses totais não devem ser comparados diretamente às 1.489 chamadas registradas anteriormente pelo contador com reset automático: aquele contador não acumulava todos os passes do frame.

## Resultado medido

| Métrica | Antes | Depois |
| --- | ---: | ---: |
| Draw calls do frame completo | 3.375 | 2.537 |
| Chamadas de cor/transmissão do terreno | 986 | 148 |
| Meshes do terreno | 895 | 201 |
| Triângulos do frame completo | 972.790 | 973.890 |
| Tempo de submissão JS da amostra | 101 ms | 80,4 ms |

Redução de **24,8%** no total de chamadas e **85,0%** nas chamadas de cor/transmissão do terreno. 702 planos foram agrupados em 8 meshes, removendo 694 objetos de renderização. Os planos transparentes e os materiais exclusivos permanecem separados.

O pequeno aumento de 1.100 triângulos (~0,11%) vem da granularidade mais ampla do frustum culling nos lotes agrupados. Não foram acrescentadas formas ou detalhes ao cenário. O tempo de submissão é uma amostra, não um benchmark de FPS ou de tempo isolado de GPU.

As categorias dinâmicas mantiveram exatamente as mesmas contagens antes/depois:

| Categoria | Meshes | Chamadas de cor/transmissão | Chamadas de sombra |
| --- | ---: | ---: | ---: |
| Slimes | 70 | 47 | 5 |
| Pessoas | 546 | 828 | 364 |
| Veículos | 194 | 120 | 194 |
| Prédios | 59 | 106 | 59 |
| Casas | 57 | 94 | 57 |
| Props | 235 | 280 | 235 |

## Preservação visual e funcional

O batching atua apenas em planos estáticos opacos diretamente ligados ao cenário, agrupados por identidade do material, flags de sombra, renderOrder e layers. As transformações são incorporadas à geometria; UVs, normais, materiais e alturas são preservados. Planos transparentes, entidades consumíveis e slimes não são agrupados.

As geometrias antigas são liberadas e as novas são descartadas pelo fluxo de limpeza existente no reinício. Nenhuma textura, asset ou modelo do jogo foi substituído. Os materiais físicos/transmissivos, olhos, núcleo, bolhas e animações do slime permanecem intactos.

Comparação das capturas PNG congeladas: 5 pixels de 1.049.088 tiveram diferença maior que 2/255 em algum canal; diferença média por canal de 0,000065/255. A captura otimizada também foi inspecionada visualmente.

## Verificação

- 30 testes unitários passaram, incluindo transformações, triângulos, materiais, sombras, exclusão de transparências e idempotência do batching.
- Build de produção passou; permanece o aviso de bundle JavaScript maior que 500 kB (644,43 kB, 168,92 kB gzip).
- Teste comparativo de profiling passou e exige redução de pelo menos 10% no frame completo e contagens idênticas das categorias dinâmicas.
- Suíte visual completa: 7 testes passaram, zero falhas e 9 skips intencionais em 5,3 minutos. Renderização, entrada, absorção e progressão passaram nos perfis desktop, iframe CrazyGames, celular retrato e celular paisagem; reinício/combate e auditoria de fases foram exercitados nos cenários dedicados. O comparativo de profiling executa somente no desktop, evitando repetições idênticas nos outros perfis.
- git diff --check sem erros; apenas avisos de normalização futura de finais de linha de arquivos preexistentes.

## Reprodução

```text
npm run test:unit
npm run build
npm run test:visual
```

Para executar somente o comparativo:

```text
npm run test:visual -- --project=desktop --grep "profiles fixed"
```

`unbatchedTerrain=1` desativa o agrupamento somente quando combinado com `testMode=1`. Esse caminho existe para reproduzir a referência no teste; o agrupamento é padrão no jogo.

## Arquivos desta rodada

- src/main.js
- src/rendering/batchTerrain.js
- src/rendering/profileFrame.js
- tests/batchTerrain.test.js
- tests/profiling.spec.js
- docs/profiling-2026-10-25.md

## Próxima prioridade

Pessoas respondem por 828 chamadas de cor/transmissão e 364 de sombra nesta amostra. O próximo candidato é avaliar agrupamento ou instancing de componentes repetidos das pessoas, preservando movimento e absorção individuais. Isso exige profiling e regressão próprios; não foi implementado nesta rodada. Ainda é necessário medir FPS e tempo de GPU em celulares físicos antes de afirmar ganhos de fluidez no dispositivo-alvo.
