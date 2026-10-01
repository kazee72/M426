import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { usePokemonPet } from '../src/hooks/usePokemonPet';
import * as storage from '../src/utils/storage';
import { POKEMON_PRESETS } from '../src/constants/pokemonPresets';

vi.mock('../src/utils/storage', async () => {
  const actual = await vi.importActual<typeof import('../src/utils/storage')>('../src/utils/storage');
  return {
    ...actual,
    loadPokemonState: vi.fn(),
    savePokemonState: vi.fn(),
    resetPokemonState: vi.fn(),
    subscribeToPokemonStateChanges: vi.fn(() => () => {}),
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

    expect(result.current.loading).toBe(true);
    expect(result.current.state).toBeNull();

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
      await result.current.actions.feed();
    });

    expect(result.current.state?.needs.hunger).toBe(75);
    expect(storage.savePokemonState).toHaveBeenCalled();
    expect(result.current.lastFeedback?.success).toBe(true);
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
      await result.current.actions.feed();
    });

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
      await result.current.actions.play();
    });

    expect(result.current.state?.needs.happiness).toBe(75);
    expect(result.current.state?.needs.energy).toBe(88);
  });

  it('handles change species action', async () => {
    const initialState = storage.createInitialPokemonState();
    (storage.loadPokemonState as any).mockResolvedValue(initialState);

    const { result } = renderHook(() => usePokemonPet());

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.actions.changeSpecies(POKEMON_PRESETS[1]);
    });

    expect(result.current.state?.species.id).toBe(4);
    expect(result.current.state?.nickname).toBe('Charmander');
  });
});
