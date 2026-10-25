import * as THREE from 'three';
import { MATCH_CONFIG, getMatchTimeLeft } from '../gameConfig.js';
import { createEntityStats } from '../entityCatalog.js';
import { getWorldLimit } from '../world/worldConfig.js';

export const APOCALYPSE_CONFIG = Object.freeze({
  triggerRemainingSeconds: 30,
  wave1EndSeconds: 21,
  wave2EndSeconds: 10,
  fallDuration: 1.35,
  skySpawnHeight: 38,
  maxActiveProjectiles: 8,
  dropIntervalWave1: 1.6,
  dropIntervalWave2: 0.95,
  dropIntervalWave3: 0.55
});

// Reusable geometries and materials for telegraph markers
const TELEGRAPH_RING_GEO = new THREE.RingGeometry(0.85, 1.0, 32);
const TELEGRAPH_DISC_GEO = new THREE.CircleGeometry(0.85, 32);

const TELEGRAPH_RING_MAT = new THREE.MeshBasicMaterial({
  color: 0xff3700,
  transparent: true,
  opacity: 0.82,
  depthWrite: false
});

const TELEGRAPH_DISC_MAT = new THREE.MeshBasicMaterial({
  color: 0xff7700,
  transparent: true,
  opacity: 0.45,
  depthWrite: false
});

const SHOCKWAVE_GEO = new THREE.RingGeometry(0.5, 0.9, 32);
const SHOCKWAVE_MAT = new THREE.MeshBasicMaterial({
  color: 0xffaa33,
  transparent: true,
  opacity: 0.75,
  depthWrite: false
});

// Lightweight Web Audio API synthesizer for retro arcade Apocalypse sounds
let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioCtx = new AudioContext();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playApocalypseSiren(muted = false) {
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    const now = ctx.currentTime;

    osc.frequency.setValueAtTime(360, now);
    osc.frequency.exponentialRampToValueAtTime(720, now + 0.35);
    osc.frequency.exponentialRampToValueAtTime(380, now + 0.7);
    osc.frequency.exponentialRampToValueAtTime(820, now + 1.05);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
    gain.gain.setValueAtTime(0.2, now + 0.9);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1.25);
  } catch {
    // Autoplay policy fallback
  }
}

export function playImpactThud(mass, muted = false) {
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    const now = ctx.currentTime;

    const baseFreq = Math.max(45, 115 - Math.min(65, mass * 0.7));
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(28, now + 0.22);

    const volume = Math.min(0.28, 0.08 + (mass / 180) * 0.16);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.26);
  } catch {
    // Autoplay policy fallback
  }
}

export function getApocalypseWave(timeLeft) {
  if (timeLeft > APOCALYPSE_CONFIG.triggerRemainingSeconds || timeLeft <= 0) return 0;
  if (timeLeft > APOCALYPSE_CONFIG.wave1EndSeconds) return 1;
  if (timeLeft > APOCALYPSE_CONFIG.wave2EndSeconds) return 2;
  return 3;
}

export class SlimeApocalypseController {
  constructor(game) {
    this.game = game;
    this.active = false;
    this.triggered = false;
    this.wave = 0;
    this.projectiles = [];
    this.shockwaves = [];
    this.nextDropTimer = 0;
    this.cameraShakeTrauma = 0;
    this.ambientOriginalColor = new THREE.Color(0x7a93a0);
    this.sunOriginalColor = new THREE.Color(0xffffff);
    this.bgOriginalColor = new THREE.Color(0xb2d8f7);
    this.apocalypseAmbient = new THREE.Color(0xd47733);
    this.apocalypseSun = new THREE.Color(0xff8833);
    this.apocalypseBg = new THREE.Color(0xb06040);
  }

  reset() {
    for (const proj of this.projectiles) {
      if (proj.mesh?.parent) proj.mesh.parent.remove(proj.mesh);
      if (proj.telegraph?.parent) proj.telegraph.parent.remove(proj.telegraph);
    }
    for (const shock of this.shockwaves) {
      if (shock.mesh?.parent) shock.mesh.parent.remove(shock.mesh);
    }
    this.projectiles = [];
    this.shockwaves = [];
    this.active = false;
    this.triggered = false;
    this.wave = 0;
    this.nextDropTimer = 0;
    this.cameraShakeTrauma = 0;

    // Restore original colors
    if (this.game.ambient) this.game.ambient.color.copy(this.ambientOriginalColor);
    if (this.game.sun) this.game.sun.color.copy(this.sunOriginalColor);
    if (this.game.scene) this.game.scene.background = this.bgOriginalColor.clone();
  }

