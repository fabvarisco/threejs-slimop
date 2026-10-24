# Slimop — CrazyGames Launch Roadmap

**Status:** Approved  
**Date:** 2026-10-24  
**Target:** A competitive, polished browser release for CrazyGames  
**Reference level:** Hole.io's clarity, short-session appeal, content framing, and product polish — without copying its identity, maps, interface, or assets.

## 1. Product vision

Slimop is a competitive casual game for mobile and desktop browsers. The player controls an expressive slime that absorbs progressively larger targets across a living low-poly city while competing against believable bots in two-minute matches.

The slime remains the central identity. Objects do not simply vanish: they are pulled, compressed, dissolved, and converted into visible growth. The product should match the reference game's accessibility and clarity while differentiating itself through character, deformation, absorption feedback, and a colorful city.

The core loop is:

1. Explore for safe clusters of food.
2. Absorb targets that are clearly within the current size range.
3. Grow and unlock larger categories.
4. Choose between efficient collection, hunting, and escaping.
5. Finish as high as possible in the ranking.
6. Earn coins, experience, mission progress, and cosmetic unlocks.

The game must load quickly, begin without mandatory registration, and teach through play rather than a long tutorial.

## 2. Approved launch scope

### Included

- One city containing four distinct districts.
- One classic competitive mode lasting 120 seconds.
- Player plus believable AI rivals.
- Equivalent desktop and mobile support.
- Evolved version of the current low-poly art direction.
- Full object progression from street clutter to towers.
- Light metagame: coins, player level, 12 skins, and rotating missions.
- Home, skin selection, settings, match HUD, results, and rewards.
- Local persistence with CrazyGames data integration when available.
- CrazyGames SDK lifecycle, advertising, and analytics integration.
- Adaptive quality profiles and explicit performance budgets.

### Deferred

- Real online multiplayer.
- Additional maps.
- Team and battle royale modes.
- Complex seasons or live events.
- Proprietary accounts and backend.
- Real-money purchases.
- Competitive power upgrades.

## 3. Match design

### Match curve

| Time | Phase | Intended experience |
| --- | --- | --- |
| 0–25 s | Start | People, bins, benches, street props, and the first upgrade within roughly 10 seconds. |
| 25–60 s | Contest | Trees, kiosks, bikes, and cars; rival routes begin to intersect. |
| 60–95 s | Domination | Houses, buses, trucks, and smaller rivals; collect safely or hunt. |
| 95–120 s | Climax | Buildings, towers, decisive rival encounters, visible rank pressure, and intensified audio. |

The target cadence is one newly consumable category every 20–30 seconds. A player must always be able to see or infer the next useful target.

### Consumption rules

- Growth does not reduce base movement speed.
- A slime needs an approximate 5% size advantage to consume another slime.
- Players and bots use the exact same authoritative consumption function.
- Consumable targets receive a subtle visual response before contact.
- Oversized targets react to collision but must not trap the slime.
- A short opening protection window prevents unfair immediate eliminations.
- Approaching threats receive a readable warning and a brief opportunity to react.
- Every entity has a defined tier, size proxy, score value, growth value, and absorption presentation.

### Game feel

- The slime stretches slightly toward a target during absorption.
- Small objects are pulled rapidly; large objects wobble, compress, and dissolve over a longer beat.
- Growth produces a short squash-and-expand response.
- Tier unlocks combine a clear HUD message, sound, ring/pulse effect, and brief highlight of newly edible targets.
- Camera distance and framing adjust smoothly with size without obscuring nearby food.
- Audio layers distinguish small pickups, vehicles, structures, rivals, growth, danger, and the final countdown.
- Feedback must stay legible when many objects are consumed in quick succession.

## 4. Rival AI

Each bot evaluates nearby food, threats, prey, distance, expected growth, congestion, and remaining match time. It then selects one of four intentions:

- **Collect:** follow a locally efficient food route.
- **Explore:** move toward an underused district or better density.
- **Hunt:** pursue a realistically catchable rival.
- **Flee:** create distance from a larger threat.

Bots use a utility scoring model instead of a rigid state sequence. Personalities modify aggression, caution, efficiency, curiosity, reaction time, and willingness to abandon a target.

Believability requires controlled imperfection:

- Delayed reactions.
- Occasional suboptimal routing.
- Limited perception radius.
- Commitment time before switching targets.
- Different risk tolerances.
- No access to hidden global information unavailable to the player.

