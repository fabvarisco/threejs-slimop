const SDK_SCRIPT_ID = 'crazygames-sdk';
const SDK_SCRIPT_URL = 'https://sdk.crazygames.com/crazygames-sdk-v3.js';

export class CrazyGamesBridge {
  constructor() {
    this.sdk = null;
    this.ready = false;
    this.gameplayActive = false;
    this.settingsListener = null;
  }

  async init(onSettingsChange = () => {}) {
    try {
      await this.loadSdk();
      this.sdk = window.CrazyGames?.SDK ?? null;
      if (!this.sdk) return false;

      await this.sdk.init();
      this.ready = true;
      this.settingsListener = (settings) => onSettingsChange(settings ?? {});
      onSettingsChange(this.sdk.game.settings ?? {});
      this.sdk.game.addSettingsChangeListener?.(this.settingsListener);
      return true;
    } catch {
      return false;
    }
  }

  loadSdk() {
    if (window.CrazyGames?.SDK) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`#${SDK_SCRIPT_ID}`);
      if (existing) {
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', reject, { once: true });
        return;
      }

      const script = document.createElement('script');
      script.id = SDK_SCRIPT_ID;
      script.src = SDK_SCRIPT_URL;
      script.async = true;
      script.addEventListener('load', resolve, { once: true });
      script.addEventListener('error', reject, { once: true });
      document.head.append(script);
    });
  }

  loadingStart() {
    if (this.ready) this.sdk.game.loadingStart();
  }

  loadingStop() {
    if (this.ready) this.sdk.game.loadingStop();
  }

  gameplayStart() {
    if (!this.ready || this.gameplayActive) return;
    this.gameplayActive = true;
    this.sdk.game.gameplayStart();
  }

  gameplayStop() {
    if (!this.ready || !this.gameplayActive) return;
    this.gameplayActive = false;
    this.sdk.game.gameplayStop();
  }

  setGameContext(context) {
    if (this.ready) this.sdk.game.setGameContext?.(context);
  }
}
