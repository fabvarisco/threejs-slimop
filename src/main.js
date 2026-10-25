import { getBotPersonality, updateBotDecision } from './ai/utilityAi.js';
import { createSlimeFeelState, triggerAbsorbPulse, updateSlimeFeel, updateEatEffectItem, getAbsorptionProfile } from './gameplay/slimeFeel.js';
import { rankSlimes, calculatePlayerRank, detectNearbyThreat, createHudState, updateHudState,
  getCityProgress, renderLeaderboard, setText } from './ui/hudController.js';
import { AbsorptionFeedback } from './ui/absorptionFeedback.js';
import { SlimeApocalypseController } from './gameplay/slimeApocalypse.js';
import { FEEDBACK_CONFIG } from './gameplay/feedbackConfig.js';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { CrazyGamesBridge } from './crazygames.js';
import { calculateItemScore, createEntityStats, validateEntityCatalog } from './entityCatalog.js';
import { MATCH_CONFIG, getMatchTimeLeft, isMatchTimeExpired } from './gameConfig.js';
import { profileFrame } from './rendering/profileFrame.js';
import { batchTerrain } from './rendering/batchTerrain.js';
import { MOVEMENT_KEYS, keyboardAxes, cameraRelativeDirection, advanceMovement } from './gameplay/movement.js';
import { MAP_PROFILES, WORLD_CONFIG, getWorldSettings, getWorldLimit, auditWorldBounds } from './world/worldConfig.js';
import { createLotPositions, findRoadSpawn } from './world/placement.js';
import { createStreetAxis, describeStreets, streetIntervals, createUrbanBlocks, allocateDecor,
  circleOverlapsRect, decorKind, decorCandidate } from './world/urbanLayout.js';
import { canConsumeSlime, getSlimeSpeed, scalePopulation } from './mechanics.js';
import {
  MASS_GAIN_FACTOR,
  calculateProgressionAudit,
  getUnlockState,
  radiusFromMass,
  massFromRadius,
  validateCompetitiveProgression
} from './progression.js';
import './styles.css';

const BUILDING_MODEL_URLS = [
  new URL('../Assets/City Kit - Commercial/Models/GLB format/building-a.glb', import.meta.url).href,
  new URL('../Assets/City Kit - Commercial/Models/GLB format/building-b.glb', import.meta.url).href,
  new URL('../Assets/City Kit - Commercial/Models/GLB format/building-c.glb', import.meta.url).href,
  new URL('../Assets/City Kit - Commercial/Models/GLB format/building-d.glb', import.meta.url).href,
  new URL('../Assets/City Kit - Commercial/Models/GLB format/building-e.glb', import.meta.url).href,
  new URL('../Assets/City Kit - Commercial/Models/GLB format/building-f.glb', import.meta.url).href,
  new URL('../Assets/City Kit - Commercial/Models/GLB format/building-g.glb', import.meta.url).href,
  new URL('../Assets/City Kit - Commercial/Models/GLB format/building-h.glb', import.meta.url).href,
  new URL('../Assets/City Kit - Commercial/Models/GLB format/building-i.glb', import.meta.url).href,
  new URL('../Assets/City Kit - Commercial/Models/GLB format/building-k.glb', import.meta.url).href,
  new URL('../Assets/City Kit - Commercial/Models/GLB format/building-l.glb', import.meta.url).href,
  new URL('../Assets/City Kit - Commercial/Models/GLB format/building-m.glb', import.meta.url).href,
  new URL('../Assets/City Kit - Commercial/Models/GLB format/building-n.glb', import.meta.url).href,
  new URL('../Assets/City Kit - Commercial/Models/GLB format/building-skyscraper-a.glb', import.meta.url).href,
  new URL('../Assets/City Kit - Commercial/Models/GLB format/building-skyscraper-b.glb', import.meta.url).href,
  new URL('../Assets/City Kit - Commercial/Models/GLB format/building-skyscraper-c.glb', import.meta.url).href,
  new URL('../Assets/City Kit - Commercial/Models/GLB format/building-skyscraper-d.glb', import.meta.url).href,
  new URL('../Assets/City Kit - Commercial/Models/GLB format/building-skyscraper-e.glb', import.meta.url).href
];

const HOUSE_MODEL_URLS = [
  new URL('../Assets/City Kit - Commercial/Models/GLB format/low-detail-building-a.glb', import.meta.url).href,
  new URL('../Assets/City Kit - Commercial/Models/GLB format/low-detail-building-b.glb', import.meta.url).href,
  new URL('../Assets/City Kit - Commercial/Models/GLB format/low-detail-building-c.glb', import.meta.url).href,
  new URL('../Assets/City Kit - Commercial/Models/GLB format/low-detail-building-d.glb', import.meta.url).href,
  new URL('../Assets/City Kit - Commercial/Models/GLB format/low-detail-building-e.glb', import.meta.url).href,
  new URL('../Assets/City Kit - Commercial/Models/GLB format/low-detail-building-f.glb', import.meta.url).href,
  new URL('../Assets/City Kit - Commercial/Models/GLB format/low-detail-building-g.glb', import.meta.url).href,
  new URL('../Assets/City Kit - Commercial/Models/GLB format/low-detail-building-h.glb', import.meta.url).href,
  new URL('../Assets/City Kit - Commercial/Models/GLB format/low-detail-building-i.glb', import.meta.url).href,
  new URL('../Assets/City Kit - Commercial/Models/GLB format/low-detail-building-j.glb', import.meta.url).href,
  new URL('../Assets/City Kit - Commercial/Models/GLB format/low-detail-building-k.glb', import.meta.url).href,
  new URL('../Assets/City Kit - Commercial/Models/GLB format/low-detail-building-l.glb', import.meta.url).href,
  new URL('../Assets/City Kit - Commercial/Models/GLB format/low-detail-building-m.glb', import.meta.url).href,
  new URL('../Assets/City Kit - Commercial/Models/GLB format/low-detail-building-n.glb', import.meta.url).href,
  new URL('../Assets/City Kit - Commercial/Models/GLB format/low-detail-building-wide-a.glb', import.meta.url).href,
  new URL('../Assets/City Kit - Commercial/Models/GLB format/low-detail-building-wide-b.glb', import.meta.url).href
];

const CAR_MODEL_URLS = [
  new URL('../Assets/Car Kit/Models/GLB format/sedan.glb', import.meta.url).href,
  new URL('../Assets/Car Kit/Models/GLB format/sedan-sports.glb', import.meta.url).href,
  new URL('../Assets/Car Kit/Models/GLB format/hatchback-sports.glb', import.meta.url).href,
  new URL('../Assets/Car Kit/Models/GLB format/suv.glb', import.meta.url).href,
  new URL('../Assets/Car Kit/Models/GLB format/taxi.glb', import.meta.url).href,
  new URL('../Assets/Car Kit/Models/GLB format/police.glb', import.meta.url).href,
  new URL('../Assets/Car Kit/Models/GLB format/van.glb', import.meta.url).href,
  new URL('../Assets/Car Kit/Models/GLB format/truck.glb', import.meta.url).href,
  new URL('../Assets/Car Kit/Models/GLB format/truck-flat.glb', import.meta.url).href,
  new URL('../Assets/Car Kit/Models/GLB format/delivery.glb', import.meta.url).href,
  new URL('../Assets/Car Kit/Models/GLB format/firetruck.glb', import.meta.url).href,
  new URL('../Assets/Car Kit/Models/GLB format/garbage-truck.glb', import.meta.url).href,
  new URL('../Assets/Car Kit/Models/GLB format/ambulance.glb', import.meta.url).href
];

const CHARACTER_MODEL_URLS = [
  new URL('../Assets/Mini Characters/Models/GLB format/character-male-a.glb', import.meta.url).href,
  new URL('../Assets/Mini Characters/Models/GLB format/character-male-c.glb', import.meta.url).href,
  new URL('../Assets/Mini Characters/Models/GLB format/character-male-e.glb', import.meta.url).href,
  new URL('../Assets/Mini Characters/Models/GLB format/character-female-b.glb', import.meta.url).href,
  new URL('../Assets/Mini Characters/Models/GLB format/character-female-d.glb', import.meta.url).href,
  new URL('../Assets/Mini Characters/Models/GLB format/character-female-f.glb', import.meta.url).href
];

const PROP_MODEL_URLS = [
  new URL('../Assets/City Kit - Commercial/Models/GLB format/detail-awning.glb', import.meta.url).href,
  new URL('../Assets/City Kit - Commercial/Models/GLB format/detail-awning-wide.glb', import.meta.url).href,
  new URL('../Assets/City Kit - Commercial/Models/GLB format/detail-overhang.glb', import.meta.url).href,
  new URL('../Assets/City Kit - Commercial/Models/GLB format/detail-overhang-wide.glb', import.meta.url).href,
  new URL('../Assets/City Kit - Commercial/Models/GLB format/detail-parasol-a.glb', import.meta.url).href,
  new URL('../Assets/City Kit - Commercial/Models/GLB format/detail-parasol-b.glb', import.meta.url).href,
  new URL('../Assets/Car Kit/Models/GLB format/cone.glb', import.meta.url).href,
  new URL('../Assets/Car Kit/Models/GLB format/box.glb', import.meta.url).href
];

const CITY_TEXTURE_URL = new URL(
  '../Assets/City Kit - Commercial/Models/GLB format/Textures/colormap.png',
  import.meta.url
).href;
const CAR_TEXTURE_URL = new URL('../Assets/Car Kit/Models/GLB format/Textures/colormap.png', import.meta.url).href;
const CHARACTER_TEXTURE_URL = new URL(
  '../Assets/Mini Characters/Models/GLB format/Textures/colormap.png',
  import.meta.url
).href;

const COLORS = {
  asphalt: 0x2e3332,
  curb: 0xd7d1c3,
  sidewalk: 0xb9bab1,
  concrete: 0xa8aea6,
  plaza: 0xc8c1b3,
  ground: 0x6aa45e,
  grassDark: 0x4c814d,
  player: 0x5de6c2,
  rivals: [0xff6b6b, 0x53a5ff, 0xf6c85f, 0xc986ff, 0xff8f4a],
  shadow: 0x07100c
};

const PLAYER_NAME = 'You';
const RIVAL_NAMES = ['Lime', 'Byte', 'Cloud', 'Candy', 'Turbo'];
const CAMERA_OFFSET = new THREE.Vector3(20, 24, 20);
const MUSIC_TRACK_URLS = [
  new URL('../Assets/musics/Vector Dash.mp3', import.meta.url).href,
  new URL('../Assets/musics/Neon Dash Run.mp3', import.meta.url).href
];
const MUSIC_VOLUME = 0.42;
const MUSIC_CROSSFADE = 6;
const TMP_VECTOR = new THREE.Vector3();
const TMP_VECTOR_B = new THREE.Vector3();
const TMP_PEDESTRIAN_VEC = new THREE.Vector3();
const TMP_BOX = new THREE.Box3();
const SHARED_PEDESTRIAN_SHADOW_GEO = new THREE.CircleGeometry(0.28, 18);
const SHARED_PEDESTRIAN_SHADOW_MAT = new THREE.MeshBasicMaterial({
  color: COLORS.shadow,
  transparent: true,
  opacity: 0.16,
  depthWrite: false
});

const ui = {
  canvas: document.querySelector('#game-canvas'),
  phase: document.querySelector('#phase-value'),
  time: document.querySelector('#time-value'),
  mass: document.querySelector('#mass-value'),
  unlock: document.querySelector('#unlock-value'),
  city: document.querySelector('#city-value'),
  cityMeter: document.querySelector('#city-meter'),
  cityProgress: document.querySelector('#city-progress'),
  score: document.querySelector('#score-value'),
  growthMeter: document.querySelector('#growth-meter'),
  rankList: document.querySelector('#rank-list'),
  center: document.querySelector('#center-state'),
  stateTitle: document.querySelector('#state-title'),
  stateDetail: document.querySelector('#state-detail'),
  stateAction: document.querySelector('#state-action'),
  touchStick: document.querySelector('#touch-stick'),
  touchKnob: document.querySelector('#touch-knob'),
  rankValue: document.querySelector('#rank-value'),
  threatAlert: document.querySelector('#threat-alert'),
  threatText: document.querySelector('#threat-text'),
  unlockBanner: document.querySelector('#unlock-banner')
};

class GameMusic {
  constructor(urls, volume, crossfade) {
    this.urls = urls;
    this.volume = volume;
    this.crossfade = crossfade;
    this.index = 0;
    this.unlocked = false;
    this.fading = false;
    this.platformMuted = false;
    this.current = this.createTrack(urls[0]);
    this.incoming = this.createTrack(urls[1] ?? urls[0]);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.suspend();
      else this.resume();
    });
  }

  createTrack(url) {
    const audio = new Audio(url);
    audio.preload = 'none';
    audio.volume = 0;
    audio.dataset.trackUrl = url;
    audio.addEventListener('ended', () => {
      if (this.current === audio) this.finishCrossfade();
    });
    return audio;
  }

  unlock() {
    if (this.platformMuted) return;
    if (this.unlocked) {
      this.resume();
      return;
    }
    this.unlocked = true;
    this.current.volume = this.volume;
    this.current.play().catch(() => {
      this.unlocked = false;
    });
  }

  update() {
    if (!this.unlocked || this.current.paused && !this.fading) return;
    const duration = this.current.duration;
    if (!Number.isFinite(duration) || duration <= 0) return;
    const remaining = Math.max(0, duration - this.current.currentTime);
    const fadeLength = Math.min(this.crossfade, duration * 0.45);

    if (!this.fading && remaining <= fadeLength) this.startCrossfade();
    if (!this.fading) return;

    const progress = THREE.MathUtils.clamp(1 - remaining / fadeLength, 0, 1);
    const ease = progress * progress * (3 - 2 * progress);
    this.current.volume = this.volume * (1 - ease);
    this.incoming.volume = this.volume * ease;
    if (progress >= 1) this.finishCrossfade();
  }

  startCrossfade() {
    if (this.fading) return;
    this.fading = true;
    this.incoming.currentTime = 0;
    this.incoming.volume = 0;
    this.incoming.play().catch(() => {});
  }

  finishCrossfade() {
    if (!this.fading && this.current.ended) this.startCrossfade();
    const outgoing = this.current;
    outgoing.pause();
    outgoing.currentTime = 0;
    outgoing.volume = 0;
    this.current = this.incoming;
    this.incoming = outgoing;
    this.current.volume = this.volume;
    this.index = (this.index + 1) % this.urls.length;
    const upcoming = this.urls[(this.index + 1) % this.urls.length];
    if (this.incoming.dataset.trackUrl !== upcoming) {
      this.incoming.dataset.trackUrl = upcoming;
      this.incoming.src = upcoming;
      this.incoming.load();
    }
    this.fading = false;
  }

  suspend() {
    if (!this.unlocked) return;
    this.current.pause();
    this.incoming.pause();
  }

  resume() {
    if (!this.unlocked || this.platformMuted || document.hidden) return;
    this.current.play().catch(() => {});
    if (this.fading) this.incoming.play().catch(() => {});
  }

  setPlatformMuted(muted) {
    this.platformMuted = Boolean(muted);
    if (this.platformMuted) this.suspend();
    else this.resume();
  }
}

