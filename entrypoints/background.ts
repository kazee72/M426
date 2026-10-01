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
      const state = data['pokemon_pet_state_v1'] as Record<string, unknown> | undefined;
      if (!state) return;

      const now = Date.now();
      const lastUpdated = state['lastUpdated'] as number ?? now;
      const elapsedH = Math.max(0, now - lastUpdated) / 3_600_000;
      if (elapsedH < 0.01) return;

      const needs = state['needs'] as { hunger: number; energy: number; happiness: number } ?? { hunger: 100, energy: 100, happiness: 100 };
      const isSleeping = state['isSleeping'] as boolean ?? false;

      if (isSleeping) {
        needs.energy   = Math.min(100, needs.energy   + elapsedH * 25);
        needs.hunger   = Math.max(0,   needs.hunger   - elapsedH * 3);
      } else {
        needs.hunger    = Math.max(0, needs.hunger    - elapsedH * 10);
        needs.energy    = Math.max(0, needs.energy    - elapsedH * 8);
        const pen       = (needs.hunger < 20 || needs.energy < 20) ? 1.5 : 1;
        needs.happiness = Math.max(0, needs.happiness - elapsedH * 12 * pen);
      }

      const updated = { ...state, needs, lastUpdated: now, isSleeping: isSleeping && needs.energy < 100 };
      await browser.storage.local.set({ 'pokemon_pet_state_v1': updated });

      // Show badge warning if pet is struggling
      if (needs.hunger <= 15 || needs.energy <= 15 || needs.happiness <= 15) {
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
