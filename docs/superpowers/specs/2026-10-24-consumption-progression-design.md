# Slimop Consumption Progression Design

## Goal

Make every generated level finishable and make the growth path understandable while preserving active AI rivals that eat city objects and compete with the player.

## Progression ladder

City objects belong to five ordered tiers:

1. People and small props
2. Vehicles
3. Houses
4. Regular buildings
5. Towers

Every object in a tier uses a requirement inside that tier's fixed radius range. Adjacent ranges must not overlap, so a visually smaller category never unlocks after a larger one. Phase scaling may increase rewards and population, but it must not silently reorder the ladder.

The HUD shows the next locked tier and the player's progress toward its minimum required radius. When a tier unlocks, the message changes immediately to the next tier.

## Rival behavior

Rivals continue to consume city objects and other slimes. They prefer objects they can currently eat and may advance through all five tiers.

To prevent an unfair early deadlock, rivals have a short wake delay and should not target the protected starting area during the opening window. After that window, the city remains a free-for-all; no objects are permanently reserved for the player and consumed objects do not respawn.

## Solvability rules

Level generation must validate progression after population is created. The validator simulates multiple competing slimes, using the same mass gain and radius formulas as runtime gameplay. A level is accepted only when:

- the player has at least one initially consumable category;
- every tier can be unlocked in order;
- at least one plausible player progression path reaches regular buildings;
- all remaining city objects can eventually be consumed by some surviving slime;
- enough early-tier mass exists for the player and the initial rival population to progress without relying on consuming another slime.

If a generated level fails validation, generation deterministically adds or adjusts low-tier items rather than regenerating indefinitely.

## Code structure

Shared progression constants and pure helpers define tier requirements, radius-from-mass, unlock progress, and solvability simulation. Runtime `canEatItem`, item creation, AI targeting, HUD messaging, and tests must use those shared helpers so balance rules cannot drift between systems.

Diagnostic output under `window.__SLIMOP_DEBUG__` reports tier counts, tier mass, current unlock progress, and validator results. This remains read-only and supports automated release checks.

## Failure handling

Missing visual assets continue to degrade gracefully, but the validator uses only items actually added to the level. If a category has no loaded assets, validation reports the missing tier instead of treating the level as valid.

## Verification

Automated tests cover:

- monotonic tier thresholds;
- representative seeds across multiple phases;
- player-versus-rivals progression simulation;
- vehicles, houses, buildings, and towers becoming consumable in order;
- completion reaching zero active city items;
- HUD unlock messaging;
- desktop, CrazyGames iframe, portrait mobile, and landscape mobile rendering;
- production `dist` rather than development-only asset behavior.

The final playtest must walk the golden path from a new slime through a vehicle, a house, a regular building, and a tower, then confirm the phase-complete state. Edge probes cover repeated level transitions, rival competition, and a player death/retry.