class SlimopGame {
  constructor() {
    this.clock = new THREE.Clock();
    this.assets = { buildings: [], houses: [], cars: [], people: [], props: [] };
    this.items = [];
    this.slimes = [];
    this.hudState = createHudState();
    this.eatEffects = [];
    this.keys = new Set();
    this.playerInput = new THREE.Vector3();
    this.pointer = {
      active: false,
      id: null,
      originX: 0,
      originY: 0,
      x: 0,
      y: 0
    };

    this.phase = 1;
    this.elapsed = 0;
    this.levelMass = 1;
    this.cityMassLeft = 1;
    this.matchFinished = false;
    this.started = false;
    this.running = false;
    this.playerAlive = true;
    this.nextPhaseTimer = 0;
    this.worldSize = getWorldSettings(MAP_PROFILES[0]).worldSize;
    this.viewSize = 38;
    this.runSeed = readSeedFromUrl() ?? createRandomSeed();
    this.levelSequence = 0;
    this.levelSeed = this.runSeed;
    this.mapProfile = MAP_PROFILES[0];
    this.xRoads = [];
    this.zRoads = [];
    this.roads = [];
    this.blocks = [];
    this.trafficRoutes = [];
    this.sidewalkRoutes = [];
    this.structureFootprints = [];
    this.towerFootprints = [];
    this.structureOverlapCount = 0;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x9fc7ce);
    this.scene.fog = new THREE.Fog(0x9fc7ce, 70, 150);

