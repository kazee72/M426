import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { usePokemonPet } from '../src/hooks/usePokemonPet';
import * as storage from '../src/utils/storage';
import { POKEMON_PRESETS } from '../src/constants/pokemonPresets';

// Mock storage functions
vi.mock('../src/utils/storage', async () => {
  const actual = await vi.importActual<typeof import('../src/utils/storage')>('../src/utils/storage');
  return {
    ...actual,
    loadPokemonState: vi.fn(),
    savePokemonState: vi.fn(),
    resetPokemonState: vi.fn(),
    subscribeToPokemonStateChanges: vi.fn(() => () => {}), // Returns cleanup function
  };
});

describe('usePokemonPet Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads initial state from storage', async () => {
    const initialState = storage.createInitialPokemonState();
    (storage.loadPokemonState as any).mockResolvedValue(initialState);

    const { result } = renderHook(() => usePokemonPet());

    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.state).toBeNull();

    // Wait for async load
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.state).toEqual(initialState);
  });

  it('handles feeding action', async () => {
    const initialState = storage.createInitialPokemonState();
    initialState.needs.hunger = 50;
    (storage.loadPokemonState as any).mockResolvedValue(initialState);

    const { result } = renderHook(() => usePokemonPet());

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.feed();
    });

    expect(result.current.state?.needs.hunger).toBe(75); // 50 + 25 = 75
    expect(storage.savePokemonState).toHaveBeenCalled();
    expect(result.current.lastFeedback?.emote).toBe('🍎');
  });

  it('prevents feeding when sleeping', async () => {
    const initialState = storage.createInitialPokemonState();
    initialState.isSleeping = true;
    (storage.loadPokemonState as any).mockResolvedValue(initialState);

    const { result } = renderHook(() => usePokemonPet());

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.feed();
    });

    // Should not increase hunger
    expect(result.current.state?.needs.hunger).toBe(100); 
    expect(result.current.lastFeedback?.success).toBe(false);
  });

  it('handles playing action', async () => {
    const initialState = storage.createInitialPokemonState();
    initialState.needs.happiness = 50;
    initialState.needs.energy = 100;
    (storage.loadPokemonState as any).mockResolvedValue(initialState);

    const { result } = renderHook(() => usePokemonPet());

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.play();
    });

    expect(result.current.state?.needs.happiness).toBe(70); // 50 + 20
    expect(result.current.state?.needs.energy).toBe(85); // 100 - 15
    expect(result.current.lastFeedback?.emote).toBe('🎾');
  });

  it('handles change species action', async () => {
    const initialState = storage.createInitialPokemonState();
    (storage.loadPokemonState as any).mockResolvedValue(initialState);

    const { result } = renderHook(() => usePokemonPet());

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.changeSpecies(POKEMON_PRESETS[1]); // Charmander
    });

    expect(result.current.state?.speciesId).toBe('charmander');
    expect(result.current.state?.nickname).toBe('Charmander');
  });
});
