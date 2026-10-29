import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { usePokemonPet } from '../src/hooks/usePokemonPet';
import * as storage from '../src/utils/storage';
import { POKEMON_PRESETS, checkEvolution } from '../src/constants/pokemonPresets';

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

describe('usePokemonPet Hook & Evolution', () => {
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
      await result.current.actions.changeSpecies(POKEMON_PRESETS[1]!);
    });

    expect(result.current.state?.species.id).toBe(4);
    expect(result.current.state?.nickname).toBe('Charmander');
  });

  it('evolves Charmander into Charmeleon upon reaching level 5', async () => {
    const charmander = POKEMON_PRESETS[1]!; // id: 4
    const initialState = storage.createInitialPokemonState(charmander);
    initialState.level = 4;
    initialState.experience = 95;
    initialState.maxExperience = 100;
    (storage.loadPokemonState as any).mockResolvedValue(initialState);

    const { result } = renderHook(() => usePokemonPet());

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.actions.play(); // +15 EXP -> Level 5!
    });

    expect(result.current.state?.level).toBe(5);
    expect(result.current.state?.species.id).toBe(5);
    expect(result.current.state?.species.name).toBe('charmeleon');
    expect(result.current.state?.nickname).toBe('Charmeleon');
  });

  it('checkEvolution returns correct multi-stage evolution', () => {
    const bulbasaur = POKEMON_PRESETS[2]!; // id: 1
    expect(checkEvolution(bulbasaur, 3)).toBeNull();
    expect(checkEvolution(bulbasaur, 5)?.name).toBe('ivysaur');
    expect(checkEvolution(bulbasaur, 10)?.name).toBe('venusaur');
  });
});