    this.camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.5, 350);
    this.renderer = new THREE.WebGLRenderer({
      canvas: ui.canvas,
      antialias: true,
      preserveDrawingBuffer: false
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.levelGroup = new THREE.Group();
    this.scene.add(this.levelGroup);

    this.music = new GameMusic(MUSIC_TRACK_URLS, MUSIC_VOLUME, MUSIC_CROSSFADE);
    this.absorptionFeedback = new AbsorptionFeedback(document.querySelector('#absorption-feedback'));
    this.crazyGames = new CrazyGamesBridge();
    this.apocalypse = new SlimeApocalypseController(this);
    this.setupLights();
    this.setupInput();
    this.resize();
    window.addEventListener('resize', () => this.resize());
    ui.stateAction.addEventListener('click', () => this.handleStateAction());
  }

  async init() {
    this.showState('Loading', 'Building the city', false);
    const sdkInit = this.crazyGames.init((settings) => {
      this.music.setPlatformMuted(settings.muteAudio);
    });
    await sdkInit;
    this.crazyGames.loadingStart();
    await this.loadAssets();
    this.createLevel(this.phase);
    this.hideState();
    this.running = true;
    this.started = true;
    this.crazyGames.loadingStop();
    this.crazyGames.gameplayStart();
    this.crazyGames.setGameContext({ phase: String(this.phase), seed: String(this.levelSeed) });
    this.music.unlock();
    this.updateHud();
    this.animate();
    this.setupTestApi();
    requestAnimationFrame(() => {
      window.__SLIMOP_READY__ = true;
    });
  }

  setupTestApi() {
    if (!new URLSearchParams(window.location.search).has('testMode')) return;
    window.__SLIMOP_TEST__ = {
      feedback: () => ({ city: getCityProgress(this.levelMass, this.cityMassLeft), score: this.player.score,
        effects: this.eatEffects.length, groups: this.absorptionFeedback.activeCount,
        durations: this.eatEffects.map((effect) => effect.duration) }),
      consumeForFeedback: (type = 'prop', count = 1, rival = false) => {
        const slime = rival ? this.slimes.find((candidate) => !candidate.isPlayer && candidate.alive) : this.player;
        const items = this.items.filter((item) => item.active && (type === 'tower' ? item.tier === 'tower' : item.type === type));
        for (const item of items.slice(0, Math.min(count, 200))) {
          slime.mass = Math.max(slime.mass, massFromRadius(item.requiredRadius + 0.05));
          this.updateSlimeSize(slime);
          this.consumeItem(slime, item);
        }
        this.updateHud(0);
        this.absorptionFeedback.update(0, this.camera);
      },
      pauseCapture: (paused) => { this.capturePaused = paused; },
      advanceFeedback: (dt) => {
        this.updateEatEffects(dt);
        this.absorptionFeedback.update(dt, this.camera);
        this.renderer.render(this.scene, this.camera);
      },
      controls: () => {
        const direction = this.getMoveInput().clone();
        const origin = this.player.mesh.position.clone().project(this.camera);
        const projected = this.player.mesh.position.clone().add(direction).project(this.camera).sub(origin);
        return { direction: direction.toArray(), projected: projected.toArray(), keys: [...this.keys] };
      },
      viewDistrict: (district) => {
        const block = this.blocks.find((candidate) => candidate.district === district && candidate.width > 10 && candidate.depth > 10) ??
          this.blocks.find((candidate) => candidate.district === district);
        if (!block) return false;
        this.player.mesh.position.set(block.x, 0.035, block.z);
        this.updateCamera(1);
        this.renderer.render(this.scene, this.camera);
        return true;
      },
      world: () => ({
        worldSize: this.worldSize, roadSpacing: this.roadSpacing,
        generationMs: this.generationMs, bounds: this.worldBoundsAudit,
        entities: this.items.length, structures: this.structureFootprints.length,
        decor: this.decorCount, towers: this.towerFootprints.length,
        slimes: this.slimes.map((slime) => ({ x: slime.mesh.position.x, z: slime.mesh.position.z, alive: slime.alive })),
        blocks: this.blocks.length, roads: { x: this.xRoads, z: this.zRoads },
        validation: this.progressionValidation
      }),
      urban: () => ({
        districts: countDistricts(this.blocks), streets: this.streetNetwork,
        blocks: this.blocks.map((block) => ({ id: block.id, district: block.district, layout: block.layout,
          width: block.width, depth: block.depth, props: this.items.filter((item) => item.type === 'prop' && item.blockId === block.id).length })),
        industrialBuildings: this.items.filter((item) => item.industrial).length,
        industrialTrucks: this.items.filter((item) => item.heavy && item.district === 'industrial').length,
        parkedCars: this.items.filter((item) => item.parked).length,
        propsInBuildings: this.items.filter((item) => item.type === 'prop' && this.structureBounds.some((rect) => circleOverlapsRect(item.position.x, item.position.z, 0.6, rect))).length,
        overlappingProps: this.items.filter((item, index, items) => item.type === 'prop' && items.some((other, otherIndex) =>
          otherIndex < index && other.type === 'prop' && planarDistanceSq(item.position, other.position) < 1.29 ** 2)).length
      }),
      probeWorldLimits: () => {
        const slime = this.player;
        const original = slime.mesh.position.clone();
        const positions = [];
        for (const sign of [-1, 1]) {
          slime.mesh.position.set(sign * 1e6, 0.035, sign * 1e6);
          this.moveSlime(slime, new THREE.Vector3(), 1 / 60);
          positions.push({ x: slime.mesh.position.x, z: slime.mesh.position.z });
        }
        slime.mesh.position.copy(original);
        return { limit: getWorldLimit(this.worldSize, slime.radius), positions };
      },
      batchTerrain: () => batchTerrain(this.levelGroup),
      profile: () => {
        const entityRoots = new Set([...this.items.map((item) => item.mesh), ...this.slimes.map((slime) => slime.mesh)]);
        const roots = { terrain: this.levelGroup.children.filter((child) => !entityRoots.has(child)), slimes: this.slimes.map((slime) => slime.mesh) };
        for (const item of this.items) (roots[item.type] ??= []).push(item.mesh);
        return profileFrame(this.renderer, this.scene, this.camera, roots);
      },
      advanceFrames: (count) => {
        for (let frame = 0; frame < Math.min(200, count); frame += 1) this.update(1 / 60);
        this.lastDebugAt = -Infinity;
        this.updateHud(0);
      },
      snapshot: () => ({
        finished: this.matchFinished, running: this.running, elapsed: this.elapsed,
        hud: { ...this.hudState },
        player: { mass: this.player.mass, score: this.player.score, radius: this.player.radius,
          x: this.player.mesh.position.x, y: this.player.mesh.position.y, z: this.player.mesh.position.z },
        performance: this.performanceMetrics
      }),
      expire: () => { this.elapsed = MATCH_CONFIG.durationSeconds; this.checkPhaseState(0); this.updateHud(); },
      triggerApocalypse: () => this.apocalypse.triggerApocalypse(),
      apocalypseState: () => ({
        active: this.apocalypse.active,
        wave: this.apocalypse.wave,
        projectiles: this.apocalypse.projectiles.length,
        triggered: this.apocalypse.triggered
      }),
      combat: (ratio, protectedStart = false) => {
        this.elapsed = protectedStart ? 0 : MATCH_CONFIG.playerStartProtectionSeconds + 1;
        const rival = this.slimes.find((slime) => !slime.isPlayer && slime.alive);
        this.player.radius = rival.radius * ratio;
        this.player.mesh.position.copy(rival.mesh.position);
        this.resolveSlimeCombat();
        return { playerAlive: this.player.alive, rivalAlive: rival.alive, score: this.player.score };
      },
      startPhase: (phase) => {
        this.createLevel(phase);
        this.updateHud();
        const tierCounts = {};
        for (const item of this.items) tierCounts[item.tier] = (tierCounts[item.tier] ?? 0) + 1;
        return {
          validation: this.progressionValidation,
          tierCounts,
          towers: this.items.filter((item) => item.tier === 'tower').length
        };
      },
      walkConsumptionProgression: () => {
        const consumedTiers = [];
        let safety = this.items.length + 1;

        while (this.items.some((item) => item.active) && safety > 0) {
          safety -= 1;
          const item = this.items
            .filter((candidate) => candidate.active && this.canEatItem(this.player, candidate))
            .sort((a, b) => a.requiredRadius - b.requiredRadius)[0];
          if (!item) break;
          if (!consumedTiers.includes(item.tier)) consumedTiers.push(item.tier);
          this.consumeItem(this.player, item);
        }

        this.updateHud();
        this.checkPhaseState(0.016);
        return {
          consumedTiers,
          remaining: this.items.filter((item) => item.active).length,
          playerRadius: this.player.radius,
          phaseComplete: !this.running && this.cityMassLeft <= 0.5
        };
      }
    };
  }

  setupLights() {
    this.scene.background = new THREE.Color(0xb2d8f7);
    this.scene.fog = new THREE.FogExp2(0xb2d8f7, 0.0042);

    const hemi = new THREE.HemisphereLight(0xeef7ff, 0x485a44, 1.85);
    this.scene.add(hemi);
    this.hemi = hemi;

    const sun = new THREE.DirectionalLight(0xfff3da, 3.2);
    sun.position.set(-28, 48, 30);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 130;
    sun.shadow.camera.left = -60;
    sun.shadow.camera.right = 60;
    sun.shadow.camera.top = 60;
    sun.shadow.camera.bottom = -60;
    sun.shadow.bias = -0.0004;
    this.scene.add(sun);
    this.scene.add(sun.target);
    this.sun = sun;

    const fill = new THREE.DirectionalLight(0x8fbfff, 1.1);
    fill.position.set(30, 26, -34);
    this.scene.add(fill);
    this.fill = fill;
  }

  setupInput() {
    const unlockMusic = () => this.music.unlock();
    window.addEventListener('pointerdown', unlockMusic, { capture: true });
    window.addEventListener('keydown', (event) => {
      if (event.target?.matches?.('input, textarea, [contenteditable="true"]')) return;
      const key = event.key.toLowerCase();
      if (!this.running || !MOVEMENT_KEYS.includes(key)) return;
      unlockMusic();
      this.keys.add(key);
      event.preventDefault();
    });
    window.addEventListener('keyup', (event) => {
      this.keys.delete(event.key.toLowerCase());
    });

    ui.canvas.addEventListener('pointerdown', (event) => {
      if (!this.running || !this.playerAlive) return;
      if (this.pointer.active || (event.pointerType === 'mouse' && event.button !== 0)) return;
      this.pointer.active = true;
      this.pointer.id = event.pointerId;
      this.pointer.originX = event.clientX;
      this.pointer.originY = event.clientY;
      this.pointer.x = event.clientX;
      this.pointer.y = event.clientY;
      ui.canvas.setPointerCapture(event.pointerId);
      ui.touchStick.classList.add('active');
      ui.touchStick.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
      this.updateTouchKnob();
    });

    ui.canvas.addEventListener('pointermove', (event) => {
      if (!this.pointer.active || event.pointerId !== this.pointer.id) return;
      this.pointer.x = event.clientX;
      this.pointer.y = event.clientY;
      this.updateTouchKnob();
    });

    const clearPointer = (event) => {
      if (event.pointerId !== this.pointer.id) return;
      this.pointer.active = false;
      this.pointer.id = null;
      ui.touchStick.classList.remove('active');
      ui.touchKnob.style.transform = 'translate(0, 0)';
    };

    ui.canvas.addEventListener('pointerup', clearPointer);
    ui.canvas.addEventListener('pointercancel', clearPointer);
    ui.canvas.addEventListener('lostpointercapture', clearPointer);
    window.addEventListener('blur', () => this.resetInput());
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.resetInput(); });
  }

  resetInput() {
    this.keys.clear();
    if (this.pointer.id !== null && ui.canvas.hasPointerCapture(this.pointer.id)) {
      ui.canvas.releasePointerCapture(this.pointer.id);
    }
    this.pointer.active = false;
    this.pointer.id = null;
    ui.touchStick.classList.remove('active');
    ui.touchKnob.style.transform = 'translate(0, 0)';
    this.player?.velocity.set(0, 0, 0);
  }

  updateTouchKnob() {
    const vector = this.getPointerVector();
    ui.touchKnob.style.transform = `translate(${vector.x * 31}px, ${vector.y * 31}px)`;
  }

  async loadAssets() {
    const [buildings, houses, cars, people, props] = await Promise.all([
      Promise.all(BUILDING_MODEL_URLS.map((url) => this.loadGltf(url, CITY_TEXTURE_URL))),
      Promise.all(HOUSE_MODEL_URLS.map((url) => this.loadGltf(url, CITY_TEXTURE_URL))),
      Promise.all(CAR_MODEL_URLS.map((url) => this.loadGltf(url, CAR_TEXTURE_URL))),
      Promise.all(CHARACTER_MODEL_URLS.map((url) => this.loadGltf(url, CHARACTER_TEXTURE_URL))),
      Promise.all(
        PROP_MODEL_URLS.map((url, index) => this.loadGltf(url, index < 6 ? CITY_TEXTURE_URL : CAR_TEXTURE_URL))
      )
    ]);

    this.assets.buildings = buildings.filter(Boolean);
    this.assets.houses = houses.filter(Boolean);
    this.assets.cars = cars.filter(Boolean);
    this.assets.people = people.filter(Boolean);
    this.assets.props = props.filter(Boolean);
  }

  loadGltf(url, textureUrl) {
    return new Promise((resolve) => {
      const manager = new THREE.LoadingManager();
      manager.setURLModifier((resourceUrl) =>
        resourceUrl.replaceAll('\\', '/').endsWith('Textures/colormap.png') ? textureUrl : resourceUrl
      );
      const loader = new GLTFLoader(manager);
      loader.load(
        url,
        (gltf) => {
          resolve(prepareLoadedObject(gltf.scene));
        },
        undefined,
        () => resolve(null)
      );
    });
  }

  createLevel(phase) {
    const generationStart = performance.now();
    this.clearLevel();
    this.matchFinished = false;
    this.hudState = createHudState();
    this.lastDebugAt = -Infinity;
    this.resetInput();
    this.occludedBuildings = new Set();
    this.phase = phase;
    this.elapsed = 0;
    this.nextPhaseTimer = 0;
    this.playerAlive = true;

    this.levelSeed = mixSeed(this.runSeed, phase * 733, this.levelSequence * 104729);
    this.levelSequence += 1;

    const rng = createRng(this.levelSeed);
    this.mapProfile = pick(rng, MAP_PROFILES);
    Object.assign(this, getWorldSettings(this.mapProfile, phase));
    this.levelGroup = new THREE.Group();
    this.scene.add(this.levelGroup);

    this.createGround(rng);
    this.createRoadGrid(rng);
    const params = new URLSearchParams(window.location.search);
    this.terrainBatchStats = params.has('testMode') && params.has('unbatchedTerrain')
      ? null : batchTerrain(this.levelGroup);
    this.populateCity(rng);
    this.createExteriorBackdrop(rng);
    this.spawnSlimes(rng);
    this.ensureProgressionBalance(rng);
    this.worldBoundsAudit = auditWorldBounds([...this.items, ...this.slimes], this.worldSize);
    this.generationMs = performance.now() - generationStart;

    this.levelMass = this.items.reduce((sum, item) => sum + item.mass, 0);
    this.cityMassLeft = this.levelMass;
    this.running = true;
    this.hideState();
    this.resize();
    this.updateCamera(1);
    this.updateHud(0);
  }

  clearLevel() {
    this.absorptionFeedback?.reset();
    this.apocalypse?.reset();
    if (this.levelGroup) {
      this.scene.remove(this.levelGroup);
      disposeObject(this.levelGroup);
    }
    this.items = [];
    this.decorCount = 0;
    this.decorReservations = [];
    this.parkingReservations = [];
    this.structureBounds = [];
    this.slimes = [];
    this.eatEffects = [];
    this.blocks = [];
    this.trafficRoutes = [];
    this.sidewalkRoutes = [];
    this.structureFootprints = [];
    this.towerFootprints = [];
    this.structureOverlapCount = 0;
    this.debugTrafficId = null;
    this.debugPedestrianId = null;
    if (this.occludedBuildings) {
      this.occludedBuildings.clear();
    }
  }

  createGround(rng) {
    // Outer natural terrain apron: expansive lush suburban grass skirt
    // Extending far past the city perimeter (+260 units), preventing any abrupt void edges or "tabuleiro cortado".
    const outerSkirtSize = this.worldSize + 260;
    const outerApron = new THREE.Mesh(
      new THREE.PlaneGeometry(outerSkirtSize, outerSkirtSize),
      new THREE.MeshStandardMaterial({
        color: 0x4f8245,
        roughness: 0.96
      })
    );
    outerApron.rotation.x = -Math.PI / 2;
    outerApron.position.y = -0.006;
    outerApron.receiveShadow = true;
    this.levelGroup.add(outerApron);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(this.worldSize + WORLD_CONFIG.groundPadding * 2, this.worldSize + WORLD_CONFIG.groundPadding * 2),
      new THREE.MeshStandardMaterial({
        color: 0x222624,
        roughness: 0.94
      })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    this.levelGroup.add(ground);
  }

  createExteriorBackdrop(rng) {
    this.exteriorGroup = new THREE.Group();
    this.exteriorGroup.name = 'exterior_backdrop';
    this.levelGroup.add(this.exteriorGroup);

    const half = this.worldSize / 2;
    const limit = getWorldLimit(this.worldSize);

    // 1. Natural treeline clusters framing the 4 cardinal borders (exterior greenbelt)
    const treeCount = 48;
    for (let i = 0; i < treeCount; i += 1) {
      const side = i % 4;
      const along = randomRange(rng, -half - 15, half + 15);
      const depth = randomRange(rng, limit + 4, limit + 34);

      let x = 0;
      let z = 0;
      if (side === 0) { x = along; z = depth; }
      else if (side === 1) { x = along; z = -depth; }
      else if (side === 2) { x = depth; z = along; }
      else { x = -depth; z = along; }

      const tree = createTreeMesh(rng);
      tree.position.set(x, 0, z);
      tree.rotation.y = rng() * Math.PI * 2;
      tree.scale.multiplyScalar(randomRange(rng, 1.1, 1.55));
      tree.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = false;
          node.receiveShadow = true;
        }
      });
      this.exteriorGroup.add(tree);
    }

    // 2. Peripheral suburban houses outside the playable boundaries
    if (this.assets.houses.length > 0) {
      const houseCount = 12;
      for (let i = 0; i < houseCount; i += 1) {
        const side = i % 4;
        const along = randomRange(rng, -half * 0.8, half * 0.8);
        const depth = randomRange(rng, limit + 8, limit + 22);

        let x = 0;
        let z = 0;
        let rotY = 0;
        if (side === 0) { x = along; z = depth; rotY = Math.PI; }
        else if (side === 1) { x = along; z = -depth; rotY = 0; }
        else if (side === 2) { x = depth; z = along; rotY = -Math.PI / 2; }
        else { x = -depth; z = along; rotY = Math.PI / 2; }

        const housePrefab = pick(rng, this.assets.houses);
        const house = cloneAndFit(housePrefab, randomRange(rng, 5.0, 7.2), null, { castShadow: false, receiveShadow: true });
        house.position.set(x, 0.01, z);
        house.rotation.y = rotY + randomRange(rng, -0.2, 0.2);
        this.exteriorGroup.add(house);
      }
    }

    // 3. Low peripheral rolling berms / horizon mounds framing the landscape
    const bermGeo = new THREE.CylinderGeometry(14, 22, 2.4, 7);
    const bermMat = new THREE.MeshStandardMaterial({
      color: 0x46753c,
      roughness: 0.98,
      flatShading: true
    });
    const bermCount = 16;
    for (let i = 0; i < bermCount; i += 1) {
      const angle = (i / bermCount) * Math.PI * 2 + rng() * 0.2;
      const radius = limit + randomRange(rng, 48, 72);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const berm = new THREE.Mesh(bermGeo, bermMat);
      berm.position.set(x, -0.2, z);
      berm.rotation.y = rng() * Math.PI;
      berm.scale.set(randomRange(rng, 1.2, 1.9), randomRange(rng, 0.8, 1.3), randomRange(rng, 1.2, 1.9));
      berm.receiveShadow = true;
      this.exteriorGroup.add(berm);
    }
  }

  createRoadGrid(rng) {
    const roadMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.asphalt,
      roughness: 0.88
    });
    const sidewalkMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.sidewalk,
      roughness: 0.86
    });
    const curbMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.curb,
      roughness: 0.72
    });
    const laneMaterial = new THREE.MeshBasicMaterial({
      color: 0xf7f4df
    });

    const half = this.worldSize / 2;
    this.xRoads = createStreetAxis(rng, half, this.roadSpacing);
    this.zRoads = createStreetAxis(rng, half, this.roadSpacing * randomRange(rng, 0.96, 1.06));
    this.roads = [...new Set([...this.xRoads, ...this.zRoads])].sort((a, b) => a - b);
    this.trafficRoutes = [];
    this.sidewalkRoutes = [];

    const centerXRoads = this.xRoads.filter((road) => Math.abs(road) <= this.worldSize * 0.22);
    const centerZRoads = this.zRoads.filter((road) => Math.abs(road) <= this.worldSize * 0.22);
    this.cityCenter = new THREE.Vector2(
      pick(rng, centerXRoads.length ? centerXRoads : [0]),
      pick(rng, centerZRoads.length ? centerZRoads : [0])
    );
    const avenueXRoads = this.xRoads.filter((road) => Math.abs(road) > this.roadSpacing * 0.7);
    const avenueZRoads = this.zRoads.filter((road) => Math.abs(road) > this.roadSpacing * 0.7);
    this.streetNetwork = {
      x: describeStreets(this.xRoads, this.roadWidth, pick(rng, avenueXRoads.length ? avenueXRoads : [0])),
      z: describeStreets(this.zRoads, this.roadWidth, 0)
    };

    for (const z of this.zRoads) {
      this.addFlatRect(0, z, this.worldSize + 4, this.roadWidthAt('x', z), roadMaterial, 0.01);
      this.addRoadEdgeSegments('x', z, sidewalkMaterial, curbMaterial);
      this.addLaneMarks('x', z, laneMaterial, rng);
      this.addTrafficRoutes('x', z);
    }

    for (const x of this.xRoads) {
      this.addFlatRect(x, 0, this.roadWidthAt('z', x), this.worldSize + 4, roadMaterial, 0.011);
      this.addRoadEdgeSegments('z', x, sidewalkMaterial, curbMaterial);
      this.addLaneMarks('z', x, laneMaterial, rng);
      this.addTrafficRoutes('z', x);
    }

    this.createCityBlocks(rng);
  }

  addRoadEdgeSegments(axis, roadCenter, sidewalkMaterial, curbMaterial) {
    const half = this.worldSize / 2;
    const crossStreets = this.streetNetwork[axis];
    const intervals = streetIntervals(crossStreets, half);
    const width = this.roadWidthAt(axis, roadCenter);
    const sideAxisOffset = width / 2 + 0.58;
    const curbOffset = width / 2 + 0.08;

    for (const [start, end] of intervals) {
      if (end - start < 1.8) continue;
      const center = (start + end) / 2;
      const length = end - start;
      for (const side of [-1, 1]) {
        if (axis === 'x') {
          this.addFlatRect(center, roadCenter + side * sideAxisOffset, length, 0.94, sidewalkMaterial, 0.022);
          this.addFlatRect(center, roadCenter + side * curbOffset, length, 0.16, curbMaterial, 0.025);
        } else {
          this.addFlatRect(roadCenter + side * sideAxisOffset, center, 0.94, length, sidewalkMaterial, 0.023);
          this.addFlatRect(roadCenter + side * curbOffset, center, 0.16, length, curbMaterial, 0.026);
        }
      }
    }
  }

  addLaneMarks(axis, roadCenter, material, rng) {
    const half = this.worldSize / 2;
    const crossStreets = this.streetNetwork[axis];
    const dashLength = 2.25;

    for (let p = -half + 1.8 + rng() * 1.2; p < half; p += 7.15) {
      const crossesIntersection = crossStreets.some((street) => Math.abs(p - street.coordinate) < street.width / 2 + dashLength / 2);
      if (crossesIntersection || rng() < 0.1) continue;

      if (axis === 'x') {
        this.addFlatRect(p, roadCenter, dashLength, 0.075, material, 0.015);
      } else {
        this.addFlatRect(roadCenter, p, 0.075, dashLength, material, 0.016);
      }
    }
  }

  addTrafficRoutes(axis, roadCenter) {
    const half = this.worldSize / 2 + WORLD_CONFIG.trafficPadding;
    const laneOffset = this.roadWidthAt(axis, roadCenter) * 0.24;
    const sideAxis = axis === 'x' ? 'z' : 'x';

    for (const side of [-1, 1]) {
      this.trafficRoutes.push({
        axis,
        sideAxis,
        sideValue: roadCenter + side * laneOffset,
        direction: side < 0 ? 1 : -1,
        min: -half,
        max: half
      });
    }
  }

  roadWidthAt(axis, coordinate) {
    return this.streetNetwork[axis === 'x' ? 'z' : 'x'].find((street) => street.coordinate === coordinate).width;
  }

  createCityBlocks(rng) {
    const sidewalkMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.sidewalk,
      roughness: 0.9
    });
    const concreteMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.concrete,
      roughness: 0.92
    });
    const plazaMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.plaza,
      roughness: 0.82
    });
    const lotMaterial = new THREE.MeshStandardMaterial({
      color: 0x6fa95f,
      roughness: 0.94
    });
    const seamMaterial = new THREE.MeshBasicMaterial({
      color: 0x7f867f,
      transparent: true,
      opacity: 0.5
    });
    const yardMaterial = new THREE.MeshStandardMaterial({ color: 0x8b9296, roughness: 0.94 });
    const parkingMaterial = new THREE.MeshStandardMaterial({ color: 0x565e5c, roughness: 0.9 });
    const markMaterial = new THREE.MeshBasicMaterial({ color: 0xe1d9b7 });
    this.blocks = createUrbanBlocks(this.streetNetwork, this.worldSize, this.roadSpacing,
      { x: this.cityCenter.x, z: this.cityCenter.y }, rng);
    for (const block of this.blocks) {
      const { x, z, width, depth, district } = block;
      const innerWidth = width - 2.05;
      const innerDepth = depth - 2.05;
      const hasLawn = district === 'park' || (block.residential && block.layout === 'court');
      this.addFlatRect(x, z, width - 0.08, depth - 0.08,
        block.downtown || district === 'commercial' ? plazaMaterial : sidewalkMaterial, 0.028);
      this.addFlatRect(x, z, innerWidth, innerDepth,
        hasLawn ? lotMaterial : district === 'industrial' ? yardMaterial : concreteMaterial, 0.03);
      if (district === 'park') {
        this.addFlatRect(x, z, innerWidth, 0.65, sidewalkMaterial, 0.032);
        this.addFlatRect(x, z, 0.65, innerDepth, sidewalkMaterial, 0.033);
      }
      for (const area of block.reservedAreas) {
        this.addFlatRect((area.minX + area.maxX) / 2, (area.minZ + area.maxZ) / 2,
          area.maxX - area.minX, area.maxZ - area.minZ, parkingMaterial, 0.031);
      }
      for (const spot of block.parkingSpots) {
        this.addFlatRect(spot.x - 1.2, spot.z, 0.06, 2.5, markMaterial, 0.032);
        this.addFlatRect(spot.x, spot.z + 1.25, 2.4, 0.06, markMaterial, 0.032);
      }
      this.addFlatRect(x, block.minZ + 0.95, width - 0.3, 0.055, seamMaterial, 0.034);
      if (block.layout === 'court') this.addFlatRect(block.minX + 0.95, z, 0.055, depth - 0.3, seamMaterial, 0.035);
      this.addSidewalkRoutesForBlock(block);
    }
  }

  addSidewalkRoutesForBlock(block) {
    const margin = 0.76;
    const minX = block.minX + margin;
    const maxX = block.maxX - margin;
    const minZ = block.minZ + margin;
    const maxZ = block.maxZ - margin;
    if (maxX - minX > 1.8) {
      this.sidewalkRoutes.push({ axis: 'x', sideAxis: 'z', sideValue: block.minZ + 0.5, min: minX, max: maxX });
      this.sidewalkRoutes.push({ axis: 'x', sideAxis: 'z', sideValue: block.maxZ - 0.5, min: minX, max: maxX });
    }
    if (maxZ - minZ > 1.8) {
      this.sidewalkRoutes.push({ axis: 'z', sideAxis: 'x', sideValue: block.minX + 0.5, min: minZ, max: maxZ });
      this.sidewalkRoutes.push({ axis: 'z', sideAxis: 'x', sideValue: block.maxX - 0.5, min: minZ, max: maxZ });
    }
  }

  addFlatRect(x, z, width, depth, material, y) {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, y, z);
    mesh.receiveShadow = true;
    this.levelGroup.add(mesh);
    return mesh;
  }

  populateCity(rng) {
    this.structureFootprints = [];
    this.towerFootprints = [];
    const carTarget = scalePopulation(22 + this.phase * 3);
    const pedestrianTarget = scalePopulation(115 + this.phase * 15);

    const blocksByStartDistance = [...this.blocks].sort(
      (a, b) => Math.hypot(a.x, a.z) - Math.hypot(b.x, b.z)
    );
    for (const block of blocksByStartDistance) {
      this.populateBlock(block, rng);
    }
    for (const block of blocksByStartDistance) {
      this.ensureBlockHasStructure(block, rng);
    }
    this.structureOverlapCount = countStructureOverlaps(this.structureFootprints);
    this.structureBounds = this.items.filter((item) => ['building', 'house'].includes(item.type)).map((item) => {
      TMP_BOX.setFromObject(item.mesh);
      return { minX: TMP_BOX.min.x, maxX: TMP_BOX.max.x, minZ: TMP_BOX.min.z, maxZ: TMP_BOX.max.z };
    });
    this.decorReservations = [];
    this.parkingReservations = [];
    const parkingTarget = Math.round(carTarget * 0.25);
    const parkingBlocks = [...this.blocks].filter((block) => block.parkingSpots.length)
      .sort((a, b) => Number(b.district === 'industrial') - Number(a.district === 'industrial'));
    for (const block of parkingBlocks) {
      for (const position of block.parkingSpots) {
        if (this.parkingReservations.length >= parkingTarget) break;
        if (this.structureBounds.some((rect) => circleOverlapsRect(position.x, position.z, 1.1, rect))) continue;
        const route = { axis: 'z', sideAxis: 'x', sideValue: position.x, direction: 1, min: block.minZ, max: block.maxZ };
        const item = this.createVehicleItem(route, position.z, Math.round(randomRange(rng, 11.5, 19) + this.phase * 1.1), rng,
          { parked: true, heavy: block.district === 'industrial' });
        if (!item) continue;
        item.district = block.district;
        item.blockId = block.id;
        this.parkingReservations.push(position);
        this.addItem(item);
      }
    }
    const quotas = allocateDecor(this.blocks, WORLD_CONFIG.maxDecor);
    for (const block of this.blocks) this.addBlockDecor(block, rng, quotas.get(block.id));

    const trafficReservations = new Map();
    for (let i = this.parkingReservations.length; i < carTarget; i += 1) {
      for (let attempt = 0; attempt < 20; attempt += 1) {
        const route = pick(rng, this.trafficRoutes);
        const along = randomRange(rng, route.min, route.max);
        if (!this.reserveTrafficSlot(trafficReservations, route, along)) continue;
        const mass = Math.round(randomRange(rng, 11.5, 19) + this.phase * 1.1);
        const x = route.axis === 'x' ? along : route.sideValue;
        const z = route.axis === 'z' ? along : route.sideValue;
        const block = [...this.blocks].sort((a, b) => (a.x - x) ** 2 + (a.z - z) ** 2 - ((b.x - x) ** 2 + (b.z - z) ** 2))[0];
        const item = this.createVehicleItem(route, along, mass, rng, { heavy: block.district === 'industrial' });
        if (item) item.district = block.district;
        this.addItem(item);
        break;
      }
    }

    for (let i = 0; i < pedestrianTarget; i += 1) {
      this.addItem(this.createPedestrianItem(rng));
    }
  }

  populateBlock(block, rng) {
    const lots = this.planBlockLots(block, rng);

    for (const lot of lots) {
      if (lot.kind === 'house') {
        const item = this.createHouseItem(lot.x, lot.z, lot.footprint, rng);
        if (item) { item.district = block.district; item.blockId = block.id; }
        this.addItem(item);
      } else {
        const mass = Math.round((lot.tower ? 72 : 34) + lot.footprint * lot.footprint * (lot.tower ? 4.7 : 3.3) + this.phase * 3.1);
        const item = this.createBuildingItem(lot.x, lot.z, lot.footprint, mass, rng, lot.tower, block.district === 'industrial');
        if (item) { item.district = block.district; item.blockId = block.id; }
        this.addItem(item);
      }
    }

  }

  ensureBlockHasStructure(block, rng) {
    if (block.district === 'park' || this.blockHasReservedStructure(block)) return;

    const lots = [];
    const kind = block.district === 'residential' ? 'house' : 'building';
    for (const position of [{ x: block.x, z: block.z },
      { x: block.x - block.width * 0.24, z: block.z + block.depth * 0.22 },
      { x: block.x + block.width * 0.24, z: block.z + block.depth * 0.22 }]) {
      if (this.tryReserveLot(lots, block, position.x, position.z, 1.42, kind, false)) break;
    }

    for (const lot of lots) {
      if (lot.kind === 'house') {
        const item = this.createHouseItem(lot.x, lot.z, lot.footprint, rng);
        if (item) { item.district = block.district; item.blockId = block.id; }
        this.addItem(item);
      } else {
        const mass = Math.round(26 + lot.footprint * lot.footprint * 2.8 + this.phase * 2.1);
        const item = this.createBuildingItem(lot.x, lot.z, lot.footprint, mass, rng, false, block.district === 'industrial');
        if (item) { item.district = block.district; item.blockId = block.id; }
        this.addItem(item);
      }
    }
  }

  blockHasReservedStructure(block) {
    return this.structureFootprints.some(
      (footprint) =>
        footprint.x >= block.minX &&
        footprint.x <= block.maxX &&
        footprint.z >= block.minZ &&
        footprint.z <= block.maxZ
    );
  }

  planBlockLots(block, rng) {
    const lots = [];
    if (block.district === 'park') return lots;

    const maxFootprint = Math.min(3.7, Math.max(1.35, Math.min(block.width, block.depth) - 1.85));
    if (maxFootprint < 1.55) return lots;
    if (block.district === 'industrial') {
      const positions = createLotPositions(block, block.width > 10 ? 2 : 1, rng);
      for (const position of positions) {
        this.tryReserveLot(lots, block, position.x, position.z, Math.min(maxFootprint, randomRange(rng, 2.9, 3.6)), 'building', false);
      }
      return lots;
    }

    if (block.district === 'downtown') {
      const tower = maxFootprint > 2.65 && (this.towerFootprints.length === 0 || rng() > 0.86);
      const footprint = THREE.MathUtils.clamp(tower ? randomRange(rng, 2.55, 3.15) : randomRange(rng, 2.05, 2.72), 1.65, maxFootprint);
      const jitter = Math.max(0, Math.min(block.width, block.depth) - footprint - 2.3) * 0.2;
      this.tryReserveLot(lots, block, block.x + randomRange(rng, -jitter, jitter), block.z + randomRange(rng, -jitter, jitter), footprint, 'building', tower);

      if (!tower && Math.max(block.width, block.depth) > 6.35 && rng() > 0.22) {
        const sideFootprint = THREE.MathUtils.clamp(randomRange(rng, 1.55, 1.95), 1.35, maxFootprint * 0.68);
        const offset = Math.max(sideFootprint * 1.25, Math.min(block.width, block.depth) * 0.23);
        const alongX = block.width >= block.depth;
        this.tryReserveLot(
          lots,
          block,
          block.x + (alongX ? offset * (rng() > 0.5 ? 1 : -1) : randomRange(rng, -0.35, 0.35)),
          block.z + (alongX ? randomRange(rng, -0.35, 0.35) : offset * (rng() > 0.5 ? 1 : -1)),
          sideFootprint,
          'building',
          false
        );
      }
      if (!lots.length) {
        this.tryReserveLot(lots, block, block.x, block.z, Math.max(1.55, maxFootprint * 0.86), 'building', false);
      }
      return lots;
    }

    const longEnoughForTwo = Math.max(block.width, block.depth) > 5.85 && Math.min(block.width, block.depth) > 5.0;
    const longEnoughForThree = Math.max(block.width, block.depth) > 8.4 && Math.min(block.width, block.depth) > 6.2;
    const lotCount = block.district === 'commercial'
      ? 1 + Number(longEnoughForTwo && rng() > 0.34)
      : 1 + Number(longEnoughForTwo) + Number(longEnoughForThree && rng() > 0.48);
    const adjustedLotCount = Math.min(
      3,
      lotCount + Number(block.nearStart && longEnoughForTwo && block.district !== 'commercial' && rng() > 0.42)
    );
    const positions = createLotPositions(block, adjustedLotCount, rng);

    for (const position of positions) {
      const isCommercial = block.district === 'commercial';
      const multiLot = adjustedLotCount > 1;
      const footprint = THREE.MathUtils.clamp(
        isCommercial
          ? randomRange(rng, multiLot ? 1.38 : 1.82, multiLot ? 1.88 : 2.5)
          : randomRange(rng, multiLot ? 1.34 : 1.95, multiLot ? 1.82 : 2.55),
        1.35,
        maxFootprint
      );
      this.tryReserveLot(lots, block, position.x, position.z, footprint, isCommercial ? 'building' : 'house', false);
    }

    if (!lots.length) {
      const isCommercial = block.district === 'commercial';
      this.tryReserveLot(lots, block, block.x, block.z, Math.max(1.55, maxFootprint * 0.86), isCommercial ? 'building' : 'house', false);
    }

    return lots;
  }

  tryReserveLot(lots, block, x, z, footprint, kind, tower) {
    if (!Number.isFinite(x) || !Number.isFinite(z)) throw new Error('Invalid lot coordinates');
    if (this.structureFootprints.length >= WORLD_CONFIG.maxStructures ||
      (tower && this.towerFootprints.length >= WORLD_CONFIG.maxTowers)) return false;
    let fittedFootprint = footprint;

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const radius = getStructureRadius(kind, fittedFootprint);
      const margin = Math.max(0.72, radius * 0.52);
      const minX = block.minX + margin + radius;
      const maxX = block.maxX - margin - radius;
      const minZ = block.minZ + margin + radius;
      const maxZ = block.maxZ - margin - radius;

      if (minX > maxX || minZ > maxZ) {
        fittedFootprint *= 0.88;
        continue;
      }

      const placedX = THREE.MathUtils.clamp(x, minX, maxX);
      const placedZ = THREE.MathUtils.clamp(z, minZ, maxZ);
      const blocked = this.structureFootprints.some((other) => {
        const dx = placedX - other.x;
        const dz = placedZ - other.z;
        const buffer = tower || other.tower ? 1.8 : 0.72;
        const minDistance = radius + other.radius + buffer;
        return dx * dx + dz * dz < minDistance * minDistance;
      });
      const blocksAccess = block.reservedAreas.some((rect) => circleOverlapsRect(placedX, placedZ, radius, rect));
      if (blocked || blocksAccess || (tower && !this.canPlaceTower(placedX, placedZ))) {
        fittedFootprint *= 0.9;
        continue;
      }

      this.structureFootprints.push({ x: placedX, z: placedZ, radius, kind, tower });
      if (tower) this.towerFootprints.push({ x: placedX, z: placedZ, radius: 8.8 });
      lots.push({ x: placedX, z: placedZ, footprint: fittedFootprint, kind, tower });
      return true;
    }

    return false;
  }

  canPlaceTower(x, z) {
    return !this.towerFootprints.some((other) => {
      const dx = x - other.x;
      const dz = z - other.z;
      const minDistance = other.radius;
      return dx * dx + dz * dz < minDistance * minDistance;
    });
  }

  addBlockDecor(block, rng, target) {
    if (this.decorCount >= WORLD_CONFIG.maxDecor) return;
    const placed = [];
    for (let i = 0; i < target && this.decorCount < WORLD_CONFIG.maxDecor; i += 1) {
      const kind = decorKind(block.district, i);
      const candidate = decorCandidate(block, i);
      const pos = this.decorPositionClear(candidate) ? candidate : this.pickDecorPosition(block, rng, placed, block.district === 'park');
      if (!pos) continue;
      placed.push(pos);
      this.decorReservations.push(pos);
      const item = kind === 'tree' ? this.createTreeItem(pos.x, pos.z, rng) : this.createPropItem(pos.x, pos.z, rng, kind);
      if (item) { item.district = block.district; item.blockId = block.id; item.propKind = kind; }
      this.addItem(item);
    }
  }

  decorPositionClear(position) {
    return !this.structureBounds.some((rect) => circleOverlapsRect(position.x, position.z, 0.65, rect)) &&
      !this.decorReservations.some((other) => Math.hypot(position.x - other.x, position.z - other.z) < 1.3) &&
      !this.parkingReservations.some((other) => Math.hypot(position.x - other.x, position.z - other.z) < 1.85);
  }

  reserveTrafficSlot(reservations, route, along) {
    const key = `${route.axis}:${route.sideValue.toFixed(2)}`;
    const existing = reservations.get(key) ?? [];
    const minGap = 3.1;
    if (existing.some((position) => Math.abs(position - along) < minGap)) return false;
    existing.push(along);
    reservations.set(key, existing);
    return true;
  }

  addItem(item) {
    if (!item) return;
    if (item.type === 'prop') this.decorCount += 1;
    item.id = item.id ?? createId();
    this.items.push(item);
    this.levelGroup.add(item.mesh);
  }

  pickDecorPosition(block, rng, placed, preferInterior) {
    const minGap = 1.3;
    for (let attempt = 0; attempt < 14; attempt += 1) {
      const useInterior = preferInterior ? attempt < 12 : attempt < 8;
      const pos = useInterior
        ? this.pickBlockOpenPosition(block, rng, preferInterior ? 1.4 : 1.2)
        : this.pickBlockEdgePosition(block, rng);
      const blockedByDecor = placed.some((other) => {
        const dx = pos.x - other.x;
        const dz = pos.z - other.z;
        return dx * dx + dz * dz < minGap * minGap;
      });
      if (this.decorPositionClear(pos) && !blockedByDecor) return pos;
    }
    return null;
  }

  pickBlockEdgePosition(block, rng) {
    const side = Math.floor(rng() * 4);
    if (side === 0) return { x: randomRange(rng, block.minX + 0.8, block.maxX - 0.8), z: block.minZ + 0.62 };
    if (side === 1) return { x: randomRange(rng, block.minX + 0.8, block.maxX - 0.8), z: block.maxZ - 0.62 };
    if (side === 2) return { x: block.minX + 0.62, z: randomRange(rng, block.minZ + 0.8, block.maxZ - 0.8) };
    return { x: block.maxX - 0.62, z: randomRange(rng, block.minZ + 0.8, block.maxZ - 0.8) };
  }

  pickBlockOpenPosition(block, rng, margin) {
    return {
      x: randomRange(rng, block.minX + margin, block.maxX - margin),
      z: randomRange(rng, block.minZ + margin, block.maxZ - margin)
    };
  }

  createBuildingItem(x, z, footprint, mass, rng, tower, industrial = false) {
    const towerPrefabs = this.assets.buildings.slice(-5);
    const regularPrefabs = this.assets.buildings.slice(0, -5);
    const sourcePrefabs = tower ? towerPrefabs : regularPrefabs.length ? regularPrefabs : this.assets.buildings;
    const prefab = industrial ? pick(rng, this.assets.houses.slice(-2)) : sourcePrefabs.length ? pick(rng, sourcePrefabs) : null;
    if (!prefab) return null;
    const mesh = cloneAndFit(prefab, footprint);
    if (industrial) mesh.scale.y *= 0.65;
    mesh.position.set(x, 0.032, z);
    mesh.rotation.y = Math.round(rng() * 3) * (Math.PI / 2);
    mesh.userData.baseScale = mesh.scale.clone();
    mesh.userData.spinSpeed = randomRange(rng, -0.28, 0.28);

    const entityStats = createEntityStats(
      tower ? 'tower' : 'building',
      THREE.MathUtils.clamp((footprint - 1.35) / 2, 0, 1)
    );
    return {
      ...entityStats,
      tower,
      industrial,
      active: true,
      mesh,
      mass,
      radius: footprint * 0.68,
      position: mesh.position,
      eatenBy: null
    };
  }

  createHouseItem(x, z, footprint, rng) {
    if (!this.assets.houses.length) return null;
    const mesh = cloneAndFit(pick(rng, this.assets.houses), footprint);
    mesh.position.set(x, 0.032, z);
    mesh.rotation.y = Math.round(rng() * 3) * (Math.PI / 2);
    mesh.userData.baseScale = mesh.scale.clone();
    mesh.userData.spinSpeed = randomRange(rng, -0.45, 0.45);

    return {
      ...createEntityStats('house', THREE.MathUtils.clamp((footprint - 1.35) / 1.4, 0, 1)),
      active: true,
      mesh,
      mass: Math.round(randomRange(rng, 18, 28) + footprint * 4.2 + this.phase * 1.3),
      radius: footprint * 0.62,
      position: mesh.position,
      eatenBy: null
    };
  }

  createVehicleItem(route, along, mass, rng, options = {}) {
    if (!this.assets.cars.length) return null;
    const mesh = cloneAndFit(pick(rng, options.heavy ? this.assets.cars.slice(7, 10) : this.assets.cars), randomRange(rng, 1.65, 2.15));
    const horizontal = route.axis === 'x';
    const direction = route.direction;
    const x = horizontal ? along : route.sideValue;
    const z = horizontal ? route.sideValue : along;
    mesh.position.set(x, 0.018, z);
    mesh.rotation.y = horizontal ? (direction > 0 ? Math.PI / 2 : -Math.PI / 2) : direction > 0 ? 0 : Math.PI;
    mesh.userData.baseScale = mesh.scale.clone();
    mesh.userData.spinSpeed = randomRange(rng, -0.8, 0.8);

    return {
      ...createEntityStats('vehicle', THREE.MathUtils.clamp((mass - 11.5) / 12, 0, 1)),
      active: true,
      mesh,
      mass,
      radius: 1.05,
      position: mesh.position,
      eatenBy: null,
      parked: Boolean(options.parked),
      heavy: Boolean(options.heavy),
      motion: options.parked ? null : {
        kind: 'traffic',
        axis: route.axis,
        sideAxis: route.sideAxis,
        sideValue: route.sideValue,
        direction,
        min: route.min,
        max: route.max,
        baseY: 0.018,
        speed: randomRange(rng, 2.4, 4.8),
        seed: rng() * Math.PI * 2
      }
    };
  }

  createPedestrianItem(rng) {
    if (!this.assets.people.length || !this.sidewalkRoutes.length) return null;
    const route = pick(rng, this.sidewalkRoutes);
    const horizontal = route.axis === 'x';
    const direction = rng() > 0.5 ? 1 : -1;
    const routePadding = Math.min(1.9, Math.max(0, (route.max - route.min) * 0.24));
    const along = randomRange(rng, route.min + routePadding, route.max - routePadding);
    const x = horizontal ? along : route.sideValue;
    const z = horizontal ? route.sideValue : along;
    const mesh = cloneAndFit(pick(rng, this.assets.people), 0.94, 1.2, { castShadow: false, receiveShadow: true });
    const shadow = new THREE.Mesh(SHARED_PEDESTRIAN_SHADOW_GEO, SHARED_PEDESTRIAN_SHADOW_MAT);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.01;
    mesh.add(shadow);
    const moveDirection = horizontal
      ? new THREE.Vector3(direction, 0, 0)
      : new THREE.Vector3(0, 0, direction);

    mesh.position.set(x, 0.026, z);
    mesh.rotation.y = Math.atan2(-moveDirection.x, -moveDirection.z);
    mesh.userData.baseScale = mesh.scale.clone();
    mesh.userData.spinSpeed = randomRange(rng, -1.1, 1.1);

    return {
      ...createEntityStats('person', 0.12),
      active: true,
      mesh,
      mass: randomRange(rng, 0.85, 1.28),
      radius: 0.48,
      position: mesh.position,
      eatenBy: null,
      motion: {
        kind: 'pedestrian',
        axis: route.axis,
        sideAxis: route.sideAxis,
        sideValue: route.sideValue,
        min: route.min,
        max: route.max,
        direction: moveDirection,
        baseY: 0.026,
        speed: randomRange(rng, 0.85, 1.35),
        seed: rng() * Math.PI * 2,
        travelled: 0
      }
    };
  }

  createTreeItem(x, z, rng) {
    const mesh = createTreeMesh(rng);
    mesh.position.set(x, 0.032, z);
    mesh.rotation.y = rng() * Math.PI * 2;
    mesh.userData.baseScale = mesh.scale.clone();
    mesh.userData.spinSpeed = randomRange(rng, -0.7, 0.7);

    return {
      ...createEntityStats('prop', 0.48),
      active: true,
      mesh,
      mass: randomRange(rng, 0.8, 1.8),
      radius: 0.45,
      position: mesh.position,
      eatenBy: null
    };
  }

  createPropItem(x, z, rng, kind = 'random') {
    if (!this.assets.props.length) return null;
    const indices = { cone: [6], crate: [7], parasol: [4, 5] }[kind];
    const prefabs = indices ? indices.map((index) => this.assets.props[index]).filter(Boolean) : this.assets.props;
    const mesh = cloneAndFit(pick(rng, prefabs.length ? prefabs : this.assets.props), randomRange(rng, 0.58, kind === 'cone' ? 0.72 : 1.15));
    mesh.position.set(x, 0.032, z);
    mesh.rotation.y = rng() * Math.PI * 2;
    mesh.userData.baseScale = mesh.scale.clone();
    mesh.userData.spinSpeed = randomRange(rng, -1, 1);

    return {
      ...createEntityStats('prop', 0.68),
      active: true,
      mesh,
      mass: randomRange(rng, 0.9, 2.4),
      radius: 0.55,
      position: mesh.position,
      eatenBy: null
    };
  }

  cloneAndFit(prefab, footprint, targetHeight = null, options = {}) {
    return cloneAndFit(prefab, footprint, targetHeight, options);
  }

  spawnSlimes(rng) {
    this.player = this.createSlime({
      name: PLAYER_NAME,
      color: COLORS.player,
      mass: 4.4 + this.phase * 0.55,
      position: new THREE.Vector3(0, 0.035, 0),
      isPlayer: true
    });
    this.slimes.push(this.player);
    this.levelGroup.add(this.player.mesh);

    const rivalCount = MATCH_CONFIG.rivalCount;
    for (let i = 0; i < rivalCount; i += 1) {
      const angle = (i / rivalCount) * Math.PI * 2 + rng() * 0.8;
      const radius = this.worldSize * randomRange(rng, 0.28, 0.43);
      const spawn = findRoadSpawn(this.xRoads, this.zRoads,
        { x: Math.cos(angle) * radius, z: Math.sin(angle) * radius },
        this.slimes.map((slime) => slime.mesh.position), this.structureFootprints);
      const personality = getBotPersonality(i);
      const rival = this.createSlime({
        name: RIVAL_NAMES[i],
        color: COLORS.rivals[i % COLORS.rivals.length],
        mass: randomRange(rng, 4.6, 8.6 + this.phase * 0.9),
        position: new THREE.Vector3(spawn.x, 0.035, spawn.z),
        isPlayer: false
      });
      rival.ai = {
        personality,
        target: null,
        wander: new THREE.Vector3(Math.cos(angle + Math.PI), 0, Math.sin(angle + Math.PI)),
        timer: rng() * 2,
        wakeAt: 1.1 + rng() * 1.4,
        currentIntent: 'explore'
      };
      this.slimes.push(rival);
      this.levelGroup.add(rival.mesh);
    }
  }

  ensureProgressionBalance(rng) {
    const getStartingMasses = () => this.slimes.filter((slime) => slime.alive).map((slime) => slime.mass);
    let validation = validateCompetitiveProgression(this.items, getStartingMasses());
    let additions = 0;

    while (!validation.valid && additions < 120) {
      const item = this.createPedestrianItem(rng);
      if (!item) break;
      this.addItem(item);
      additions += 1;
      validation = validateCompetitiveProgression(this.items, getStartingMasses());
    }

    this.progressionValidation = { ...validation, additions };
  }

  createSlime({ name, color, mass, position, isPlayer }) {
    const mesh = createSlimeMesh(color, isPlayer);
    mesh.position.copy(position);
    const slime = {
      id: createId(),
      name,
      mass,
      eatenMass: 0,
      score: 0,
      color,
      radius: 1,
      speed: 1,
      mesh,
      velocity: new THREE.Vector3(),
      direction: new THREE.Vector3(0, 0, -1),
      isPlayer,
      alive: true,
      feel: createSlimeFeelState()
    };
    this.updateSlimeSize(slime);
    return slime;
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    if (this.capturePaused) { this.clock.getDelta(); return; }
    const frameStart = performance.now();
    const dt = Math.min(this.clock.getDelta(), 0.1);
    this.update(dt);
    this.music.update();
    this.renderer.render(this.scene, this.camera);
    this.performanceMetrics ??= { frames: 0, cpuFrameMs: 0, drawCalls: 0, triangles: 0 };
    this.performanceMetrics.frames += 1;
    this.performanceMetrics.cpuFrameMs += (performance.now() - frameStart - this.performanceMetrics.cpuFrameMs) * 0.05;
    this.performanceMetrics.drawCalls = this.renderer.info.render.calls;
    this.performanceMetrics.triangles = this.renderer.info.render.triangles;
  }

  update(dt) {
    if (this.running) {
      this.elapsed += dt;
      this.apocalypse?.update(dt, this.elapsed);
      this.updatePlayer(dt);
      this.updateRivals(dt);
      for (const slime of this.slimes) { if (slime.alive) updateSlimeFeel(slime, dt); }
      this.updateCityLife(dt);
      this.resolveEating();
      this.resolveSlimeCombat();
      this.updateAbsorbCues(dt);
      this.updateCamera(dt);
      this.updateEatEffects(dt);
      this.updateHud(dt);
      this.checkPhaseState(dt);
    } else {
      this.updateEatEffects(dt);
    }
    this.absorptionFeedback.update(dt, this.camera);
  }

  updatePlayer(dt) {
    if (!this.player?.alive) return;
    const input = this.getMoveInput();
    this.moveSlime(this.player, input, dt);
  }

  updateRivals(dt) {
    for (const slime of this.slimes) {
      if (slime.isPlayer || !slime.alive) continue;
      const input = this.getAiInput(slime, dt);
      this.moveSlime(slime, input, dt);
    }
  }

  updateCityLife(dt) {
    const bound = getWorldLimit(this.worldSize);
    for (const item of this.items) {
      if (!item.active || !item.motion) continue;

      if (item.motion.kind === 'traffic') {
        this.updateTrafficItem(item, dt, bound);
      } else if (item.motion.kind === 'pedestrian') {
        this.updatePedestrianItem(item, dt, bound);
      }
    }
  }

  updateTrafficItem(item, dt, bound) {
    const motion = item.motion;
    const axis = motion.axis;
    item.position[axis] += motion.direction * motion.speed * dt;
    item.position[motion.sideAxis] = THREE.MathUtils.lerp(item.position[motion.sideAxis], motion.sideValue, 0.28);
    item.position.y = motion.baseY + Math.sin(this.elapsed * 6 + motion.seed) * 0.012;

    if (item.position[axis] > motion.max) item.position[axis] = motion.min;
    if (item.position[axis] < motion.min) item.position[axis] = motion.max;
  }

  updatePedestrianItem(item, dt, bound) {
    const motion = item.motion;
    const previousX = item.position.x;
    const previousZ = item.position.z;

    let speed = motion.speed;
    const walkingDirection = motion.axis === 'x'
      ? TMP_VECTOR.set(motion.direction.x || 1, 0, 0)
      : TMP_VECTOR.set(0, 0, motion.direction.z || 1);
    let desired = walkingDirection;
    const distToPlayerSq = this.player?.alive
      ? planarDistanceSq(this.player.mesh.position, item.position)
      : Infinity;
    const threat = distToPlayerSq < 2500
      ? this.findNearestSlimeToPosition(item.position, () => true, 2.2)
      : null;
    if (threat) {
      desired = TMP_PEDESTRIAN_VEC.copy(item.position).sub(threat.mesh.position).setY(0);
      if (desired.lengthSq() > 0.001) desired.normalize();
      speed *= 1.25;
    }

    motion.direction.lerp(desired, 1 - Math.pow(0.003, dt));
    if (motion.direction.lengthSq() > 0.001) motion.direction.normalize();

    item.position.addScaledVector(motion.direction, speed * dt);
    if (!threat) {
      item.position[motion.sideAxis] = THREE.MathUtils.lerp(item.position[motion.sideAxis], motion.sideValue, 0.18);
      if (item.position[motion.axis] > motion.max) {
        item.position[motion.axis] = motion.max;
        motion.direction[motion.axis] *= -1;
      }
      if (item.position[motion.axis] < motion.min) {
        item.position[motion.axis] = motion.min;
        motion.direction[motion.axis] *= -1;
      }
    }
    if (Math.abs(item.position.x) > bound) {
      item.position.x = THREE.MathUtils.clamp(item.position.x, -bound, bound);
      motion.direction.x *= -1;
    }
    if (Math.abs(item.position.z) > bound) {
      item.position.z = THREE.MathUtils.clamp(item.position.z, -bound, bound);
      motion.direction.z *= -1;
    }

    item.position.y = motion.baseY + Math.sin(this.elapsed * 10 + motion.seed) * 0.02;
    item.mesh.rotation.y = Math.atan2(-motion.direction.x, -motion.direction.z);
    motion.travelled += Math.hypot(item.position.x - previousX, item.position.z - previousZ);
  }

  updateAbsorbCues() {
    if (!this.player?.alive) return;
    for (const item of this.items) {
      if (!item.active || !item.mesh.userData.baseScale) continue;
      const nearPlayer = planarDistanceSq(this.player.mesh.position, item.position) < 64;
      const canEat = nearPlayer && this.canEatItem(this.player, item);
      const pulse = canEat ? 1 + Math.sin(this.elapsed * 8 + item.mass) * 0.035 : 1;
      const baseScale = item.mesh.userData.baseScale;
      item.mesh.scale.lerp(TMP_VECTOR.set(baseScale.x * pulse, baseScale.y * pulse, baseScale.z * pulse), 0.18);
    }
  }

  getMoveInput() {
    const keyboardActive = MOVEMENT_KEYS.some((key) => this.keys.has(key));
    const axes = keyboardActive ? keyboardAxes(this.keys) : this.getPointerVector();
    return cameraRelativeDirection(this.camera, axes.x, axes.y, this.playerInput);
  }

  getPointerVector() {
    if (!this.pointer.active) return { x: 0, y: 0 };
    const dx = this.pointer.x - this.pointer.originX;
    const dy = this.pointer.y - this.pointer.originY;
    const length = Math.hypot(dx, dy);
    const cap = 48;
    if (length < 4) return { x: 0, y: 0 };
    const scale = Math.min(1, length / cap) / length;
    return { x: dx * scale, y: dy * scale };
  }

  getAiInput(slime, dt) {
    const ai = slime.ai;
    if (this.elapsed < ai.wakeAt) return TMP_VECTOR.set(0, 0, 0);
    ai.timer -= dt;

    if (ai.timer <= 0) {
      ai.timer = randomRange(Math.random, 0.8, 2.2);
      const angle = Math.random() * Math.PI * 2;
      ai.wander.set(Math.cos(angle), 0, Math.sin(angle));
    }

    // Bot hazard avoidance: flee from falling object telegraph impact zones
    if (this.apocalypse?.active) {
      const hazards = this.apocalypse.getHazardZones();
      for (const hazard of hazards) {
        const dx = slime.mesh.position.x - hazard.x;
        const dz = slime.mesh.position.z - hazard.z;
        const distSq = dx * dx + dz * dz;
        const safeRadius = hazard.radius + slime.radius;
        if (distSq < safeRadius * safeRadius) {
          const dist = Math.sqrt(distSq);
          if (dist > 0.001) {
            return TMP_VECTOR.set(dx / dist, 0, dz / dist);
          }
        }
      }
    }

    const protectPlayerStart = this.elapsed < MATCH_CONFIG.playerStartProtectionSeconds;
    const protectedRadiusSq = Math.pow(this.roadSpacing * 1.75, 2);

    return updateBotDecision(slime, {
      slimes: this.slimes,
      items: this.items,
      canEatItem: (s, it) => this.canEatItem(s, it),
      matchTimeLeft: getMatchTimeLeft(this.elapsed),
      worldSize: this.worldSize,
      protectPlayer: protectPlayerStart,
      playerRadiusSq: protectedRadiusSq
    }, dt);
  }

  findNearestSlime(slime, predicate, maxDistance) {
    let nearest = null;
    let nearestDistSq = maxDistance * maxDistance;
    for (const other of this.slimes) {
      if (other === slime || !other.alive || !predicate(other)) continue;
      const distSq = planarDistanceSq(slime.mesh.position, other.mesh.position);
      if (distSq < nearestDistSq) {
        nearest = other;
        nearestDistSq = distSq;
      }
    }
    return nearest;
  }

  findNearestSlimeToPosition(position, predicate, maxDistance) {
    let nearest = null;
    let nearestDistSq = maxDistance * maxDistance;
    for (const slime of this.slimes) {
      if (!slime.alive || !predicate(slime)) continue;
      const distSq = planarDistanceSq(position, slime.mesh.position);
      if (distSq < nearestDistSq) {
        nearest = slime;
        nearestDistSq = distSq;
      }
    }
    return nearest;
  }

  findNearestItem(slime, predicate, maxDistance) {
    let nearest = null;
    let nearestDistSq = maxDistance * maxDistance;
    for (const item of this.items) {
      if (!item.active || !predicate(item)) continue;
      const distSq = planarDistanceSq(slime.mesh.position, item.position);
      if (distSq < nearestDistSq) {
        nearest = item;
        nearestDistSq = distSq;
      }
    }
    return nearest;
  }

  moveSlime(slime, input, dt) {
    const current = slime.mesh.position;
    if (input.lengthSq() > 0.001) {
      slime.direction.lerp(input, 1 - Math.pow(0.001, dt)).normalize();
      slime.mesh.rotation.y = Math.atan2(-slime.direction.x, -slime.direction.z);
    }
    advanceMovement(current, slime.velocity, input, slime.speed, dt);
    const limit = getWorldLimit(this.worldSize, slime.radius);
    const softMargin = 2.4;
    for (const axis of ['x', 'z']) {
      const distFromLimit = limit - Math.abs(current[axis]);
      if (distFromLimit < softMargin && distFromLimit > 0) {
        if (Math.sign(current[axis]) === Math.sign(slime.velocity[axis])) {
          const damping = Math.max(0.18, (distFromLimit / softMargin) ** 1.5);
          slime.velocity[axis] *= damping;
        }
      }
    }
    current.x = THREE.MathUtils.clamp(current.x, -limit, limit);
    current.z = THREE.MathUtils.clamp(current.z, -limit, limit);
    current.y = 0.035;
  }

  resolveEating() {
    for (const slime of this.slimes) {
      if (!slime.alive) continue;
      for (const item of this.items) {
        if (!item.active || !this.canEatItem(slime, item)) continue;
        if (!slime.isPlayer && this.elapsed < MATCH_CONFIG.playerStartProtectionSeconds &&
          item.position.x ** 2 + item.position.z ** 2 <= (this.roadSpacing * 1.75) ** 2) continue;
        const reach = slime.radius * 0.9 + item.radius * 0.58;
        if (planarDistanceSq(slime.mesh.position, item.position) <= reach * reach) {
          this.consumeItem(slime, item);
        }
      }
    }
  }

  canEatItem(slime, item) {
    return slime.radius >= (item.requiredRadius ?? item.radius * 1.6);
  }

  consumeItem(slime, item) {
    if (!item.active || !slime.alive) return;
    item.active = false;
    item.eatenBy = slime.id;
    this.cityMassLeft = Math.max(0, this.cityMassLeft - item.mass);
    slime.eatenMass += item.mass;
    const points = calculateItemScore(item);
    slime.score += points;
    slime.mass += item.mass * MASS_GAIN_FACTOR;
    this.updateSlimeSize(slime);
    const profile = getAbsorptionProfile(item);
    triggerAbsorbPulse(slime, profile.pulse);
    if (slime.isPlayer) this.absorptionFeedback.emit(points, slime.mesh.position, profile.pulse);

    const start = item.mesh.position.clone();
    const baseScale = item.mesh.scale.clone();
    const baseRotation = item.mesh.rotation.clone();
    this.queueEatEffect({
      ...profile,
      mesh: item.mesh,
      target: slime,
      start,
      baseScale,
      baseRotation,
      spin: item.mesh.userData.spinSpeed ?? 1.2,
      age: 0
    });
  }

  resolveSlimeCombat() {
    for (let i = 0; i < this.slimes.length; i += 1) {
      const a = this.slimes[i];
      if (!a.alive) continue;
      for (let j = i + 1; j < this.slimes.length; j += 1) {
        if (!a.alive || this.matchFinished) break;
        const b = this.slimes[j];
        if (!b.alive) continue;
        if ((a.isPlayer || b.isPlayer) && this.elapsed < MATCH_CONFIG.playerStartProtectionSeconds) continue;
        const distSq = planarDistanceSq(a.mesh.position, b.mesh.position);

        if (canConsumeSlime(a.radius, b.radius)) {
          const reach = a.radius * 0.92 + b.radius * 0.5;
          if (distSq <= reach * reach) {
            this.consumeSlime(a, b);
            continue;
          }
        } else if (canConsumeSlime(b.radius, a.radius)) {
          const reach = b.radius * 0.92 + a.radius * 0.5;
          if (distSq <= reach * reach) {
            this.consumeSlime(b, a);
            continue;
          }
        } else {
          const bumpReach = (a.radius + b.radius) * 0.72;
          if (distSq <= bumpReach * bumpReach) {
            this.bumpSlimes(a, b);
          }
        }
      }
    }
  }

  bumpSlimes(a, b) {
    const delta = a.mesh.position.clone().sub(b.mesh.position).setY(0);
    if (delta.lengthSq() < 0.001) delta.set(1, 0, 0);
    delta.normalize();
    a.mesh.position.addScaledVector(delta, 0.04);
    b.mesh.position.addScaledVector(delta, -0.04);
  }

  consumeSlime(predator, prey) {
    if (!predator.alive || !prey.alive) return;
    prey.alive = false;
    predator.mass += prey.mass * 0.66;
    predator.eatenMass += prey.mass;
    const points = Math.max(1, Math.round(prey.score * 0.4 + prey.mass * 50));
    predator.score += points;
    this.updateSlimeSize(predator);
    const profile = getAbsorptionProfile({ type: 'slime', mass: prey.mass });
    triggerAbsorbPulse(predator, profile.pulse);
    if (predator.isPlayer) this.absorptionFeedback.emit(points, predator.mesh.position, profile.pulse);

    this.queueEatEffect({
      ...profile,
      mesh: prey.mesh,
      target: predator,
      start: prey.mesh.position.clone(),
      baseScale: prey.mesh.scale.clone(),
      baseRotation: prey.mesh.rotation.clone(),
      spin: 1.4,
      age: 0,
      removeSlime: true
    });

    if (prey.isPlayer) {
      this.playerAlive = false;
      this.finishMatch('Eaten!');
    }
  }

  updateEatEffects(dt) {
    for (let i = this.eatEffects.length - 1; i >= 0; i -= 1) {
      const effect = this.eatEffects[i];
      const finished = updateEatEffectItem(effect, dt);
      if (finished) {
        this.releaseEatEffect(effect);
        this.eatEffects.splice(i, 1);
      }
    }
  }

  releaseEatEffect(effect) {
    if (effect.mesh.parent) effect.mesh.parent.remove(effect.mesh);
    disposeObject(effect.mesh);
  }

  queueEatEffect(effect) {
    if (this.eatEffects.length >= FEEDBACK_CONFIG.maxEffects) this.releaseEatEffect(this.eatEffects.shift());
    this.eatEffects.push(effect);
  }

  updateSlimeSize(slime) {
    slime.radius = radiusFromMass(slime.mass);
    slime.speed = getSlimeSpeed(slime.radius, slime.isPlayer);
    slime.mesh.scale.set(slime.radius, slime.radius, slime.radius);
  }

  updateCamera(dt) {
    if (!this.player) return;
    const radius = this.player.radius || 1;

    // Perspective 3D arcade follow camera: elevated, angled downward, perfectly framed
    // Elevated perspective gives a grand sense of the expanded urban landscape
    const targetHeight = 19.5 + radius * 3.6;
    const targetDistance = 16.0 + radius * 3.0;

    const playerPos = this.player.mesh.position;
    const targetCamX = playerPos.x;
    const targetCamY = targetHeight;
    const targetCamZ = playerPos.z + targetDistance;

    const followLerp = 1 - Math.pow(0.001, dt);
    this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, targetCamX, followLerp);
    this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, targetCamY, followLerp);
    this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, targetCamZ, followLerp);

    // Apocalypse camera shake
    if (this.apocalypse?.cameraShakeTrauma > 0) {
      const shake = this.apocalypse.cameraShakeTrauma * this.apocalypse.cameraShakeTrauma * 0.45;
      this.camera.position.x += (Math.random() - 0.5) * shake;
      this.camera.position.z += (Math.random() - 0.5) * shake;
      this.camera.position.y += (Math.random() - 0.5) * shake * 0.4;
    }

    const lookTarget = new THREE.Vector3(playerPos.x, 0.35, playerPos.z - radius * 0.7);
    this.camera.lookAt(lookTarget);
    // Keep the existing light direction and shadow detail while following the
    // active neighborhood, rather than enlarging the shadow map to the whole city.
    this.sun.position.set(playerPos.x - 28, 48, playerPos.z + 30);
    this.sun.target.position.set(playerPos.x, 0, playerPos.z);
    this.sun.target.updateMatrixWorld();

    this.updateBuildingOcclusion();
  }

  updateBuildingOcclusion() {
    if (!this.player?.alive) return;
    const playerPos = this.player.mesh.position;
    const camPos = this.camera.position;
    const currentlyOccluded = new Set();

    for (const item of this.items) {
      if (!item.active || (item.type !== 'building' && item.type !== 'house')) continue;
      const bPos = item.position;
      if (bPos.z > playerPos.z - 1.0 && bPos.z < camPos.z) {
        const dx = Math.abs(bPos.x - playerPos.x);
        const threshold = (item.radius || 2.0) + this.player.radius * 0.55;
        if (dx < threshold) {
          currentlyOccluded.add(item);
        }
      }
    }

    if (!this.occludedBuildings) this.occludedBuildings = new Set();

    for (const item of this.occludedBuildings) {
      if (!currentlyOccluded.has(item)) {
        this.setStructureOpacity(item, 1.0, false);
      }
    }

    for (const item of currentlyOccluded) {
      if (!this.occludedBuildings.has(item)) {
        this.setStructureOpacity(item, 0.35, true);
      }
    }

    this.occludedBuildings = currentlyOccluded;
  }

  setStructureOpacity(item, opacity, transparent) {
    if (!item.mesh) return;
    item.mesh.traverse((child) => {
      if (child.isMesh && child.material) {
        if (!child.userData.ownMaterial) {
          child.material = Array.isArray(child.material)
            ? child.material.map((m) => m.clone())
            : child.material.clone();
          child.userData.ownMaterial = true;
        }
        if (Array.isArray(child.material)) {
          child.material.forEach((mat) => {
            mat.transparent = transparent;
            mat.opacity = opacity;
          });
        } else {
          child.material.transparent = transparent;
          child.material.opacity = opacity;
        }
      }
    });
  }

  resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.renderer.setSize(width, height, false);
    this.applyCameraProjection();
  }

  applyCameraProjection() {
    if (this.camera.isPerspectiveCamera) {
      const width = Math.max(1, window.innerWidth);
      const height = Math.max(1, window.innerHeight);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }
  }

  updateHud(dt = 0) {
    const hudInfo = updateHudState(this.hudState, this.player?.radius ?? 0, this.elapsed, dt);
    this.hudState.renderDelay = (this.hudState.renderDelay ?? 0) + dt;
    if (dt > 0 && this.hudState.renderDelay < FEEDBACK_CONFIG.hudInterval) return;
    this.hudState.renderDelay = 0;
    const city = getCityProgress(this.levelMass, this.cityMassLeft);
    const progress = city.fraction;
    setText(ui.phase, String(this.phase));
    setText(ui.time, formatTime(hudInfo.timeLeft));
    if (hudInfo.isUrgent) {
      ui.time.classList.add('time-urgent');
    } else {
      ui.time.classList.remove('time-urgent');
    }
    setText(ui.mass, String(Math.floor(this.player?.mass ?? 0)));
    setText(ui.score, `${Math.floor(this.player?.score ?? 0)} pts`);
    setText(ui.unlock, hudInfo.unlock
      ? `${hudInfo.unlock.label}: ${Math.round(hudInfo.unlock.progress * 100)}%`
      : 'All sizes unlocked');
    ui.growthMeter.style.width = `${(hudInfo.unlock?.progress ?? 1) * 100}%`;
    setText(ui.city, city.label);
    ui.cityMeter.style.width = `${city.percentage}%`;
    ui.cityMeter.style.minWidth = city.fraction > 0 ? '2px' : '0';
    ui.cityProgress.setAttribute('aria-valuenow', String(Number(city.percentage.toFixed(3))));
    ui.cityProgress.setAttribute('aria-valuetext', `${city.label} consumed by all slimes`);

    const playerRank = calculatePlayerRank(this.player, this.slimes);
    if (ui.rankValue) {
      setText(ui.rankValue, `#${playerRank}`);
    }

    const threatInfo = detectNearbyThreat(this.player, this.slimes, 14);
    if (threatInfo && ui.threatAlert) {
      ui.threatAlert.classList.remove('hidden');
      if (ui.threatText) {
        setText(ui.threatText, `Danger! ${threatInfo.threat.name} nearby`);
      }
    } else if (ui.threatAlert) {
      ui.threatAlert.classList.add('hidden');
    }

    if (hudInfo.bannerText && ui.unlockBanner) {
      setText(ui.unlockBanner, hudInfo.bannerText);
      ui.unlockBanner.classList.remove('hidden');
      ui.unlockBanner.classList.toggle('apocalypse', Boolean(this.hudState?.isApocalypse));
    } else if (ui.unlockBanner) {
      ui.unlockBanner.classList.add('hidden');
      ui.unlockBanner.classList.remove('apocalypse');
      if (this.hudState) this.hudState.isApocalypse = false;
    }

    const ranked = rankSlimes(this.slimes).slice(0, 5);
    renderLeaderboard(ui.rankList, ranked);

    if (!new URLSearchParams(window.location.search).has('testMode')) return;
    const now = performance.now();
    if (now - (this.lastDebugAt ?? -Infinity) < 250) return;
    this.lastDebugAt = now;
    const activeItems = this.items.filter((item) => item.active);
    if (!this.debugTrafficId) this.debugTrafficId = activeItems.find((item) => item.motion?.kind === 'traffic')?.id ?? null;
    if (!this.debugPedestrianId) {
      this.debugPedestrianId =
        activeItems.find((item) => item.motion?.kind === 'pedestrian' && distanceToRouteEnd(item) > 1.5)?.id ??
        activeItems.find((item) => item.motion?.kind === 'pedestrian')?.id ??
        null;
    }
    const firstTraffic =
      activeItems.find((item) => item.id === this.debugTrafficId) ??
      activeItems.find((item) => item.motion?.kind === 'traffic');
    const firstPedestrian =
      activeItems.find((item) => item.id === this.debugPedestrianId) ??
      activeItems.find((item) => item.motion?.kind === 'pedestrian');
    const trafficFacingScores = activeItems
      .filter((item) => item.motion?.kind === 'traffic')
      .map((item) => getForwardDot(item.mesh.rotation.y, item.motion.axis, item.motion.direction));
    const progressionAudit = calculateProgressionAudit(activeItems, this.player?.mass ?? 0);
    window.__SLIMOP_DEBUG__ = {
      mapSeed: this.levelSeed,
      worldSize: this.worldSize,
      generationMs: this.generationMs,
      worldBoundsAudit: this.worldBoundsAudit,
      performance: this.performanceMetrics,
      mapProfile: this.mapProfile?.name,
      itemsLeft: activeItems.length,
      cityProgress: progress,
      roadCounts: {
        x: this.xRoads.length,
        z: this.zRoads.length
      },
      districts: countDistricts(this.blocks),
      trafficRoutes: this.trafficRoutes.length,
      sidewalkRoutes: this.sidewalkRoutes.length,
      structureOverlaps: this.structureOverlapCount,
      towers: this.towerFootprints.length,
      emptyNearStartBlocks: countEmptyBlocksNearStart(this.blocks, activeItems, this.viewSize * 0.72),
      assetCounts: {
        buildings: this.assets.buildings.length,
        houses: this.assets.houses.length,
        cars: this.assets.cars.length,
        people: this.assets.people.length,
        props: this.assets.props.length
      },
      playerRadius: this.player?.radius ?? 0,
      movingItems: activeItems.filter((item) => item.motion).length,
      people: activeItems.filter((item) => item.type === 'person').length,
      vehicles: activeItems.filter((item) => item.type === 'vehicle').length,
      props: activeItems.filter((item) => item.type === 'prop').length,
      houses: activeItems.filter((item) => item.type === 'house').length,
      structures: activeItems.filter((item) => item.type === 'building' || item.type === 'house').length,
      cityBlocks: this.blocks.length,
      eatableTypes: [...new Set(activeItems.filter((item) => this.canEatItem(this.player, item)).map((item) => item.type))],
      lockedTypes: [...new Set(activeItems.filter((item) => !this.canEatItem(this.player, item)).map((item) => item.type))],
      progressionAudit,
      progressionValidation: this.progressionValidation,
      entityCatalogValidation: validateEntityCatalog(),
      match: {
        durationSeconds: MATCH_CONFIG.durationSeconds,
        elapsed: this.elapsed,
        timeLeft: getMatchTimeLeft(this.elapsed),
        finished: this.matchFinished,
        apocalypse: { active: this.apocalypse?.active ?? false, wave: this.apocalypse?.wave ?? 0 }
      },
      trafficSample: firstTraffic ? { x: firstTraffic.position.x, z: firstTraffic.position.z } : null,
      trafficFacingScore: trafficFacingScores.length
        ? trafficFacingScores.reduce((sum, score) => sum + score, 0) / trafficFacingScores.length
        : 0,
      pedestrianTravel: activeItems
        .filter((item) => item.motion?.kind === 'pedestrian')
        .reduce((sum, item) => sum + (item.motion.travelled ?? 0), 0),
      pedestrianSample: firstPedestrian ? { x: firstPedestrian.position.x, z: firstPedestrian.position.z } : null,
      slimes: this.slimes.map((slime) => ({
        name: slime.name,
        mass: slime.mass,
        score: slime.score,
        alive: slime.alive,
        intent: slime.ai?.currentIntent,
        evaluations: slime.ai?.evaluations ?? 0,
        intentChanges: slime.ai?.intentChanges ?? 0,
        personality: slime.ai?.personality.name
      }))
    };
  }

  checkPhaseState(dt) {
    if (!this.playerAlive || this.matchFinished) return;
    if (isMatchTimeExpired(this.elapsed)) {
      this.finishMatch('Time!');
      return;
    }
    if (this.cityMassLeft > 0.5) return;
    this.nextPhaseTimer += dt;
    if (this.nextPhaseTimer === dt) {
      this.finishMatch('City cleared!');
    }
  }

  finishMatch(title) {
    if (this.matchFinished) return;
    this.running = false;
    this.matchFinished = true;
    this.crazyGames.gameplayStop();
    const ranked = rankSlimes(this.slimes);
    const placement = ranked.indexOf(this.player) + 1;
    this.showState(
      title,
      `#${placement} · ${Math.floor(this.player.mass)} mass · ${Math.floor(this.player.score)} points`,
      true,
      'Play again'
    );
  }

  handleStateAction() {
    this.music.unlock();
    if (!this.started) return;
    if (!this.playerAlive) {
      this.createLevel(this.phase);
      this.crazyGames.gameplayStart();
      this.crazyGames.setGameContext({ phase: String(this.phase), seed: String(this.levelSeed) });
      return;
    }
    if (this.matchFinished) {
      this.createLevel(this.phase);
      this.crazyGames.gameplayStart();
      this.crazyGames.setGameContext({ phase: String(this.phase), seed: String(this.levelSeed) });
    }
  }

  showState(title, detail, actionVisible, actionText = 'Play') {
    ui.stateTitle.textContent = title;
    ui.stateDetail.textContent = detail;
    ui.stateAction.textContent = actionText;
    ui.stateAction.hidden = !actionVisible;
    ui.center.classList.remove('hidden');
  }

  hideState() {
    ui.center.classList.add('hidden');
  }
}

