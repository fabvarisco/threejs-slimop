export const MATCH_CONFIG = Object.freeze({
  durationSeconds: 120,
  rivalCount: 4,
  playerStartProtectionSeconds: 6,
  countdownWarningSeconds: 15,
  unlockBannerSeconds: 3,
  botIntentCommitmentSeconds: 0.6
});

export function getMatchTimeLeft(elapsedSeconds) {
  return Math.max(0, MATCH_CONFIG.durationSeconds - Math.max(0, elapsedSeconds));
}

export function isMatchTimeExpired(elapsedSeconds) {
  return elapsedSeconds >= MATCH_CONFIG.durationSeconds;
}
