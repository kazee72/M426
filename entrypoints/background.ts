import { calculateDecayedState } from '../src/utils/decay';
import type { PokemonState } from '../src/types/pokemon';

export default defineBackground(() => {
  // ── Icon click → toggle overlay visibility on the active tab ──────────────
  browser.action.onClicked.addListener(async (tab) => {
    if (!tab.id) return;

    // Try sending a toggle message to the content script
    try {
      await browser.tabs.sendMessage(tab.id, { type: 'POKEPET_TOGGLE' });
    } catch {
      // Content script not yet injected on this tab — inject it manually
      try {
        await browser.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['/content-scripts/content.js'],
        });
      } catch (e) {
        console.warn('[PokePet] Could not inject content script:', e);
      }
    }
  });

  // ── Background decay sync via alarms ──────────────────────────────────────
  const syncDecay = async () => {
    try {
      const data = await browser.storage.local.get('pokemon_pet_state_v1');
      const state = data['pokemon_pet_state_v1'] as PokemonState | undefined;
      if (!state || !state.needs) return;

      const now = Date.now();
      if (now - state.lastUpdated < 30_000) return;

      const updated = calculateDecayedState(state, now);
      await browser.storage.local.set({ 'pokemon_pet_state_v1': updated });

      // Show badge warning if pet is struggling
      if (updated.needs.hunger <= 15 || updated.needs.energy <= 15 || updated.needs.happiness <= 15) {
        await browser.action.setBadgeText({ text: '!' });
        await browser.action.setBadgeBackgroundColor({ color: '#ef4444' });
      } else {
        await browser.action.setBadgeText({ text: '' });
      }
    } catch (e) {
      console.warn('[PokePet] Background sync error:', e);
    }
  };

  browser.alarms.create('pokepet_sync', { periodInMinutes: 5 });
  browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'pokepet_sync') syncDecay();
  });

  syncDecay();
});
