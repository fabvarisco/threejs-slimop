import { Vector3 } from 'three';
import { FEEDBACK_CONFIG } from '../gameplay/feedbackConfig.js';

// Fixed DOM pool: feedback adds no Three.js meshes, materials or draw calls.
export class AbsorptionFeedback {
  constructor(container) {
    this.container = container;
    this.projected = new Vector3();
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.slots = Array.from({ length: FEEDBACK_CONFIG.scoreGroups }, () => {
      const node = document.createElement('div');
      node.className = 'absorb-feedback';
      node.hidden = true;
      const label = document.createElement('span');
      node.append(label);
      for (let index = 0; index < 3; index += 1) node.append(document.createElement('i'));
      container.append(node);
      return { node, label, position: new Vector3(), age: Infinity, points: 0 };
    });
  }

  emit(points, position, strength) {
    let slot = this.slots.find((entry) => entry.age < FEEDBACK_CONFIG.scoreMergeWindow && entry.position.distanceToSquared(position) < 4);
    if (slot) {
      slot.points += points;
    } else {
      slot = this.slots.find((entry) => entry.age >= FEEDBACK_CONFIG.scoreDuration) ??
        this.slots.reduce((oldest, entry) => entry.age > oldest.age ? entry : oldest);
      slot.age = 0;
      slot.points = points;
      slot.position.copy(position);
      slot.node.style.setProperty('--power', String(Math.min(1.4, strength)));
    }
    slot.label.textContent = `+${Math.floor(slot.points)}`;
    slot.node.hidden = false;
  }

  update(dt, camera) {
    for (const slot of this.slots) {
      if (slot.age >= FEEDBACK_CONFIG.scoreDuration) { slot.node.hidden = true; continue; }
      slot.age += dt;
      if (slot.age >= FEEDBACK_CONFIG.scoreDuration) { slot.node.hidden = true; continue; }
      this.projected.copy(slot.position).addScaledVector(camera.up, 1.4).project(camera);
      const visible = Math.abs(this.projected.x) < 1.05 && Math.abs(this.projected.y) < 1.05 && Math.abs(this.projected.z) <= 1;
      slot.node.hidden = !visible;
      if (!visible) continue;
      const progress = slot.age / FEEDBACK_CONFIG.scoreDuration;
      const x = (this.projected.x * 0.5 + 0.5) * window.innerWidth;
      const y = (-this.projected.y * 0.5 + 0.5) * window.innerHeight - (this.reducedMotion ? 0 : progress * 30);
      slot.node.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      slot.node.style.opacity = String(Math.min(1, (1 - progress) * 2));
    }
  }

  reset() {
    for (const slot of this.slots) { slot.age = Infinity; slot.points = 0; slot.node.hidden = true; }
  }

  get activeCount() { return this.slots.filter((slot) => slot.age < FEEDBACK_CONFIG.scoreDuration).length; }
}