Difficulty tuning may alter decision quality and reaction time, but must not grant impossible speed, growth, or consumption privileges.

## 5. World and content

### Districts

1. **Residential park:** pedestrians, benches, bins, trees, compact cars, and houses.
2. **Commercial zone:** kiosks, shops, dense traffic, vans, and medium buildings.
3. **Industrial zone:** crates, containers, trucks, warehouses, and concentrated high-value targets.
4. **Vertical center:** buses, large buildings, skyscrapers, towers, and final confrontations.

The four districts create visual and strategic variety inside one map. They should be recognizable through palette, prop mix, road pattern, landmark silhouettes, and soundscape while remaining one coherent city.

### Consumption ladder

| Tier | Typical targets |
| --- | --- |
| T1 | Small debris and street clutter |
| T2 | Pedestrians and small props |
| T3 | Trees, posts, and bikes |
| T4 | Cars, kiosks, and medium props |
| T5 | Houses, buses, trucks, and warehouses |
| T6 | Buildings, skyscrapers, towers, and large rivals |

The repository currently contains 141 GLB files totaling approximately 15.4 MB. The launch should first catalog, normalize, and reuse this library before commissioning or importing more models.

Initial world budgets:

- 45–60 active visual variations.
- Roughly 350–500 lightweight entities across the full world.
- Roughly 80–120 complex objects in the active camera region.
- Decorative density may scale with the quality profile, but edible content and competitive fairness must not.

### Seed validation

Automated generation audits must confirm:

- Minimum target counts per tier.
- Safe starting routes for all competitors.
- No progression dead ends.
- Balanced edible mass across spawn regions.
- At least one reachable endgame route within 120 seconds.
- No building overlap or impassable critical corridor.
- Rival spawns do not receive a material opening advantage.

## 6. UI and onboarding

The main flow is:

`loading → home → match → results → rewards → replay`

### Required screens

- Loading with truthful progress and platform initialization.
- Home with selected slime, Play, level, coins, missions, skins, and settings.
- Skin selection with locked-state requirements and preview.
- Match HUD.
- Results with position, score, coins, experience, records, and mission progress.
- Settings for music, sound effects, quality, controls/help, and language.

### Match HUD

- Timer and score.
- Current rank.
- Growth bar and next category.
- Short threat indication.
- Temporary tier-unlock notification.
- Final countdown emphasis.

The HUD must preserve playfield visibility on narrow mobile screens and respect safe areas. Input prompts adapt automatically to touch, pointer, or keyboard.

### Onboarding

- First launch uses a short contextual overlay, not a separate tutorial level.
- The opening route deliberately places obvious consumable targets ahead of the player.
- The first failed contact with an oversized target teaches the size rule visually.
- Hints disappear once the corresponding action is demonstrated.

## 7. Light metagame

- 12 launch skins.
- Three skins available early.
- Six earned through level or coin progression.
- Two earned through defined challenges.
- One special cosmetic tied to an achievement or optional rewarded-ad path.
- Player experience comes from placement, score, and objectives.
- Three rotating missions are presented at a time.
- Missions use understandable verbs already present in the core loop.
- Coins unlock cosmetics only.
- No permanent stat advantages.

Example missions:

- Consume 20 cars across any number of matches.
- Finish in the top three twice.
- Reach the building tier.
- Consume a rival.
- Visit all four districts in one match.

## 8. Monetization and platform behavior

- Advertising never interrupts an active match.
- Interstitials occur only at eligible transitions and use a controlled frequency.
- Rewarded ads are always optional and show the exact reward before playback.
- The player can continue without watching a rewarded ad.
- Gameplay and game audio pause during advertisements.
- Platform mute, focus loss, visibility changes, and resume are handled consistently.
- Gameplay start/stop events wrap only actual interactive play.
- Analytics must avoid personal data and focus on product decisions.

Core analytics events:

- Loading start/complete/failure and duration.
- Home shown and Play pressed.
- Match start/end, seed, duration, score, placement, final tier, and district distribution.
- Tier unlock time.
- Player/rival consumption and defeat cause.
- Mission completion and cosmetic unlock/equip.
- Quality profile, viewport class, approximate FPS band, and fatal errors.
- Ad opportunity, start, complete, skip, and failure.

## 9. Technical architecture

