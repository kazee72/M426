import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  createInitialPokemonState, 
  savePokemonState, 
  loadPokemonState
} from '../src/utils/storage';

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
    vi.useFakeTimers();
    vi.setSystemTime(1000000000);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('createInitialPokemonState generates a valid fresh state', () => {
    const state = createInitialPokemonState();
    expect(state).toHaveProperty('id');
    expect(state.species.id).toBe(25);
    expect(state.needs.hunger).toBe(100);
  });

  it('savePokemonState sets data to chrome storage', async () => {
    const state = createInitialPokemonState();
    await savePokemonState(state);
    
    expect(mockChromeStorage.local.set).toHaveBeenCalledWith({
      pokemon_pet_state_v1: state
    });
  });

  it('loadPokemonState gets data from chrome storage', async () => {
    const state = createInitialPokemonState();
    mockChromeStorage.local.get.mockResolvedValue({ pokemon_pet_state_v1: state });

    const loaded = await loadPokemonState();
    expect(loaded).toEqual(state);
    expect(mockChromeStorage.local.get).toHaveBeenCalledWith('pokemon_pet_state_v1');
  });

  it('loadPokemonState falls back to initial state if not found', async () => {
    mockChromeStorage.local.get.mockResolvedValue({});

    const loaded = await loadPokemonState();
    expect(loaded).toBeDefined();
    expect(loaded.species.id).toBe(25);
  });
});