function createSlimeGeometry() {
  const geo = new THREE.SphereGeometry(1.0, 36, 26);
  const pos = geo.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    const normY = (y + 1) / 2; // 0 at bottom to 1 at top

    // 1. Plump pudding base: widen lower half so it squashes into the ground
    const baseSpread = 1.0 + 0.36 * Math.pow(1.0 - normY, 1.7);
    x *= baseSpread;
    z *= baseSpread;

    // 2. Flatten very bottom so it rests flush and clean on pavement
    if (normY < 0.14) {
      const flatten = (0.14 - normY) / 0.14;
      y += flatten * 0.08;
    }

    // 3. Iconic droplet / teardrop perky crest at top
    if (normY > 0.62) {
      const crest = (normY - 0.62) / 0.38;
      const pinch = 1.0 - 0.44 * Math.pow(crest, 1.3);
      x *= pinch;
      z *= pinch;
      y += 0.38 * Math.pow(crest, 2.0);
    }

    pos.setXYZ(i, x, y, z);
  }

  // Normalize so lowest vertex is at local y = 0
  let minY = Infinity;
  for (let i = 0; i < pos.count; i++) {
    if (pos.getY(i) < minY) minY = pos.getY(i);
  }
  for (let i = 0; i < pos.count; i++) {
    pos.setY(i, pos.getY(i) - minY);
  }

  geo.computeVertexNormals();
  return geo;
}