The current `src/main.js` is over 2,000 lines. Refactoring is incremental: a system leaves the monolith when it is actively redesigned for the vertical slice. A full rewrite is explicitly avoided.

Target modules:

```text
src/
  core/          loop, state, events, configuration
  gameplay/      movement, slime growth, consumption, scoring
  ai/            perception, utility decisions, navigation, personalities
  world/         generation, districts, spawn, entity catalog, validation
  rendering/     scene, models, materials, camera, particles, animation
  ui/            home, HUD, results, skins, missions, settings
  platform/      CrazyGames bridge, saves, ads, analytics
  audio/         music, effects, mixing, lifecycle
```

### Separation of responsibilities

- **Input** produces normalized player intent from touch, pointer, or keyboard.
- **Simulation** owns movement, AI, consumption, scoring, match state, and spawning.
- **Presentation** consumes simulation state for Three.js, UI, camera, audio, and VFX.
- **Platform services** own SDK, persistence, ads, analytics, and lifecycle events.

### Data model

A central entity catalog is the source of truth for:

- Stable type ID and display category.
- Asset/prefab reference.
- Footprint and collision radius.
- Consumption tier and minimum slime size.
- Score and growth value.
- Spawn tags and district weights.
- Render cost class and quality fallback.
- Absorption animation and audio profile.

Runtime entities reference catalog entries rather than carrying duplicated rules. The same catalog drives spawning, consumption, bot evaluation, HUD hints, audits, and tests.

### Performance strategy

- Spatial hash/grid for nearby entity and rival queries.
- Instanced meshes for repeated static objects when compatible.
- Shared geometry and materials for cloned GLBs.
- Object pools for particles, transient indicators, and frequently recycled entities.
- Visibility and level-of-detail management by camera distance.
- Fixed or bounded simulation step where consistency matters.
- No model fetch, texture decode, or shader compilation in the active match path after warm-up.
- Low, medium, and high quality profiles adjust shadows, pixel ratio, particles, decorative density, and draw distance.

## 10. Performance budgets

- 60 FPS target on a representative mid-range desktop.
- 30 FPS minimum on the selected low-end mobile test device.
- Production archive target at or below 20 MB.
- Interactive loading UI quickly and playable match entry under five seconds on a good connection after platform initialization.
- Stable memory after repeated matches with no monotonic entity, geometry, material, listener, or timer growth.
- No console errors, missing assets, or unhandled promise rejections.

Exact device models and network profiles must be recorded before final optimization begins so these targets remain reproducible.

## 11. Production roadmap

### Weeks 1–3: vertical slice

- Extract the entity catalog and match configuration.
- Finalize normalized touch/desktop movement and camera behavior.
- Implement final consumption checks and absorption presentation.
- Implement growth, tiers, score, timer, ranking, and match result state.
- Build four bot personalities using utility decisions.
- Finish one representative district.
- Add the final-style HUD, essential VFX, and essential audio.
- Establish desktop and mobile performance captures.

**Gate:** the slice is fun, readable, stable, and performant on both target form factors.

### Weeks 4–6: full city

- Build and connect all four districts.
- Complete entity classification and asset normalization.
- Expand traffic, pedestrians, props, landmarks, and endgame structures.
- Add seed validation and fairness audits.
- Complete bot hunting, fleeing, congestion handling, and late-match behavior.
- Introduce spatial partitioning, instancing, pooling, and adaptive quality.
- Tune progression using automated simulations and human playtests.

**Gate:** at least 20 consecutive audited matches complete without progression dead ends, invalid targets, or fatal errors.

### Weeks 7–8: complete product loop

- Build loading, home, skin, settings, results, and rewards screens.
- Add saves, coins, XP, levels, missions, and 12 skins.
- Add contextual onboarding and input-specific hints.
- Finish music, sound mix, visual polish, accessibility, and responsive behavior.
- Validate persistence across reloads and platform lifecycle changes.

**Gate:** the complete loop persists correctly and requires no developer tools or manual reset.

### Weeks 9–10: CrazyGames release

- Complete SDK lifecycle, advertisements, platform saves, and analytics.
- Verify asset, font, sound, and music licenses.
- Run compatibility and responsive test matrices.
- Tune loading, memory, frame time, and archive size.
- Conduct regression, soak, and exploratory playtests.
- Prepare store metadata, thumbnails, screenshots, descriptions, and submission archive.
- Address platform review findings without expanding launch scope.

