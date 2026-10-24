import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
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
  new URL('../Assets/Mini Characters/Models/OBJ format/character-male-a.obj', import.meta.url).href,
  new URL('../Assets/Mini Characters/Models/OBJ format/character-male-b.obj', import.meta.url).href,
  new URL('../Assets/Mini Characters/Models/OBJ format/character-male-c.obj', import.meta.url).href,
  new URL('../Assets/Mini Characters/Models/OBJ format/character-male-d.obj', import.meta.url).href,
  new URL('../Assets/Mini Characters/Models/OBJ format/character-male-e.obj', import.meta.url).href,
  new URL('../Assets/Mini Characters/Models/OBJ format/character-male-f.obj', import.meta.url).href,
  new URL('../Assets/Mini Characters/Models/OBJ format/character-female-a.obj', import.meta.url).href,
  new URL('../Assets/Mini Characters/Models/OBJ format/character-female-b.obj', import.meta.url).href,
  new URL('../Assets/Mini Characters/Models/OBJ format/character-female-c.obj', import.meta.url).href,
  new URL('../Assets/Mini Characters/Models/OBJ format/character-female-d.obj', import.meta.url).href,
  new URL('../Assets/Mini Characters/Models/OBJ format/character-female-e.obj', import.meta.url).href,
  new URL('../Assets/Mini Characters/Models/OBJ format/character-female-f.obj', import.meta.url).href
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

const MAP_PROFILES = [
  {
    name: 'centro compacto',
    worldSize: 66,
    roadSpacing: 9.05,
    roadJitter: 0.12,
    roadWidth: 2.58,
    downtownRadius: 0.19,
    parkChance: 0.04,
    commercialBias: 0.14,
    avenueBias: 0.28
  },
  {
    name: 'bairro verde',
    worldSize: 68,
    roadSpacing: 9.25,
    roadJitter: 0.15,
    roadWidth: 2.5,
    downtownRadius: 0.13,
    parkChance: 0.08,
    commercialBias: 0.08,
    avenueBias: 0.2
  },
  {
    name: 'corredores comerciais',
    worldSize: 70,
    roadSpacing: 8.95,
    roadJitter: 0.14,
    roadWidth: 2.62,
    downtownRadius: 0.15,
    parkChance: 0.05,
    commercialBias: 0.13,
    avenueBias: 0.34
  }
];

const PLAYER_NAME = 'Voce';
const RIVAL_NAMES = ['Limao', 'Byte', 'Nuvem', 'Bala', 'Turbo'];
const CAMERA_OFFSET = new THREE.Vector3(20, 24, 20);
const MUSIC_TRACK_URLS = [
  new URL('../Assets/musics/Vector Dash.mp3', import.meta.url).href,
  new URL('../Assets/musics/Neon Dash Run.mp3', import.meta.url).href
];
const MUSIC_VOLUME = 0.42;
const MUSIC_CROSSFADE = 6;
const TMP_VECTOR = new THREE.Vector3();
const TMP_VECTOR_B = new THREE.Vector3();
const TMP_BOX = new THREE.Box3();

const ui = {
  canvas: document.querySelector('#game-canvas'),
  phase: document.querySelector('#phase-value'),
  time: document.querySelector('#time-value'),
  mass: document.querySelector('#mass-value'),
  city: document.querySelector('#city-value'),
  cityMeter: document.querySelector('#city-meter'),
  rankList: document.querySelector('#rank-list'),
  center: document.querySelector('#center-state'),
  stateTitle: document.querySelector('#state-title'),
  stateDetail: document.querySelector('#state-detail'),
  stateAction: document.querySelector('#state-action'),
  touchStick: document.querySelector('#touch-stick'),
  touchKnob: document.querySelector('#touch-knob')
};

class GameMusic {
  constructor(urls, volume, crossfade) {
    this.urls = urls;
    this.volume = volume;
    this.crossfade = crossfade;
    this.index = 0;
    this.unlocked = false;
    this.fading = false;
    this.current = this.createTrack(urls[0]);
    this.incoming = this.createTrack(urls[1] ?? urls[0]);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.suspend();
      else this.resume();
    });
  }

  createTrack(url) {
    const audio = new Audio(url);
    audio.preload = 'auto';
    audio.volume = 0;
    audio.dataset.trackUrl = url;
    audio.addEventListener('ended', () => {
      if (this.current === audio) this.finishCrossfade();
    });
    return audio;
  }

  unlock() {
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
    if (!this.unlocked || document.hidden) return;
    this.current.play().catch(() => {});
    if (this.fading) this.incoming.play().catch(() => {});
  }
}