  update(dt, elapsed) {
    const timeLeft = getMatchTimeLeft(elapsed);

    // 1. Activation check at exactly 30s remaining
    if (!this.triggered && timeLeft <= APOCALYPSE_CONFIG.triggerRemainingSeconds && timeLeft > 0) {
      this.triggerApocalypse();
    }

    if (!this.active) return;

    // Check if match ended
    if (timeLeft <= 0) {
      this.active = false;
      return;
    }

    // 2. Wave progression
    this.wave = getApocalypseWave(timeLeft);

    // 3. Smooth lighting and sky shift to dramatic amber dusk
    if (this.game.ambient) {
      this.game.ambient.color.lerp(this.apocalypseAmbient, dt * 1.5);
    }
    if (this.game.sun) {
      this.game.sun.color.lerp(this.apocalypseSun, dt * 1.5);
    }
    if (this.game.scene?.background?.isColor) {
      this.game.scene.background.lerp(this.apocalypseBg, dt * 1.5);
    }

    // 4. Drop scheduling
    this.nextDropTimer -= dt;
    if (this.nextDropTimer <= 0 && this.projectiles.length < APOCALYPSE_CONFIG.maxActiveProjectiles) {
      this.spawnFallingObject();
      const interval = this.wave === 1
        ? APOCALYPSE_CONFIG.dropIntervalWave1
        : this.wave === 2
          ? APOCALYPSE_CONFIG.dropIntervalWave2
          : APOCALYPSE_CONFIG.dropIntervalWave3;
      this.nextDropTimer = interval * (0.8 + Math.random() * 0.4);
    }

    // 5. Update active falling projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i -= 1) {
      const proj = this.projectiles[i];
      proj.elapsed += dt;
      const progress = Math.min(1, proj.elapsed / proj.totalTime);

      // Accelerated downward interpolation
      const t = progress;
      const easeIn = t * t;
      proj.currentY = proj.startY + (proj.targetY - proj.startY) * easeIn;
      proj.mesh.position.y = proj.currentY;

      // Tumbling rotation while falling
      proj.mesh.rotation.x += proj.spinX * dt;
      proj.mesh.rotation.z += proj.spinZ * dt;
      proj.mesh.rotation.y += proj.spinY * dt;

      // Update telegraph inner disc scale
      if (proj.telegraphInner) {
        const discScale = Math.max(0.01, progress * proj.radius);
        proj.telegraphInner.scale.set(discScale, discScale, discScale);
      }

      // Check impact
      if (progress >= 1) {
        this.resolveImpact(proj);
        this.projectiles.splice(i, 1);
      }
    }