let sharedSlimeGeometry = null;

function createSlimeMesh(color, isPlayer) {
  const group = new THREE.Group();

  // 1. Soft ground contact shadow disc
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(1.22, 32),
    new THREE.MeshBasicMaterial({
      color: 0x050c08,
      transparent: true,
      opacity: isPlayer ? 0.34 : 0.24,
      depthWrite: false
    })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.005;
  group.add(shadow);

  // 2. Animated body group (handles squash & stretch)
  const bodyGroup = new THREE.Group();
  group.add(bodyGroup);

  // 3. Iconic Gumdrop / Pudding Slime Body
  if (!sharedSlimeGeometry) {
    sharedSlimeGeometry = createSlimeGeometry();
    sharedSlimeGeometry.userData.sharedAsset = true;
  }
  const bodyMat = new THREE.MeshPhysicalMaterial({
    color,
    transparent: true,
    opacity: isPlayer ? 0.92 : 0.86,
    roughness: 0.12,
    metalness: 0.0,
    transmission: 0.32,
    ior: 1.44,
    thickness: 0.85,
    clearcoat: 0.95,
    clearcoatRoughness: 0.08
  });
  const body = new THREE.Mesh(sharedSlimeGeometry, bodyMat);
  body.castShadow = true;
  body.receiveShadow = true;
  bodyGroup.add(body);

  // 4. Floating Translucent Jelly Bubbles & Soft Core
  const coreMat = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.26,
    roughness: 0.4,
    transparent: true,
    opacity: 0.6
  });
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.35, 18, 14), coreMat);
  core.position.set(0, 0.70, 0);
  bodyGroup.add(core);

  // Small internal bubbles creating authentic gelatinous depth
  const bubbleMat = new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.1,
    transmission: 0.65,
    transparent: true,
    opacity: 0.45
  });
  const bubble1 = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 10), bubbleMat);
  bubble1.position.set(0.14, 0.68, 0.10);
  bodyGroup.add(bubble1);

  const bubble2 = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8), bubbleMat);
  bubble2.position.set(-0.18, 0.96, -0.05);
  bodyGroup.add(bubble2);

  // 5. Adorable High-Contrast Slime Face (Proudly mounted on the front surface)
  const faceGroup = new THREE.Group();

  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x07110c });
  const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const blushMat = new THREE.MeshBasicMaterial({
    color: 0xff6584,
    transparent: true,
    opacity: 0.65,
    depthWrite: false
  });

  const eyeGeo = new THREE.SphereGeometry(0.14, 18, 14);
  const bigGlintGeo = new THREE.SphereGeometry(0.052, 12, 8);
  const smallGlintGeo = new THREE.SphereGeometry(0.026, 10, 6);
  const blushGeo = new THREE.SphereGeometry(0.11, 14, 10);

  // Left and Right Eyes
  for (const side of [-1, 1]) {
    const eyeX = side * 0.32;
    const eyeY = 0.76;
    const eyeZ = -1.08;

    // Oval Pill Eye
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.position.set(eyeX, eyeY, eyeZ);
    eye.scale.set(1.0, 1.42, 0.42);
    eye.rotation.z = side * -0.08; // slightly tilted outward for cute anime look
    eye.renderOrder = 2;
    faceGroup.add(eye);

    // Big Catchlight (top-left of each eye)
    const bigGlint = new THREE.Mesh(bigGlintGeo, glintMat);
    bigGlint.position.set(eyeX - 0.038, eyeY + 0.068, eyeZ - 0.05);
    bigGlint.renderOrder = 3;
    faceGroup.add(bigGlint);

    // Small Catchlight (bottom-right of each eye)
    const smallGlint = new THREE.Mesh(smallGlintGeo, glintMat);
    smallGlint.position.set(eyeX + 0.034, eyeY - 0.048, eyeZ - 0.04);
    smallGlint.renderOrder = 3;
    faceGroup.add(smallGlint);

    // Soft Rosy Blush Cheeks
    const blush = new THREE.Mesh(blushGeo, blushMat);
    blush.position.set(side * 0.48, 0.58, -1.02);
    blush.scale.set(1.35, 0.72, 0.32);
    blush.renderOrder = 2;
    faceGroup.add(blush);
  }

  // Cute Open Curved Smile (:3 / :D smile)
  const mouthGeo = new THREE.TorusGeometry(0.11, 0.026, 8, 16, Math.PI);
  const mouth = new THREE.Mesh(mouthGeo, eyeMat);
  mouth.position.set(0, 0.58, -1.13);
  mouth.rotation.set(0, 0, Math.PI); // curve upwards into a happy smile
  mouth.renderOrder = 2;
  faceGroup.add(mouth);

  bodyGroup.add(faceGroup);

  group.userData.body = bodyGroup;
  group.userData.bodyMesh = body;
  group.userData.core = core;
  group.userData.face = faceGroup;
  group.userData.shadow = shadow;

  return group;
}

