# Slimop Speed, Combat, and Density Design

## Goal

Keep movement responsive at every slime size, make rival consumption match visual expectations, and make the city 40% richer without breaking progression or mobile performance.

## Movement

Slime movement speed no longer decreases as radius increases. The player keeps one constant base speed across the entire growth curve. Rivals keep their existing relative speed multiplier, so they remain slightly slower than the player, but their own growth does not slow them down.

## Rival consumption

A slime can consume another slime when its radius is at least 5% larger. Radius advantages below 5% produce the existing physical bump instead. The same rule applies symmetrically to the player and AI rivals.

Floating-point comparisons use an explicit shared ratio constant. Tests cover 4%, exactly 5%, and 6% advantages so the visual rule cannot drift from runtime behavior.

## City density

Generated phases target 40% more dynamic and decorative items than the current baseline:

- pedestrian target increases by 40%;
- vehicle target increases by 40%, subject to available traffic slots;
- block decoration targets increase by 40%;
- park tree counts increase by 40%.

The increase applies to trees, cones, boxes, awnings, parasols, pedestrians, and vehicles through the existing asset selection system. Buildings and houses keep their current density to preserve road readability and prevent structural overlaps.

Traffic slot spacing may be reduced only enough to reach the target without visible vehicle overlap. The existing progression validator runs after the denser population is generated.

## Performance safeguards

The build must remain below the CrazyGames mobile initial-download limit. Rendering tests continue at desktop, the 907×510 CrazyGames iframe, portrait mobile, and 800×450 mobile landscape sizes.

Automated diagnostics record the final counts. Tests require at least a 35% increase over the old phase-one baselines, allowing small deterministic variation caused by placement constraints while targeting 40%.

## Verification

- Unit tests prove constant speed at small and large radii.
- Unit tests prove the 5% rival-consumption boundary.
- Generated phase tests verify increased pedestrians, vehicles, and props.
- The full consumption walkthrough still reaches vehicles, houses, buildings, towers, and phase completion.
- Runtime console output remains error-free in the production build.
- Visual screenshots are inspected for overcrowding, blocked roads, and HUD readability.
