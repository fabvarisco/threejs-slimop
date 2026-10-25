import { Vector3 } from 'three';

const FORWARD = new Vector3();
const RIGHT = new Vector3();
const UP = new Vector3(0, 1, 0);
export const MOVEMENT_KEYS = Object.freeze(['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright']);

export function keyboardAxes(keys) {
  return {
    x: Number(keys.has('d') || keys.has('arrowright')) - Number(keys.has('a') || keys.has('arrowleft')),
    y: Number(keys.has('s') || keys.has('arrowdown')) - Number(keys.has('w') || keys.has('arrowup'))
  };
}

export function cameraRelativeDirection(camera, x, y, output) {
  if (Math.hypot(x, y) < 0.001) return output.set(0, 0, 0);
  camera.getWorldDirection(FORWARD);
  FORWARD.y = 0;
  if (FORWARD.lengthSq() < 1e-8) {
    RIGHT.setFromMatrixColumn(camera.matrixWorld, 0).setY(0).normalize();
    FORWARD.set(RIGHT.z, 0, -RIGHT.x);
  }
  FORWARD.normalize();
  RIGHT.crossVectors(FORWARD, UP).normalize();
  return output.copy(RIGHT).multiplyScalar(x).addScaledVector(FORWARD, -y).normalize().setY(0);
}

// Integrate exponential acceleration analytically rather than using endpoint Euler
// integration. Distance is consistent across different frame subdivisions.
export function advanceMovement(position, velocity, input, speed, dt) {
  if (input.lengthSq() < 0.001) {
    velocity.set(0, 0, 0);
    return;
  }
  const rate = -Math.log(0.0001);
  const decay = Math.exp(-rate * dt);
  const integral = (1 - decay) / rate;
  for (const axis of ['x', 'z']) {
    const target = input[axis] * speed;
    position[axis] += target * dt + (velocity[axis] - target) * integral;
    velocity[axis] = target + (velocity[axis] - target) * decay;
  }
}