function createTreeMesh(rng) {
  const group = new THREE.Group();
  const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x9b623e, roughness: 0.86 });
  const crownMaterial = new THREE.MeshStandardMaterial({
    color: rng() > 0.45 ? 0x35b76d : 0x2e9f68,
    roughness: 0.82
  });

  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.72, 7), trunkMaterial);
  trunk.position.y = 0.36;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  group.add(trunk);

  const crown = new THREE.Mesh(new THREE.ConeGeometry(0.52, 1.05, 7), crownMaterial);
  crown.position.y = 1.12;
  crown.castShadow = true;
  crown.receiveShadow = true;
  group.add(crown);

  group.scale.setScalar(randomRange(rng, 0.82, 1.22));
  return group;
}

function prepareLoadedObject(root) {
  root.traverse((node) => {
    if (!node.isMesh) return;
    node.castShadow = true;
    node.receiveShadow = true;
    node.geometry.userData.sharedAsset = true;
    node.material = cloneSharedMaterial(node.material);
    const maps = [node.material.map, node.material.emissiveMap, node.material.roughnessMap].filter(Boolean);
    for (const map of maps) {
      map.magFilter = THREE.NearestFilter;
      map.minFilter = THREE.NearestFilter;
      map.colorSpace = THREE.SRGBColorSpace;
      map.userData.sharedAsset = true;
    }
  });
  return root;
}

