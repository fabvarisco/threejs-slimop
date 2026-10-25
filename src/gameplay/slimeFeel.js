import * as THREE from 'three';

export function getAbsorptionProfile(item) {
  const mass = Math.max(0, Number.isFinite(item.mass) ? item.mass : 0);
  const profile = item.type === 'slime' ? { duration: 0.46, lift: 0.15, tumble: 1.2, suction: 2.2, shrink: 1.8, pulse: 1.4 } :
    item.tier === 'tower' ? { duration: 0.76, lift: 0.05, tumble: 0.4, suction: 1.7, shrink: 1.15, pulse: 1.2 } :
    item.type === 'building' ? { duration: 0.64, lift: 0.06, tumble: 0.55, suction: 1.8, shrink: 1.3, pulse: 1.1 } :
    item.type === 'house' ? { duration: 0.54, lift: 0.09, tumble: 0.75, suction: 2, shrink: 1.5, pulse: 0.95 } :
    item.type === 'vehicle' ? { duration: 0.42, lift: 0.18, tumble: 1.45, suction: 2.3, shrink: 1.8, pulse: 0.75 } :
    { duration: 0.24, lift: 0.1, tumble: 0.85, suction: 3, shrink: 2.4, pulse: 0.45 };
  return { ...profile, pulse: Math.min(1.8, profile.pulse + Math.sqrt(mass) * 0.08) };
}

export function createSlimeFeelState() {
  return {
    pulse: 0,
    wobble: 0,
    velocityLength: 0,
    absorbCount: 0,
    animTime: 0
  };
}

export function triggerAbsorbPulse(slime, strength = 1.0) {
  if (!slime.feel) slime.feel = createSlimeFeelState();
  slime.feel.pulse = Math.min(2.0, slime.feel.pulse + strength);
  slime.feel.wobble = Math.min(2.0, slime.feel.wobble + strength * 1.2);
  slime.feel.absorbCount += 1;
}

export function updateSlimeFeel(slime, dt) {
  if (!slime.feel) slime.feel = createSlimeFeelState();
  const feel = slime.feel;

  feel.pulse = THREE.MathUtils.damp(feel.pulse, 0, 7.0, dt);
  feel.wobble = THREE.MathUtils.damp(feel.wobble, 0, 8.0, dt);
  feel.animTime = (feel.animTime || 0) + dt;

  const speed = slime.velocity ? slime.velocity.length() : 0;
  feel.velocityLength = THREE.MathUtils.damp(feel.velocityLength, speed, 8.0, dt);

  const body = slime.mesh?.userData?.body;
  if (!body) return;

  // Elastic gelatinous jelly deformation
  const pulseFactor = Math.sin(feel.pulse * Math.PI * 2.5) * 0.14 * feel.pulse +
    Math.sin(feel.animTime * 14) * feel.wobble * 0.025;
  const speedFactor = Math.min(1.0, feel.velocityLength / 12.0);

  // Cute squishy hop and breath cycle
  const hopCycle = Math.sin(feel.animTime * 10);
  const idleBreath = Math.sin(feel.animTime * 3) * 0.02;
  const hopSquash = speedFactor > 0.05 ? hopCycle * 0.07 * speedFactor : idleBreath;

  // Squash in Y, stretch in XZ when bouncing, moving, and pulsing
  const scaleY = Math.max(0.2, 1.0 - speedFactor * 0.08 + pulseFactor + hopSquash);
  const scaleXZ = Math.max(0.3, 1.0 + speedFactor * 0.05 - pulseFactor * 0.4 - hopSquash * 0.5);

  body.scale.set(scaleXZ, scaleY, scaleXZ);

  // Subtle core wobble for translucent refraction depth
  const core = slime.mesh?.userData?.core;
  if (core) {
    const corePulse = Math.sin(feel.pulse * Math.PI * 2.0) * 0.1 * feel.pulse;
    core.scale.set(1.0 - corePulse * 0.5, 0.78 + corePulse, 1.0 - corePulse * 0.5);
  }
}

/**
 * Visually satisfying absorption into the 3D Slime body:
 * 1. Smoothly attracted horizontally toward the slime center.
 * 2. Lifts upward into the translucent gelatinous mass.
 * 3. Tumbles and twists as it gets digested by the core.
 * 4. Shrinks smoothly and dissolves into the nucleus.
 */
export function updateEatEffectItem(effect, dt) {
  effect.age += dt;
  const progress = Math.min(1, effect.age / effect.duration);

  // Suction and lift curves
  const slideEase = 1 - Math.pow(1 - progress, effect.suction ?? 2.5);
  const liftEase = Math.sin(progress * Math.PI);

  const target = effect.target.mesh.position;
  const targetRadius = effect.target.radius || 1;

  // 1. Horizontal slide toward slime center
  effect.mesh.position.x = THREE.MathUtils.lerp(effect.start.x, target.x, slideEase);
  effect.mesh.position.z = THREE.MathUtils.lerp(effect.start.z, target.z, slideEase);

  // 2. Lift up into the gelatinous slime mass, then settle toward core
  const jellyCenterY = target.y + targetRadius * 0.55;
  effect.mesh.position.y = THREE.MathUtils.lerp(effect.start.y, jellyCenterY, slideEase) + liftEase * (effect.lift ?? 0.25);

  // 3. Natural tip & tumble into the jelly
  const dx = target.x - effect.start.x;
  const dz = target.z - effect.start.z;
  const dirLength = Math.hypot(dx, dz) || 1;
  const tumbleStrength = slideEase * (effect.tumble ?? 1.4);
  const tiltX = (dz / dirLength) * tumbleStrength;
  const tiltZ = -(dx / dirLength) * tumbleStrength;

  effect.mesh.rotation.x = (effect.baseRotation?.x || 0) + tiltX;
  effect.mesh.rotation.z = (effect.baseRotation?.z || 0) + tiltZ;
  effect.mesh.rotation.y += (effect.spin || 1) * dt * 3.8;

  // 4. Smooth shrink & incorporate into the slime core
  const shrink = Math.max(0.001, Math.pow(1 - progress, effect.shrink ?? 2));
  effect.mesh.scale.set(
    effect.baseScale.x * shrink,
    effect.baseScale.y * shrink,
    effect.baseScale.z * shrink
  );

  return progress >= 1;
}