    // 6. Update expanding shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i -= 1) {
      const shock = this.shockwaves[i];
      shock.elapsed += dt;
      const t = shock.elapsed / shock.duration;
      if (t >= 1) {
        if (shock.mesh.parent) shock.mesh.parent.remove(shock.mesh);
        this.shockwaves.splice(i, 1);
      } else {
        const scale = shock.startScale + (shock.endScale - shock.startScale) * t;
        shock.mesh.scale.set(scale, scale, scale);
        shock.mesh.material.opacity = (1 - t) * 0.75;
      }
    }

    // 7. Decay camera shake trauma
    if (this.cameraShakeTrauma > 0) {
      this.cameraShakeTrauma = Math.max(0, this.cameraShakeTrauma - dt * 2.8);
    }
  }

  triggerApocalypse() {
    this.active = true;
    this.triggered = true;
    this.wave = 1;
    this.nextDropTimer = 0.5;

    // Play siren sound
    const isMuted = Boolean(this.game.music?.muted || (typeof window !== 'undefined' && window.__SLIMOP_MUTED__));
    playApocalypseSiren(isMuted);

    // Announce via HUD banner
    if (this.game.hudState) {
      this.game.hudState.currentBannerText = '⚡ SLIME APOCALYPSE! ⚡';
      this.game.hudState.unlockBannerTimer = 4.0;
      this.game.hudState.isApocalypse = true;
    }
  }

  spawnFallingObject() {
    const assets = this.game.assets;
    if (!assets) return;

    // 1. Pick target location on map
    const limit = getWorldLimit(this.game.worldSize) - 8;
    const liveSlimes = this.game.slimes.filter((s) => s.alive);
    const anchor = (this.game.player?.alive && Math.random() < 0.55)
      ? this.game.player
      : (liveSlimes.length ? liveSlimes[Math.floor(Math.random() * liveSlimes.length)] : null);

    let targetX = 0;
    let targetZ = 0;
    if (anchor) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 7 + Math.random() * 22;
      targetX = THREE.MathUtils.clamp(anchor.mesh.position.x + Math.cos(angle) * dist, -limit, limit);
      targetZ = THREE.MathUtils.clamp(anchor.mesh.position.z + Math.sin(angle) * dist, -limit, limit);
    } else {
      targetX = (Math.random() - 0.5) * limit * 1.4;
      targetZ = (Math.random() - 0.5) * limit * 1.4;
    }

    // 2. Select object type according to current wave
    let type = 'prop';
    let prefab = null;
    let footprint = 1.0;
    let mass = 5;
    let targetHeight = null;

    if (this.wave === 1) {
      // Wave 1: Props, trees, sedans
      const roll = Math.random();
      if (roll < 0.4 && assets.props?.length) {
        type = 'prop';
        prefab = assets.props[Math.floor(Math.random() * assets.props.length)];
        footprint = 0.9 + Math.random() * 0.5;
        mass = Math.round(3 + Math.random() * 5);
      } else if (roll < 0.7 && assets.cars?.length) {
        type = 'vehicle';
        prefab = assets.cars[Math.floor(Math.random() * Math.min(5, assets.cars.length))];
        footprint = 1.8 + Math.random() * 0.4;
        mass = Math.round(11 + Math.random() * 5);
      } else {
        type = 'prop';
        prefab = assets.props ? assets.props[Math.floor(Math.random() * assets.props.length)] : null;
        footprint = 1.0;
        mass = 4;
      }
    } else if (this.wave === 2) {
      // Wave 2: Trucks, delivery, vans, small houses
      const roll = Math.random();
      if (roll < 0.55 && assets.cars?.length) {
        type = 'vehicle';
        const carIdx = Math.min(assets.cars.length - 1, 4 + Math.floor(Math.random() * (assets.cars.length - 4)));
        prefab = assets.cars[carIdx];
        footprint = 2.4 + Math.random() * 0.6;
        mass = Math.round(18 + Math.random() * 12);
      } else if (assets.houses?.length) {
        type = 'house';
        prefab = assets.houses[Math.floor(Math.random() * assets.houses.length)];
        footprint = 3.6 + Math.random() * 1.2;
        mass = Math.round(35 + Math.random() * 20);
      } else {
        type = 'vehicle';
        prefab = assets.cars ? assets.cars[0] : null;
        footprint = 2.2;
        mass = 16;
      }
    } else {
      // Wave 3: Large houses, buildings, towers
      const roll = Math.random();
      if (roll < 0.5 && assets.buildings?.length) {
        type = 'building';
        prefab = assets.buildings[Math.floor(Math.random() * assets.buildings.length)];
        footprint = 5.0 + Math.random() * 2.0;
        mass = Math.round(70 + Math.random() * 50);
      } else if (roll < 0.8 && assets.houses?.length) {
        type = 'house';
        prefab = assets.houses[Math.floor(Math.random() * assets.houses.length)];
        footprint = 4.2 + Math.random() * 1.5;
        mass = Math.round(45 + Math.random() * 25);
      } else if (assets.buildings?.length) {
        type = 'building';
        prefab = assets.buildings[assets.buildings.length - 1]; // tallest tower
        footprint = 6.5;
        mass = 120;
      } else {
        type = 'house';
        footprint = 4.0;
        mass = 40;
      }
    }

    if (!prefab) return;

    // 3. Clone and scale model
    const mesh = this.game.cloneAndFit(prefab, footprint, targetHeight, { castShadow: true, receiveShadow: true });
    const radius = footprint * 0.44;

    // 4. Create Ground Telegraph Reticle
    const telegraphGroup = new THREE.Group();
    telegraphGroup.position.set(targetX, 0.024, targetZ);
    telegraphGroup.rotation.x = -Math.PI / 2;

    const ringMesh = new THREE.Mesh(TELEGRAPH_RING_GEO, TELEGRAPH_RING_MAT);
    ringMesh.scale.set(radius, radius, radius);
    telegraphGroup.add(ringMesh);

    const innerMat = TELEGRAPH_DISC_MAT.clone();
    const innerMesh = new THREE.Mesh(TELEGRAPH_DISC_GEO, innerMat);
    innerMesh.scale.set(0.01, 0.01, 0.01);
    telegraphGroup.add(innerMesh);

    this.game.levelGroup.add(telegraphGroup);

    // 5. Initial projectile state
    const startY = APOCALYPSE_CONFIG.skySpawnHeight + Math.random() * 6;
    mesh.position.set(targetX, startY, targetZ);
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    this.game.levelGroup.add(mesh);

    this.projectiles.push({
      mesh,
      telegraph: telegraphGroup,
      telegraphInner: innerMesh,
      type,
      mass,
      radius,
      targetX,
      targetZ,
      startY,
      targetY: 0.032,
      currentY: startY,
      elapsed: 0,
      totalTime: APOCALYPSE_CONFIG.fallDuration,
      spinX: (Math.random() - 0.5) * 3.5,
      spinY: (Math.random() - 0.5) * 4.0,
      spinZ: (Math.random() - 0.5) * 3.5
    });
  }

  resolveImpact(proj) {
    // 1. Remove telegraph marker
    if (proj.telegraph?.parent) {
      proj.telegraph.parent.remove(proj.telegraph);
    }

    // 2. Snap mesh to upright position on the ground
    proj.mesh.position.set(proj.targetX, 0.032, proj.targetZ);
    proj.mesh.rotation.set(0, Math.random() * Math.PI * 2, 0);

    // 3. Audio & Camera Shake
    const isMuted = Boolean(this.game.music?.muted || (typeof window !== 'undefined' && window.__SLIMOP_MUTED__));
    playImpactThud(proj.mass, isMuted);

    const traumaAdd = this.wave === 1 ? 0.08 : this.wave === 2 ? 0.16 : 0.28;
    this.cameraShakeTrauma = Math.min(1.0, this.cameraShakeTrauma + traumaAdd);

    // 4. Spawn expanding ground shockwave ring
    const shockMat = SHOCKWAVE_MAT.clone();
    const shockMesh = new THREE.Mesh(SHOCKWAVE_GEO, shockMat);
    shockMesh.rotation.x = -Math.PI / 2;
    shockMesh.position.set(proj.targetX, 0.026, proj.targetZ);
    this.game.levelGroup.add(shockMesh);

    this.shockwaves.push({
      mesh: shockMesh,
      startScale: proj.radius * 0.8,
      endScale: proj.radius * 2.8,
      elapsed: 0,
      duration: 0.35
    });

    // 5. Knockback check for nearby slimes that cannot absorb this object
    const requiredRadius = proj.mass * 0.08 + proj.radius * 1.35;
    for (const slime of this.game.slimes) {
      if (!slime.alive) continue;
      const dx = slime.mesh.position.x - proj.targetX;
      const dz = slime.mesh.position.z - proj.targetZ;
      const dist = Math.hypot(dx, dz);
      const safeRadius = proj.radius + slime.radius;
      if (dist < safeRadius) {
        // Can slime eat it? If yes, let normal absorption handle it next frame
        if (slime.radius >= requiredRadius) continue;

        // Push smaller slime safely away
        const pushDist = (safeRadius - dist) + 0.3;
        const pushX = dist > 0.01 ? (dx / dist) * pushDist : pushDist;
        const pushZ = dist > 0.01 ? (dz / dist) * pushDist : 0;
        slime.mesh.position.x += pushX;
        slime.mesh.position.z += pushZ;
        slime.velocity.x += pushX * 3.5;
        slime.velocity.z += pushZ * 3.5;
      }
    }

    // 6. Convert into a full consumable entity in this.items
    const stats = createEntityStats(proj.type, proj.radius * 2);
    const item = {
      ...stats,
      active: true,
      mesh: proj.mesh,
      mass: proj.mass,
      radius: proj.radius,
      requiredRadius: Math.max(stats.requiredRadius ?? 0.5, proj.radius * 1.45),
      position: proj.mesh.position,
      eatenBy: null,
      isApocalypseLoot: true
    };
    proj.mesh.userData.baseScale = proj.mesh.scale.clone();
    proj.mesh.userData.spinSpeed = 0;

    this.game.addItem(item);
    this.game.levelMass += item.mass;
    this.game.cityMassLeft += item.mass;
  }

  getHazardZones() {
    return this.projectiles.map((p) => ({
      x: p.targetX,
      z: p.targetZ,
      radius: p.radius * 1.6,
      mass: p.mass,
      remainingTime: Math.max(0, p.totalTime - p.elapsed)
    }));
  }
}