function cloneAndFit(prefab, footprint, targetHeight = null, options = {}) {
  const { castShadow = true, receiveShadow = true } = options;
  const clone = prefab.clone(true);
  clone.traverse((node) => {
    if (!node.isMesh) return;
    node.castShadow = castShadow;
    node.receiveShadow = receiveShadow;
  });

  const wrapper = new THREE.Group();
  wrapper.add(clone);
  TMP_BOX.setFromObject(clone);
  const size = TMP_BOX.getSize(new THREE.Vector3());
  const maxFootprint = Math.max(size.x, size.z, 0.001);
  const scale = targetHeight ? targetHeight / Math.max(size.y, 0.001) : footprint / maxFootprint;
  clone.scale.setScalar(scale);

  TMP_BOX.setFromObject(clone);
  const center = TMP_BOX.getCenter(new THREE.Vector3());
  clone.position.sub(new THREE.Vector3(center.x, TMP_BOX.min.y, center.z));
  return wrapper;
}

function disposeObject(object) {
  object.traverse((node) => {
    if (!node.isMesh) return;
    if (!node.geometry?.userData?.sharedAsset) node.geometry?.dispose();
    if (Array.isArray(node.material)) {
      node.material.forEach((material) => {
        if (!material.userData?.sharedAsset) material.dispose?.();
      });
    } else if (!node.material?.userData?.sharedAsset) {
      node.material?.dispose?.();
    }
  });
}

