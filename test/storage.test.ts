import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  createInitialPokemonState, 
  savePokemonState, 
  loadPokemonState,
  subscribeToPokemonStateChanges 
} from '../src/utils/storage';

// Mock the extension environment globally
const mockChromeStorage = {
  local: {
    get: vi.fn(),
    set: vi.fn(),
  },
  onChanged: {
    addListener: vi.fn(),
    removeListener: vi.fn(),
  },
};

(globalThis as any).chrome = {
  storage: mockChromeStorage,
};

describe('storage utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createInitialPokemonState generates a valid fresh state', () => {
    const state = createInitialPokemonState();
    expect(state).toHaveProperty('id');
    expect(state.speciesId).toBe('pikachu');
    expect(state.needs.hunger).toBe(100);
    expect(state.needs.energy).toBe(100);
    expect(state.needs.happiness).toBe(100);
    expect(state.level).toBe(1);
  });

  it('savePokemonState sets data to chrome storage', () => {
    const state = createInitialPokemonState();
    savePokemonState(state);
    
    expect(mockChromeStorage.local.set).toHaveBeenCalledWith({
      pokemon_pet_state_v1: state
    });
  });

  it('loadPokemonState gets data from chrome storage', async () => {
    const state = createInitialPokemonState();
    mockChromeStorage.local.get.mockImplementation((key, cb) => {
      if (cb) cb({ pokemon_pet_state_v1: state });
      else return Promise.resolve({ pokemon_pet_state_v1: state });
    });

    const loaded = await loadPokemonState();
    expect(loaded).toEqual(state);
    expect(mockChromeStorage.local.get).toHaveBeenCalledWith('pokemon_pet_state_v1', expect.any(Function));
  });

  it('loadPokemonState falls back to initial state if not found', async () => {
    mockChromeStorage.local.get.mockImplementation((key, cb) => {
      if (cb) cb({}); // empty result
      else return Promise.resolve({});
    });

    const loaded = await loadPokemonState();
    expect(loaded).toBeDefined();
    expect(loaded.speciesId).toBe('pikachu');
  });
});
