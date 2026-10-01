import { DEFAULT_POKEMON_SPECIES } from '../constants/pokemonPresets';
import type { PokemonSpecies, PokemonState } from '../types/pokemon';
import { calculateDecayedState } from './decay';

const STORAGE_KEY = 'pokemon_pet_state_v1';

export function createInitialPokemonState(species: PokemonSpecies = DEFAULT_POKEMON_SPECIES): PokemonState {
  const now = Date.now();
  return {
    id: `pet_${species.id}_${now}`,
    species,
    nickname: species.displayName,
    level: 1,
    experience: 0,
    maxExperience: 100,
    needs: {
      hunger: 100,
      energy: 100,
      happiness: 100,
    },
    isSleeping: false,
    lastUpdated: now,
    createdAt: now,
    statusMessage: `Welcome your new companion, ${species.displayName}! 🎉`,
    currentEmote: '💖',
  };
}

/**
 * Helper to safely get the extension storage API across Chrome and Firefox.
 */
function getStorageApi() {
  const g = globalThis as unknown as {
    chrome?: { storage?: { local?: { get: (k: string) => Promise<Record<string, unknown>>; set: (o: Record<string, unknown>) => Promise<void> }; onChanged?: { addListener: (cb: (c: Record<string, { newValue?: unknown }>, a: string) => void) => void; removeListener: (cb: (c: Record<string, { newValue?: unknown }>, a: string) => void) => void } } };
    browser?: { storage?: { local?: { get: (k: string) => Promise<Record<string, unknown>>; set: (o: Record<string, unknown>) => Promise<void> }; onChanged?: { addListener: (cb: (c: Record<string, { newValue?: unknown }>, a: string) => void) => void; removeListener: (cb: (c: Record<string, { newValue?: unknown }>, a: string) => void) => void } } };
  };

  if (g.browser?.storage?.local) {
    return { local: g.browser.storage.local, onChanged: g.browser.storage.onChanged };
  }
  if (g.chrome?.storage?.local) {
    return { local: g.chrome.storage.local, onChanged: g.chrome.storage.onChanged };
  }
  return null;
}

/**
 * Loads Pokémon state from chrome.storage.local / browser.storage.local with localStorage fallback.
 * Automatically recalculates decayed stats based on elapsed offline time since last save.
 */
export async function loadPokemonState(): Promise<PokemonState> {
  let rawState: PokemonState | null = null;
  const storage = getStorageApi();

  try {
    if (storage?.local) {
      const result = await storage.local.get(STORAGE_KEY);
      if (result && result[STORAGE_KEY]) {
        rawState = result[STORAGE_KEY] as PokemonState;
      }
    } else if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        rawState = JSON.parse(stored) as PokemonState;
      }
    }
  } catch (err) {
    console.warn('[PokePet] Error reading storage, falling back to initial state:', err);
  }

  if (!rawState) {
    const initialState = createInitialPokemonState();
    await savePokemonState(initialState);
    return initialState;
  }

  // Recalculate stats based on elapsed time since the extension popup was last closed
  const updatedState = calculateDecayedState(rawState, Date.now());

  // Save the updated decayed state if elapsed time modified stats
  if (updatedState.lastUpdated !== rawState.lastUpdated) {
    await savePokemonState(updatedState);
  }

  return updatedState;
}

/**
 * Saves Pokémon state to persistent extension storage.
 */
export async function savePokemonState(state: PokemonState): Promise<void> {
  const storage = getStorageApi();
  try {
    if (storage?.local) {
      await storage.local.set({ [STORAGE_KEY]: state });
    }
    // Also save to localStorage as backup / dev convenience
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } catch (err) {
    console.error('[PokePet] Error saving state:', err);
  }
}

/**
 * Resets the pet to default fresh stats or changes the species.
 */
export async function resetPokemonState(species?: PokemonSpecies): Promise<PokemonState> {
  const newState = createInitialPokemonState(species || DEFAULT_POKEMON_SPECIES);
  await savePokemonState(newState);
  return newState;
}

/**
 * Listens to external storage updates across extension contexts (popup, background, content scripts).
 */
export function subscribeToPokemonStateChanges(callback: (state: PokemonState) => void): () => void {
  const storage = getStorageApi();

  const extensionListener = (changes: Record<string, { newValue?: unknown }>, areaName: string) => {
    if (areaName === 'local' && changes[STORAGE_KEY]?.newValue) {
      callback(changes[STORAGE_KEY].newValue as PokemonState);
    }
  };

  const windowListener = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue) as PokemonState;
        callback(parsed);
      } catch {
        // ignore parse error
      }
    }
  };

  if (storage?.onChanged) {
    storage.onChanged.addListener(extensionListener);
  } else if (typeof window !== 'undefined') {
    window.addEventListener('storage', windowListener);
  }

  return () => {
    if (storage?.onChanged) {
      storage.onChanged.removeListener(extensionListener);
    } else if (typeof window !== 'undefined') {
      window.removeEventListener('storage', windowListener);
    }
  };
}