function cloneSharedMaterial(material) {
  if (!material) return material;
  if (Array.isArray(material)) return material.map((entry) => cloneSharedMaterial(entry));
  const clone = material.clone();
  clone.userData.sharedAsset = true;
  if ('roughness' in clone) clone.roughness = Math.min(1, (clone.roughness ?? 0.72) + 0.08);
  return clone;
}

function planarDistanceSq(a, b) {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return dx * dx + dz * dz;
}

function getForwardDot(rotationY, axis, direction) {
  const desiredX = axis === 'x' ? direction : 0;
  const desiredZ = axis === 'z' ? direction : 0;
  const forwardX = Math.sin(rotationY);
  const forwardZ = Math.cos(rotationY);
  return forwardX * desiredX + forwardZ * desiredZ;
}

function distanceToRouteEnd(item) {
  const axis = item.motion.axis;
  return Math.min(item.position[axis] - item.motion.min, item.motion.max - item.position[axis]);
}

function createRoadAxis(rng, half, spacing, jitter) {
  const minGap = Math.max(7.25, spacing * 0.86);
  const positiveRoads = [];
  let position = randomRange(rng, minGap * 1.02, spacing * 1.06);

  while (position < half - spacing * 0.22) {
    positiveRoads.push(Number(position.toFixed(2)));
    position += Math.max(minGap, spacing * randomRange(rng, Math.max(0.92, 1 - jitter * 0.45), 1 + jitter));
  }

  return [...positiveRoads.map((road) => -road).reverse(), 0, ...positiveRoads];
}

function createIntervalsBetweenRoads(roads, half, padding) {
  const intervals = [];
  let start = -half;
  for (const road of roads) {
    const end = road - padding;
    if (end > start) intervals.push([start, end]);
    start = road + padding;
  }
  if (start < half) intervals.push([start, half]);
  return intervals;
}

function countStructureOverlaps(footprints) {
  let overlaps = 0;
  for (let i = 0; i < footprints.length; i += 1) {
    for (let j = i + 1; j < footprints.length; j += 1) {
      const a = footprints[i];
      const b = footprints[j];
      const minDistance = a.radius + b.radius;
      const dx = a.x - b.x;
      const dz = a.z - b.z;
      if (dx * dx + dz * dz < minDistance * minDistance) overlaps += 1;
    }
  }
  return overlaps;
}

function countDistricts(blocks) {
  return blocks.reduce(
    (counts, block) => {
      counts[block.district] = (counts[block.district] ?? 0) + 1;
      return counts;
    },
    { downtown: 0, commercial: 0, residential: 0, industrial: 0, park: 0 }
  );
}

function countEmptyBlocksNearStart(blocks, items, radius) {
  return blocks.filter((block) => {
    if (block.district === 'park' || Math.hypot(block.x, block.z) > radius) return false;
    return !items.some((item) => {
      if (item.type !== 'building' && item.type !== 'house') return false;
      return item.position.x >= block.minX && item.position.x <= block.maxX && item.position.z >= block.minZ && item.position.z <= block.maxZ;
    });
  }).length;
}

function getStructureRadius(kind, footprint) {
  return footprint * (kind === 'house' ? 0.5 : 0.56);
}

function createRng(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createRandomSeed() {
  const values = new Uint32Array(1);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(values);
    if (values[0]) return values[0];
  }
  return mixSeed(Date.now(), Math.floor(performance.now() * 1000));
}

function readSeedFromUrl() {
  const seedParam = new URLSearchParams(window.location.search).get('seed');
  if (!seedParam) return null;
  const seed = Number(seedParam);
  return Number.isFinite(seed) ? seed >>> 0 : null;
}

function mixSeed(...values) {
  let mixed = 0x9e3779b9;
  for (const value of values) {
    mixed ^= Number(value) >>> 0;
    mixed = Math.imul(mixed ^ (mixed >>> 16), 0x85ebca6b);
    mixed = Math.imul(mixed ^ (mixed >>> 13), 0xc2b2ae35);
    mixed ^= mixed >>> 16;
  }
  return mixed >>> 0;
}

function randomRange(rng, min, max) {
  return min + (max - min) * rng();
}

function pick(rng, list) {
  return list[Math.floor(rng() * list.length)];
}

function formatTime(seconds) {
  const total = Math.floor(seconds);
  const minutes = Math.floor(total / 60)
    .toString()
    .padStart(2, '0');
  const rest = (total % 60).toString().padStart(2, '0');
  return `${minutes}:${rest}`;
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

const game = new SlimopGame();
game.init();