class SlimopGame {
  constructor() {
    this.clock = new THREE.Clock();
    this.loader = new GLTFLoader();
    this.assets = { buildings: [], houses: [], cars: [], people: [], props: [] };
    this.items = [];
    this.slimes = [];
    this.eatEffects = [];
    this.keys = new Set();
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
    this.started = false;
    this.running = false;
    this.playerAlive = true;
    this.nextPhaseTimer = 0;
    this.worldSize = 72;
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

    this.camera = new THREE.OrthographicCamera(-20, 20, 20, -20, 0.1, 260);
    this.renderer = new THREE.WebGLRenderer({
      canvas: ui.canvas,
      antialias: true,
      preserveDrawingBuffer: true
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.levelGroup = new THREE.Group();
    this.scene.add(this.levelGroup);

    this.music = new GameMusic(MUSIC_TRACK_URLS, MUSIC_VOLUME, MUSIC_CROSSFADE);
    this.setupLights();
    this.setupInput();
    this.resize();
    window.addEventListener('resize', () => this.resize());
    ui.stateAction.addEventListener('click', () => this.handleStateAction());
  }

  async init() {
    this.showState('Carregando', 'Preparando cidade', false);
    await this.loadAssets();
    this.createLevel(this.phase);
    this.hideState();
    this.running = true;
    this.started = true;
    this.music.unlock();
    this.updateHud();
    this.animate();
    requestAnimationFrame(() => {
      window.__SLIMOP_READY__ = true;
    });
  }

  setupLights() {
    const hemi = new THREE.HemisphereLight(0xeef7ff, 0x54714d, 1.65);
    this.scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff3da, 3.1);
    sun.position.set(-25, 42, 28);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 110;
    sun.shadow.camera.left = -52;
    sun.shadow.camera.right = 52;
    sun.shadow.camera.top = 52;
    sun.shadow.camera.bottom = -52;
    this.scene.add(sun);

    const fill = new THREE.DirectionalLight(0x8fbfff, 0.9);
    fill.position.set(28, 24, -34);
    this.scene.add(fill);
  }

  setupInput() {
    const unlockMusic = () => this.music.unlock();
    window.addEventListener('pointerdown', unlockMusic, { capture: true });
    window.addEventListener('keydown', (event) => {
      unlockMusic();
      this.keys.add(event.key.toLowerCase());
      if (event.key === ' ') event.preventDefault();
    });
    window.addEventListener('keyup', (event) => {
      this.keys.delete(event.key.toLowerCase());
    });

    ui.canvas.addEventListener('pointerdown', (event) => {
      if (!this.running || !this.playerAlive) return;
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
  }

  updateTouchKnob() {
    const vector = this.getPointerVector();
    ui.touchKnob.style.transform = `translate(${vector.x * 31}px, ${vector.y * 31}px)`;
  }

  async loadAssets() {
    const [buildings, houses, cars, people, props] = await Promise.all([
      Promise.all(BUILDING_MODEL_URLS.map((url) => this.loadGltf(url))),
      Promise.all(HOUSE_MODEL_URLS.map((url) => this.loadGltf(url))),
      Promise.all(CAR_MODEL_URLS.map((url) => this.loadGltf(url))),
      Promise.all(CHARACTER_MODEL_URLS.map((url) => this.loadObj(url))),
      Promise.all(PROP_MODEL_URLS.map((url) => this.loadGltf(url)))
    ]);

    this.assets.buildings = buildings.filter(Boolean);
    this.assets.houses = houses.filter(Boolean);
    this.assets.cars = cars.filter(Boolean);
    this.assets.people = people.filter(Boolean);
    this.assets.props = props.filter(Boolean);
  }

  loadGltf(url) {
    return new Promise((resolve) => {
      this.loader.load(
        url,
        (gltf) => {
          const root = gltf.scene;
          root.traverse((node) => {
            if (!node.isMesh) return;
            node.castShadow = true;
            node.receiveShadow = true;
            node.geometry.userData.sharedAsset = true;
            node.material = cloneSharedMaterial(node.material);
          });
          resolve(root);
        },
        undefined,
        () => resolve(null)
      );
    });
  }

  loadObj(url) {
    const mtlUrl = url.replace(/\.obj(?:\?.*)?$/i, '.mtl');
    const resourcePath = url.slice(0, url.lastIndexOf('/') + 1);

    return new Promise((resolve) => {
      const mtlLoader = new MTLLoader();
      mtlLoader.setResourcePath(resourcePath);
      mtlLoader.load(
        mtlUrl,
        (materials) => {
          materials.preload();
          const objLoader = new OBJLoader();
          objLoader.setMaterials(materials);
          objLoader.load(url, (root) => resolve(prepareLoadedObject(root)), undefined, () => resolve(null));
        },
        undefined,
        () => {
          const objLoader = new OBJLoader();
          objLoader.load(url, (root) => resolve(prepareLoadedObject(root)), undefined, () => resolve(null));
        }
      );
    });
  }

  createLevel(phase) {
    this.clearLevel();
    this.phase = phase;
    this.elapsed = 0;
    this.nextPhaseTimer = 0;
    this.playerAlive = true;

    this.levelSeed = mixSeed(this.runSeed, phase * 733, this.levelSequence * 104729);
    this.levelSequence += 1;

    const rng = createRng(this.levelSeed);
    this.mapProfile = pick(rng, MAP_PROFILES);
    this.worldSize = this.mapProfile.worldSize + phase * 5;
    this.roadSpacing = Math.max(8.65, this.mapProfile.roadSpacing - phase * 0.04);
    this.roadWidth = this.mapProfile.roadWidth;
    this.levelGroup = new THREE.Group();
    this.scene.add(this.levelGroup);

    this.createGround(rng);
    this.createRoadGrid(rng);
    this.populateCity(rng);
    this.spawnSlimes(rng);

    this.levelMass = this.items.reduce((sum, item) => sum + item.mass, 0);
    this.cityMassLeft = this.levelMass;
    this.running = true;
    this.hideState();
    this.resize();
  }

  clearLevel() {
    if (this.levelGroup) {
      this.scene.remove(this.levelGroup);
      disposeObject(this.levelGroup);
    }
    this.items = [];
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
  }

  createGround(rng) {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(this.worldSize + 34, this.worldSize + 34),
      new THREE.MeshStandardMaterial({
        color: COLORS.ground,
        roughness: 0.96
      })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.03;
    ground.receiveShadow = true;
    this.levelGroup.add(ground);
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
    this.xRoads = createRoadAxis(rng, half, this.roadSpacing, this.mapProfile.roadJitter);
    this.zRoads = createRoadAxis(rng, half, this.roadSpacing * randomRange(rng, 0.96, 1.06), this.mapProfile.roadJitter);
    this.roads = [...new Set([...this.xRoads, ...this.zRoads])].sort((a, b) => a - b);
    this.sidewalkOffset = this.roadWidth / 2 + 0.58;
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
    this.mainAvenues = {
      x: [0, pick(rng, avenueXRoads.length ? avenueXRoads : [0])].filter(
        (road, index, list) => list.indexOf(road) === index
      ),
      z: [0, pick(rng, avenueZRoads.length ? avenueZRoads : [0])].filter(
        (road, index, list) => list.indexOf(road) === index
      )
    };

    for (const z of this.zRoads) {
      this.addFlatRect(0, z, this.worldSize + 4, this.roadWidth, roadMaterial, 0.02);
      this.addRoadEdgeSegments('x', z, sidewalkMaterial, curbMaterial);
      this.addLaneMarks('x', z, laneMaterial, rng);
      this.addTrafficRoutes('x', z);
    }

    for (const x of this.xRoads) {
      this.addFlatRect(x, 0, this.roadWidth, this.worldSize + 4, roadMaterial, 0.021);
      this.addRoadEdgeSegments('z', x, sidewalkMaterial, curbMaterial);
      this.addLaneMarks('z', x, laneMaterial, rng);
      this.addTrafficRoutes('z', x);
    }

    this.createCityBlocks(rng);
  }

  addRoadEdgeSegments(axis, roadCenter, sidewalkMaterial, curbMaterial) {
    const half = this.worldSize / 2;
    const crossRoads = axis === 'x' ? this.xRoads : this.zRoads;
    const intervals = createIntervalsBetweenRoads(crossRoads, half, this.roadWidth / 2 + 0.2);
    const sideAxisOffset = this.sidewalkOffset;
    const curbOffset = this.roadWidth / 2 + 0.08;

    for (const [start, end] of intervals) {
      if (end - start < 1.8) continue;
      const center = (start + end) / 2;
      const length = end - start;
      for (const side of [-1, 1]) {
        if (axis === 'x') {
          this.addFlatRect(center, roadCenter + side * sideAxisOffset, length, 0.94, sidewalkMaterial, 0.08);
          this.addFlatRect(center, roadCenter + side * curbOffset, length, 0.16, curbMaterial, 0.12);
        } else {
          this.addFlatRect(roadCenter + side * sideAxisOffset, center, 0.94, length, sidewalkMaterial, 0.081);
          this.addFlatRect(roadCenter + side * curbOffset, center, 0.16, length, curbMaterial, 0.121);
        }
      }
    }
  }

  addLaneMarks(axis, roadCenter, material, rng) {
    const half = this.worldSize / 2;
    const crossRoads = axis === 'x' ? this.xRoads : this.zRoads;
    const dashLength = 2.25;

    for (let p = -half + 1.8 + rng() * 1.2; p < half; p += 7.15) {
      const crossesIntersection = crossRoads.some((road) => Math.abs(p - road) < this.roadWidth * 0.95);
      if (crossesIntersection || rng() < 0.1) continue;

      if (axis === 'x') {
        this.addFlatRect(p, roadCenter, dashLength, 0.075, material, 0.13);
      } else {
        this.addFlatRect(roadCenter, p, 0.075, dashLength, material, 0.131);
      }
    }
  }

  addTrafficRoutes(axis, roadCenter) {
    const half = this.worldSize / 2 + 2.5;
    const laneOffset = this.roadWidth * 0.24;
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

    const halfRoad = this.roadWidth / 2;
    this.blocks = [];

    for (let xi = 0; xi < this.xRoads.length - 1; xi += 1) {
      for (let zi = 0; zi < this.zRoads.length - 1; zi += 1) {
        const minX = this.xRoads[xi] + halfRoad;
        const maxX = this.xRoads[xi + 1] - halfRoad;
        const minZ = this.zRoads[zi] + halfRoad;
        const maxZ = this.zRoads[zi + 1] - halfRoad;
        const width = maxX - minX;
        const depth = maxZ - minZ;
        if (width < 4.4 || depth < 4.4) continue;

        const x = (minX + maxX) / 2;
        const z = (minZ + maxZ) / 2;
        const district = this.classifyBlock(x, z, rng);
        const nearStart = Math.hypot(x, z) < this.roadSpacing * 2.15;
        const downtown = district === 'downtown';
        const residential = district === 'residential';
        const innerWidth = Math.max(1, width - 2.05);
        const innerDepth = Math.max(1, depth - 2.05);
        const surface = downtown || district === 'commercial' ? plazaMaterial : sidewalkMaterial;

        const hasLawn = district === 'park' || (residential && rng() > 0.82);
        this.addFlatRect(x, z, width - 0.08, depth - 0.08, surface, 0.16);
        this.addFlatRect(x, z, innerWidth, innerDepth, hasLawn ? lotMaterial : concreteMaterial, 0.18);
        if (district === 'park') {
          this.addFlatRect(x, z, innerWidth, 0.42, sidewalkMaterial, 0.195);
          this.addFlatRect(x, z, 0.42, innerDepth, sidewalkMaterial, 0.196);
        }
        this.addFlatRect(x, minZ + 0.95, width - 0.3, 0.055, seamMaterial, 0.205);
        this.addFlatRect(x, maxZ - 0.95, width - 0.3, 0.055, seamMaterial, 0.205);
        this.addFlatRect(minX + 0.95, z, 0.055, depth - 0.3, seamMaterial, 0.206);
        this.addFlatRect(maxX - 0.95, z, 0.055, depth - 0.3, seamMaterial, 0.206);

        const block = {
          x,
          z,
          minX,
          maxX,
          minZ,
          maxZ,
          width,
          depth,
          district,
          nearStart,
          downtown,
          residential
        };

        this.blocks.push(block);
        this.addSidewalkRoutesForBlock(block);
      }
    }
  }

  classifyBlock(x, z, rng) {
    const distanceToCenter = Math.hypot(x - this.cityCenter.x, z - this.cityCenter.y);
    const normalizedDistance = distanceToCenter / Math.max(1, this.worldSize * 0.5);
    const distanceToStart = Math.hypot(x, z);
    const nearAvenue =
      this.mainAvenues.x.some((road) => Math.abs(x - road) < this.roadSpacing * 0.82) ||
      this.mainAvenues.z.some((road) => Math.abs(z - road) < this.roadSpacing * 0.82);

    if (normalizedDistance < this.mapProfile.downtownRadius || (nearAvenue && normalizedDistance < 0.34 && rng() > 0.42)) {
      return 'downtown';
    }

    if (distanceToStart < this.roadSpacing * 2.15) {
      return nearAvenue || rng() > 0.45 ? 'commercial' : 'residential';
    }

    const parkChance = this.mapProfile.parkChance * (normalizedDistance > 0.18 ? 1.15 : 0.35);
    if (rng() < parkChance) return 'park';

    const commercialChance = this.mapProfile.commercialBias + (nearAvenue ? this.mapProfile.avenueBias : 0);
    if (rng() < commercialChance) return 'commercial';

    return 'residential';
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
    const carTarget = Math.min(22 + this.phase * 3, this.trafficRoutes.length);
    const pedestrianTarget = 115 + this.phase * 15;

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

    const trafficReservations = new Map();
    for (let i = 0; i < carTarget; i += 1) {
      for (let attempt = 0; attempt < 20; attempt += 1) {
        const route = pick(rng, this.trafficRoutes);
        const along = randomRange(rng, route.min, route.max);
        if (!this.reserveTrafficSlot(trafficReservations, route, along)) continue;
        const mass = Math.round(randomRange(rng, 11.5, 19) + this.phase * 1.1);
        this.addItem(this.createVehicleItem(route, along, mass, rng));
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
        this.addItem(this.createHouseItem(lot.x, lot.z, lot.footprint, rng));
      } else {
        const mass = Math.round((lot.tower ? 72 : 34) + lot.footprint * lot.footprint * (lot.tower ? 4.7 : 3.3) + this.phase * 3.1);
        this.addItem(this.createBuildingItem(lot.x, lot.z, lot.footprint, mass, rng, lot.tower));
      }
    }

    this.addBlockDecor(block, rng);
  }

  ensureBlockHasStructure(block, rng) {
    if (block.district === 'park' || this.blockHasReservedStructure(block)) return;

    const lots = [];
    const kind = block.district === 'residential' ? 'house' : 'building';
    if (!this.tryReserveLot(lots, block, block.x, block.z, 1.42, kind, false)) return;

    for (const lot of lots) {
      if (lot.kind === 'house') {
        this.addItem(this.createHouseItem(lot.x, lot.z, lot.footprint, rng));
      } else {
        const mass = Math.round(26 + lot.footprint * lot.footprint * 2.8 + this.phase * 2.1);
        this.addItem(this.createBuildingItem(lot.x, lot.z, lot.footprint, mass, rng, false));
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

    if (block.district === 'downtown') {
      const tower = this.phase > 1 && maxFootprint > 2.65 && rng() > 0.86;
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
    const positions = this.createLotPositions(block, adjustedLotCount, rng);

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

  createLotPositions(block, count, rng) {
    if (count <= 1) {
      return [
        new THREE.Vector2(
          block.x + randomRange(rng, -block.width * 0.08, block.width * 0.08),
          block.z + randomRange(rng, -block.depth * 0.08, block.depth * 0.08)
        )
      ];
    }

    if (count === 2) {
      const xOffset = block.width * randomRange(rng, 0.18, 0.24);
      const zOffset = block.depth * randomRange(rng, 0.15, 0.22);
      const flip = rng() > 0.5 ? 1 : -1;
      return [
        new THREE.Vector2(block.x - xOffset, block.z - zOffset * flip),
        new THREE.Vector2(block.x + xOffset, block.z + zOffset * flip)
      ];
    }

    const positions = [];
    const cornerX = block.width * 0.22;
    const cornerZ = block.depth * 0.2;
    const candidates = [
      new THREE.Vector2(block.x - cornerX, block.z - cornerZ),
      new THREE.Vector2(block.x + cornerX, block.z - cornerZ),
      new THREE.Vector2(block.x, block.z + cornerZ)
    ];
    for (let i = 0; i < count; i += 1) {
      positions.push(candidates[i % candidates.length]);
    }
    return positions;
  }

  tryReserveLot(lots, block, x, z, footprint, kind, tower) {
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
      if (blocked || (tower && !this.canPlaceTower(placedX, placedZ))) {
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

  addBlockDecor(block, rng) {
    const placed = [];

    if (block.district === 'park') {
      const treeCount = 5 + Math.floor(rng() * 5);
      for (let i = 0; i < treeCount; i += 1) {
        const pos = this.pickDecorPosition(block, rng, placed, true);
        if (!pos) continue;
        placed.push(pos);
        this.addItem(this.createTreeItem(pos.x, pos.z, rng));
      }
      if (rng() > 0.35) {
        const pos = this.pickDecorPosition(block, rng, placed, true);
        if (pos) this.addItem(this.createPropItem(pos.x, pos.z, rng));
      }
      return;
    }

    const propTarget = block.district === 'downtown'
      ? 3 + Math.floor(rng() * 3)
      : block.district === 'commercial'
        ? 2 + Math.floor(rng() * 3)
        : 1 + Math.floor(rng() * 3);

    for (let i = 0; i < propTarget; i += 1) {
      const pos = this.pickDecorPosition(block, rng, placed, Boolean(block.nearStart));
      if (!pos) continue;
      placed.push(pos);
      if (block.district === 'residential' && rng() > 0.46) {
        this.addItem(this.createTreeItem(pos.x, pos.z, rng));
      } else {
        this.addItem(this.createPropItem(pos.x, pos.z, rng));
      }
    }
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
      const blockedByStructure = this.structureFootprints.some((other) => {
        const dx = pos.x - other.x;
        const dz = pos.z - other.z;
        const minDistance = other.radius + 0.7;
        return dx * dx + dz * dz < minDistance * minDistance;
      });
      const blockedByDecor = placed.some((other) => {
        const dx = pos.x - other.x;
        const dz = pos.z - other.z;
        return dx * dx + dz * dz < minGap * minGap;
      });
      if (!blockedByStructure && !blockedByDecor) return pos;
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

  createBuildingItem(x, z, footprint, mass, rng, tower) {
    const towerPrefabs = this.assets.buildings.slice(-5);
    const regularPrefabs = this.assets.buildings.slice(0, -5);
    const sourcePrefabs = tower ? towerPrefabs : regularPrefabs.length ? regularPrefabs : this.assets.buildings;
    const prefab = sourcePrefabs.length ? pick(rng, sourcePrefabs) : null;
    if (!prefab) return null;
    const mesh = cloneAndFit(prefab, footprint);
    mesh.position.set(x, 0.2, z);
    mesh.rotation.y = Math.round(rng() * 3) * (Math.PI / 2);
    mesh.userData.baseScale = mesh.scale.clone();
    mesh.userData.spinSpeed = randomRange(rng, -0.28, 0.28);

    return {
      type: 'building',
      active: true,
      mesh,
      mass,
      radius: footprint * 0.68,
      requiredRadius: tower ? 3.55 + footprint * 0.18 : 2.55 + footprint * 0.16,
      position: mesh.position,
      eatenBy: null
    };
  }

  createHouseItem(x, z, footprint, rng) {
    if (!this.assets.houses.length) return null;
    const mesh = cloneAndFit(pick(rng, this.assets.houses), footprint);
    mesh.position.set(x, 0.2, z);
    mesh.rotation.y = Math.round(rng() * 3) * (Math.PI / 2);
    mesh.userData.baseScale = mesh.scale.clone();
    mesh.userData.spinSpeed = randomRange(rng, -0.45, 0.45);

    return {
      type: 'house',
      active: true,
      mesh,
      mass: Math.round(randomRange(rng, 18, 28) + footprint * 4.2 + this.phase * 1.3),
      radius: footprint * 0.62,
      requiredRadius: 2.05 + footprint * 0.18,
      position: mesh.position,
      eatenBy: null
    };
  }

  createVehicleItem(route, along, mass, rng) {
    if (!this.assets.cars.length) return null;
    const mesh = cloneAndFit(pick(rng, this.assets.cars), randomRange(rng, 1.65, 2.15));
    const horizontal = route.axis === 'x';
    const direction = route.direction;
    const x = horizontal ? along : route.sideValue;
    const z = horizontal ? route.sideValue : along;
    mesh.position.set(x, 0.07, z);
    mesh.rotation.y = horizontal ? (direction > 0 ? Math.PI / 2 : -Math.PI / 2) : direction > 0 ? 0 : Math.PI;
    mesh.userData.baseScale = mesh.scale.clone();
    mesh.userData.spinSpeed = randomRange(rng, -0.8, 0.8);

    return {
      type: 'vehicle',
      active: true,
      mesh,
      mass,
      radius: 1.05,
      requiredRadius: 1.82 + mass * 0.018,
      position: mesh.position,
      eatenBy: null,
      motion: {
        kind: 'traffic',
        axis: route.axis,
        sideAxis: route.sideAxis,
        sideValue: route.sideValue,
        direction,
        min: route.min,
        max: route.max,
        baseY: 0.07,
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
    const mesh = cloneAndFit(pick(rng, this.assets.people), 0.94, 1.2);
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.28, 18),
      new THREE.MeshBasicMaterial({
        color: COLORS.shadow,
        transparent: true,
        opacity: 0.16,
        depthWrite: false
      })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.01;
    mesh.add(shadow);
    const moveDirection = horizontal
      ? new THREE.Vector3(direction, 0, 0)
      : new THREE.Vector3(0, 0, direction);

    mesh.position.set(x, 0.02, z);
    mesh.rotation.y = Math.atan2(-moveDirection.x, -moveDirection.z);
    mesh.userData.baseScale = mesh.scale.clone();
    mesh.userData.spinSpeed = randomRange(rng, -1.1, 1.1);

    return {
      type: 'person',
      active: true,
      mesh,
      mass: randomRange(rng, 0.85, 1.28),
      radius: 0.48,
      requiredRadius: 0.82,
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
        baseY: 0.02,
        speed: randomRange(rng, 0.85, 1.35),
        seed: rng() * Math.PI * 2,
        travelled: 0
      }
    };
  }

  createTreeItem(x, z, rng) {
    const mesh = createTreeMesh(rng);
    mesh.position.set(x, 0.16, z);
    mesh.rotation.y = rng() * Math.PI * 2;
    mesh.userData.baseScale = mesh.scale.clone();
    mesh.userData.spinSpeed = randomRange(rng, -0.7, 0.7);

    return {
      type: 'prop',
      active: true,
      mesh,
      mass: randomRange(rng, 0.8, 1.8),
      radius: 0.45,
      requiredRadius: 0.9,
      position: mesh.position,
      eatenBy: null
    };
  }

  createPropItem(x, z, rng) {
    if (!this.assets.props.length) return null;
    const mesh = cloneAndFit(pick(rng, this.assets.props), randomRange(rng, 0.58, 1.15));
    mesh.position.set(x, 0.2, z);
    mesh.rotation.y = rng() * Math.PI * 2;
    mesh.userData.baseScale = mesh.scale.clone();
    mesh.userData.spinSpeed = randomRange(rng, -1, 1);

    return {
      type: 'prop',
      active: true,
      mesh,
      mass: randomRange(rng, 0.9, 2.4),
      radius: 0.55,
      requiredRadius: 0.92,
      position: mesh.position,
      eatenBy: null
    };
  }

  spawnSlimes(rng) {
    this.player = this.createSlime({
      name: PLAYER_NAME,
      color: COLORS.player,
      mass: 4.4 + this.phase * 0.55,
      position: new THREE.Vector3(0, 0, 0),
      isPlayer: true
    });
    this.slimes.push(this.player);
    this.levelGroup.add(this.player.mesh);

    const rivalCount = Math.min(5, 2 + this.phase);
    for (let i = 0; i < rivalCount; i += 1) {
      const angle = (i / rivalCount) * Math.PI * 2 + rng() * 0.8;
      const radius = this.worldSize * randomRange(rng, 0.28, 0.43);
      const rival = this.createSlime({
        name: RIVAL_NAMES[i],
        color: COLORS.rivals[i % COLORS.rivals.length],
        mass: randomRange(rng, 4.6, 8.6 + this.phase * 0.9),
        position: new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius),
        isPlayer: false
      });
      rival.ai = {
        target: null,
        wander: new THREE.Vector3(Math.cos(angle + Math.PI), 0, Math.sin(angle + Math.PI)),
        timer: rng() * 2,
        wakeAt: 1.1 + rng() * 1.4
      };
      this.slimes.push(rival);
      this.levelGroup.add(rival.mesh);
    }
  }

  createSlime({ name, color, mass, position, isPlayer }) {
    const mesh = createSlimeMesh(color, isPlayer);
    mesh.position.copy(position);
    const slime = {
      id: createId(),
      name,
      mass,
      eatenMass: 0,
      color,
      radius: 1,
      speed: 1,
      mesh,
      velocity: new THREE.Vector3(),
      direction: new THREE.Vector3(0, 0, -1),
      isPlayer,
      alive: true
    };
    this.updateSlimeSize(slime);
    return slime;
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    const dt = Math.min(this.clock.getDelta(), 0.033);
    this.update(dt);
    this.music.update();
    this.renderer.render(this.scene, this.camera);
  }

  update(dt) {
    if (this.running) {
      this.elapsed += dt;
      this.updatePlayer(dt);
      this.updateRivals(dt);
      this.updateCityLife(dt);
      this.resolveEating();
      this.resolveSlimeCombat();
      this.updateAbsorbCues(dt);
      this.updateCamera(dt);
      this.updateEatEffects(dt);
      this.updateHud();
      this.checkPhaseState(dt);
    } else {
      this.updateEatEffects(dt);
    }
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
    const bound = this.worldSize / 2 + 4;
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
    const threat = this.findNearestSlimeToPosition(item.position, () => true, 2.2);
    if (threat) {
      desired = item.position.clone().sub(threat.mesh.position).setY(0);
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
    let x = 0;
    let y = 0;
    if (this.keys.has('a') || this.keys.has('arrowleft')) x -= 1;
    if (this.keys.has('d') || this.keys.has('arrowright')) x += 1;
    if (this.keys.has('w') || this.keys.has('arrowup')) y -= 1;
    if (this.keys.has('s') || this.keys.has('arrowdown')) y += 1;

    if (this.pointer.active) {
      const pointer = this.getPointerVector();
      x += pointer.x;
      y += pointer.y;
    }

    const length = Math.hypot(x, y);
    if (length < 0.001) return TMP_VECTOR.set(0, 0, 0);

    const screenX = x / Math.max(1, length);
    const screenY = y / Math.max(1, length);
    const right = TMP_VECTOR.set(1, 0, -1).normalize().multiplyScalar(screenX);
    const forward = TMP_VECTOR_B.set(-1, 0, -1).normalize().multiplyScalar(-screenY);
    return right.add(forward).normalize();
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

    const threat = this.findNearestSlime(slime, (other) => other.mass > slime.mass * 1.18, 12 + slime.radius * 1.5);
    if (threat) {
      return slime.mesh.position.clone().sub(threat.mesh.position).setY(0).normalize();
    }

    const prey = this.findNearestSlime(slime, (other) => slime.mass > other.mass * 1.22, 10 + slime.radius * 2);
    if (prey) {
      return prey.mesh.position.clone().sub(slime.mesh.position).setY(0).normalize();
    }

    const targetItem = this.findNearestItem(slime, (item) => this.canEatItem(slime, item), 30);
    if (targetItem) {
      ai.target = targetItem;
      return targetItem.position.clone().sub(slime.mesh.position).setY(0).normalize();
    }

    if (ai.timer <= 0) {
      ai.timer = randomRange(Math.random, 0.8, 2.2);
      const angle = Math.random() * Math.PI * 2;
      ai.wander.set(Math.cos(angle), 0, Math.sin(angle));
    }
    return ai.wander;
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
      const speed = slime.speed * (slime.isPlayer ? 1 : 0.82);
      slime.velocity.lerp(input.clone().multiplyScalar(speed), 1 - Math.pow(0.0001, dt));
      slime.mesh.rotation.y = Math.atan2(-slime.direction.x, -slime.direction.z);
    } else {
      slime.velocity.multiplyScalar(Math.pow(0.02, dt));
    }

    current.addScaledVector(slime.velocity, dt);
    const limit = this.worldSize / 2 + 4 - slime.radius * 0.85;
    current.x = THREE.MathUtils.clamp(current.x, -limit, limit);
    current.z = THREE.MathUtils.clamp(current.z, -limit, limit);

    const bob = Math.sin(performance.now() * 0.005 + slime.mass) * 0.035;
    slime.mesh.position.y = slime.radius * 0.46 + bob;
    const body = slime.mesh.userData.body;
    if (body) {
      body.scale.y = 0.82 + Math.abs(slime.velocity.length()) * 0.035;
    }
  }

  resolveEating() {
    for (const slime of this.slimes) {
      if (!slime.alive) continue;
      for (const item of this.items) {
        if (!item.active || !this.canEatItem(slime, item)) continue;
        const reach = slime.radius * 0.82 + item.radius * 0.52;
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
    item.active = false;
    item.eatenBy = slime.id;
    this.cityMassLeft = Math.max(0, this.cityMassLeft - item.mass);
    slime.eatenMass += item.mass;
    slime.mass += item.mass * 0.68;
    this.updateSlimeSize(slime);

    const start = item.mesh.position.clone();
    const baseScale = item.mesh.scale.clone();
    this.eatEffects.push({
      mesh: item.mesh,
      target: slime,
      start,
      baseScale,
      spin: item.mesh.userData.spinSpeed ?? 0.5,
      age: 0,
      duration: 0.28
    });
  }

  resolveSlimeCombat() {
    for (let i = 0; i < this.slimes.length; i += 1) {
      const a = this.slimes[i];
      if (!a.alive) continue;
      for (let j = i + 1; j < this.slimes.length; j += 1) {
        const b = this.slimes[j];
        if (!b.alive) continue;
        const reach = Math.min(a.radius, b.radius) * 0.55 + Math.max(a.radius, b.radius) * 0.5;
        if (planarDistanceSq(a.mesh.position, b.mesh.position) > reach * reach) continue;

        if (a.radius > b.radius * 1.14) {
          this.consumeSlime(a, b);
        } else if (b.radius > a.radius * 1.14) {
          this.consumeSlime(b, a);
        } else {
          this.bumpSlimes(a, b);
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
    prey.alive = false;
    predator.mass += prey.mass * 0.66;
    predator.eatenMass += prey.mass;
    this.updateSlimeSize(predator);

    this.eatEffects.push({
      mesh: prey.mesh,
      target: predator,
      start: prey.mesh.position.clone(),
      baseScale: prey.mesh.scale.clone(),
      spin: 1.4,
      age: 0,
      duration: 0.42,
      removeSlime: true
    });

    if (prey.isPlayer) {
      this.playerAlive = false;
      this.running = false;
      this.showState('Engolido', `Massa final ${Math.floor(prey.mass)}`, true, 'Reiniciar fase');
    }
  }

  updateEatEffects(dt) {
    for (let i = this.eatEffects.length - 1; i >= 0; i -= 1) {
      const effect = this.eatEffects[i];
      effect.age += dt;
      const t = Math.min(1, effect.age / effect.duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const target = effect.target.mesh.position;
      effect.mesh.position.lerpVectors(effect.start, target, eased);
      effect.mesh.position.y += Math.sin(eased * Math.PI) * 1.4;
      effect.mesh.scale.copy(effect.baseScale).multiplyScalar(Math.max(0.02, 1 - eased));
      effect.mesh.rotation.y += effect.spin * dt * 5;

      if (t >= 1) {
        if (effect.mesh.parent) effect.mesh.parent.remove(effect.mesh);
        disposeObject(effect.mesh);
        this.eatEffects.splice(i, 1);
      }
    }
  }

  updateSlimeSize(slime) {
    slime.radius = 0.68 + Math.sqrt(slime.mass) * 0.21;
    slime.speed = THREE.MathUtils.clamp(8.1 - slime.radius * 1.1, 3.25, 6.9);
    slime.mesh.scale.setScalar(slime.radius);

    const shadow = slime.mesh.userData.shadow;
    if (shadow) shadow.scale.setScalar(1.05 + slime.radius * 0.34);
  }

  updateCamera(dt) {
    if (!this.player) return;
    this.viewSize = THREE.MathUtils.lerp(
      this.viewSize,
      THREE.MathUtils.clamp(24 + this.player.radius * 3.8, 25, 42),
      1 - Math.pow(0.003, dt)
    );
    this.applyCameraProjection();
    const targetPosition = this.player.mesh.position.clone().add(CAMERA_OFFSET);
    this.camera.position.lerp(targetPosition, 1 - Math.pow(0.0008, dt));
    this.camera.lookAt(this.player.mesh.position.x, 0, this.player.mesh.position.z);
  }

  resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.renderer.setSize(width, height, false);
    this.applyCameraProjection();
  }

  applyCameraProjection() {
    const width = Math.max(1, window.innerWidth);
    const height = Math.max(1, window.innerHeight);
    const aspect = width / height;
    const vertical = this.viewSize;
    this.camera.left = (-vertical * aspect) / 2;
    this.camera.right = (vertical * aspect) / 2;
    this.camera.top = vertical / 2;
    this.camera.bottom = -vertical / 2;
    this.camera.updateProjectionMatrix();
  }

  updateHud() {
    const progress = this.levelMass > 0 ? 1 - this.cityMassLeft / this.levelMass : 1;
    ui.phase.textContent = String(this.phase);
    ui.time.textContent = formatTime(this.elapsed);
    ui.mass.textContent = String(Math.floor(this.player?.mass ?? 0));
    ui.city.textContent = `${Math.round(progress * 100)}%`;
    ui.cityMeter.style.width = `${Math.round(progress * 100)}%`;

    const ranked = [...this.slimes]
      .filter((slime) => slime.alive || slime.isPlayer)
      .sort((a, b) => b.mass - a.mass)
      .slice(0, 5);
    ui.rankList.replaceChildren(
      ...ranked.map((slime, index) => {
        const row = document.createElement('div');
        row.className = 'rank-row';
        row.innerHTML = `<span>${index + 1}</span><strong>${slime.name}</strong><span>${Math.floor(slime.mass)}</span>`;
        return row;
      })
    );

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
    window.__SLIMOP_DEBUG__ = {
      mapSeed: this.levelSeed,
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
      houses: activeItems.filter((item) => item.type === 'house').length,
      structures: activeItems.filter((item) => item.type === 'building' || item.type === 'house').length,
      cityBlocks: this.blocks.length,
      eatableTypes: [...new Set(activeItems.filter((item) => this.canEatItem(this.player, item)).map((item) => item.type))],
      lockedTypes: [...new Set(activeItems.filter((item) => !this.canEatItem(this.player, item)).map((item) => item.type))],
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
        alive: slime.alive
      }))
    };
  }

  checkPhaseState(dt) {
    if (this.cityMassLeft > 0.5 || !this.playerAlive) return;
    this.nextPhaseTimer += dt;
    if (this.nextPhaseTimer === dt) {
      this.running = false;
      this.showState('Cidade limpa', `${formatTime(this.elapsed)} na fase ${this.phase}`, true, 'Proxima fase');
    }
  }

  handleStateAction() {
    this.music.unlock();
    if (!this.started) return;
    if (!this.playerAlive) {
      this.createLevel(this.phase);
      return;
    }
    if (this.cityMassLeft <= 0.5) {
      this.createLevel(this.phase + 1);
    }
  }

  showState(title, detail, actionVisible, actionText = 'Jogar') {
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

function createSlimeMesh(color, isPlayer) {
  const group = new THREE.Group();

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.9, 32),
    new THREE.MeshBasicMaterial({
      color: COLORS.shadow,
      transparent: true,
      opacity: isPlayer ? 0.18 : 0.14,
      depthWrite: false
    })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -0.47;
  group.add(shadow);

  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color,
    transparent: true,
    opacity: isPlayer ? 0.64 : 0.52,
    roughness: 0.18,
    metalness: 0,
    transmission: 0.12,
    thickness: 0.7
  });

  const body = new THREE.Mesh(new THREE.BoxGeometry(1.42, 1.04, 1.42), bodyMaterial);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const rim = new THREE.Mesh(
    new THREE.BoxGeometry(1.48, 1.08, 1.48),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: isPlayer ? 0.17 : 0.1
    })
  );
  group.add(rim);

  const eyeWhite = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
  const pupilMat = new THREE.MeshStandardMaterial({ color: 0x07100c, roughness: 0.45 });
  const eyeGeo = new THREE.SphereGeometry(0.16, 18, 12);
  const pupilGeo = new THREE.SphereGeometry(0.07, 12, 8);

  for (const x of [-0.31, 0.31]) {
    const eye = new THREE.Mesh(eyeGeo, eyeWhite);
    eye.position.set(x, 0.14, -0.72);
    eye.scale.set(1, 1.15, 0.55);
    group.add(eye);

    const pupil = new THREE.Mesh(pupilGeo, pupilMat);
    pupil.position.set(x, 0.13, -0.81);
    pupil.scale.set(1, 1.1, 0.45);
    group.add(pupil);
  }

  group.userData.body = body;
  group.userData.shadow = shadow;
  group.position.y = 0.5;
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

function cloneAndFit(prefab, footprint, targetHeight = null) {
  const clone = prefab.clone(true);
  clone.traverse((node) => {
    if (!node.isMesh) return;
    node.castShadow = true;
    node.receiveShadow = true;
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
    { downtown: 0, commercial: 0, residential: 0, park: 0 }
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