**Gate:** the release checklist passes in full and the submitted build matches the verified artifact.

## 12. Verification strategy

### Automated unit tests

- Consumption boundaries and rival size threshold.
- Speed invariance across slime sizes.
- Tier unlock thresholds and monotonic progression.
- Entity catalog completeness and unique IDs.
- Bot utility scoring and forbidden-information constraints.
- Mission and reward calculations.
- Save migration and invalid-save recovery.

### Automated simulation tests

- Hundreds of seeds complete with sufficient mass in every tier.
- Spawn fairness remains within defined tolerances.
- Bots can reach endgame tiers at believable rates.
- No entity class becomes permanently unavailable.
- Match state always reaches a terminal result.

### Browser tests

- Desktop and mobile loading, start, movement, pause, resume, and results.
- HUD layout at supported viewport extremes and safe areas.
- Touch, pointer, and keyboard control paths.
- Platform event calls and advertisement pause/resume behavior.
- Save/restore and settings persistence.
- Canvas remains nonblank and free from asset errors.

### Human playtests

- New player understands movement and consumption without explanation.
- First growth beat occurs quickly.
- Every phase offers multiple viable targets.
- Rival behavior is recognizable but not predictable.
- Defeat feels explainable rather than arbitrary.
- The final 25 seconds produce urgency and meaningful competition.

## 13. Release criteria

The launch candidate is accepted only when:

- Every gameplay entity has valid catalog data and a tested consumption tier.
- Player and bots share consumption and movement rules.
- All audited seeds offer a complete growth route.
- No known progression blocker, soft lock, fatal error, or missing asset remains.
- Desktop and mobile controls pass their test matrix.
- Performance and archive budgets are met on recorded target devices.
- Memory remains stable through repeated-match soak testing.
- Save data survives reloads and safely recovers from invalid versions.
- Ads never interrupt active play and all SDK lifecycle events are balanced.
- Every shipped asset has documented commercial-use permission.
- Store materials accurately represent the actual game.

## 14. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| The existing monolith slows feature work. | Extract only systems touched by each milestone; keep the game runnable after every change. |
| More content harms mobile performance. | Enforce entity budgets, spatial queries, instancing, pooling, and quality profiles from the vertical slice. |
| Procedural maps generate impossible matches. | Make seed validation a release gate and retain deterministic reproduction URLs/debug data. |
| Bots feel unfair or artificial. | Use shared rules, limited perception, reaction delays, personalities, and telemetry-backed tuning. |
| Absorption lacks impact. | Treat animation, sound, camera, particles, and deformation as part of the mechanic, not final polish. |
| The 20 MB target conflicts with asset variety. | Audit actual shipped references, compress textures/models, avoid unused assets, and prefer palette/material reuse. |
| Music or third-party asset rights are unclear. | Maintain an explicit license register and replace uncertain files before submission. |
| Scope expands toward full Hole.io parity. | Preserve the approved launch exclusions and schedule additional modes/maps only after launch metrics. |

## 15. Success metrics

Engineering and design metrics available at launch:

- Load completion and failure rate.
- Match start-to-completion rate.
- Time to first growth and each tier unlock.
- Distribution of final tiers, scores, and placements.
- Frequency and timing of rival encounters.
- District usage and route concentration.
- FPS bands, quality profile, memory warnings, and fatal errors.
- Replay rate after the result screen.
- Skin unlock/equip and mission completion rates.
- Rewarded-ad opt-in and completion rates.

Retention targets should be set after an initial CrazyGames soft launch establishes a reliable baseline. Metrics must guide tuning, not justify expanding scope before the core loop is proven.

## 16. Benchmark notes

Current Hole.io product listings demonstrate the expected ecosystem around the core mechanic: short competitive sessions, multiple modes and maps, cosmetic skins, progression, collectibles, responsive interfaces, and regular content additions. The Slimop launch deliberately implements a narrower version of that ecosystem with a differentiated character-based absorption mechanic.

Reference material:

- Hole.io Google Play listing: https://play.google.com/store/apps/details?id=io.voodoo.holeio&hl=en_US
- Hole.io App Store listing: https://apps.apple.com/us/app/hole-io/id1389111413
- Hole.io Nintendo listing: https://ec.nintendo.com/AU/en/titles/70010000069918
- Hole.io FAQ: https://holeio.com/faq/hole-io-2.php

