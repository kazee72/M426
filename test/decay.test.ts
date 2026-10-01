import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { calculateDecayedState, determineMood } from '../src/utils/decay';
import { createInitialPokemonState } from '../src/utils/storage';
import { DEFAULT_DECAY_CONFIG } from '../src/constants/pokemonPresets';
import type { PokemonState } from '../src/types/pokemon';

describe('decay logic', () => {
  let state: PokemonState;

  beforeEach(() => {
    state = createInitialPokemonState();
    // Default state: hunger 100, energy 100, happiness 100
  });

  it('does not decay if time delta is too small', () => {
    const updated = calculateDecayedState(state, state.lastUpdated + 100);
    expect(updated.needs.hunger).toBe(100);
    expect(updated.needs.energy).toBe(100);
    expect(updated.needs.happiness).toBe(100);
  });

  it('decays stats correctly over time when awake', () => {
    // Fast forward exactly 1 hour
    const oneHourMs = 3600 * 1000;
    const updated = calculateDecayedState(state, state.lastUpdated + oneHourMs);
    
    expect(updated.needs.hunger).toBeCloseTo(100 - DEFAULT_DECAY_CONFIG.awake.hungerPerHr);
    expect(updated.needs.energy).toBeCloseTo(100 - DEFAULT_DECAY_CONFIG.awake.energyPerHr);
    expect(updated.needs.happiness).toBeCloseTo(100 - DEFAULT_DECAY_CONFIG.awake.happinessPerHr);
  });

  it('applies neglect penalty to happiness when hunger or energy are extremely low', () => {
    state.needs.hunger = 10;
    state.needs.energy = 10;
    
    const oneHourMs = 3600 * 1000;
    const updated = calculateDecayedState(state, state.lastUpdated + oneHourMs);
    
    const penalty = DEFAULT_DECAY_CONFIG.neglectPenaltyMultipliers.happiness;
    const expectedHappiness = 100 - (DEFAULT_DECAY_CONFIG.awake.happinessPerHr * penalty);
    expect(updated.needs.happiness).toBeCloseTo(expectedHappiness);
  });

  it('restores energy but decays hunger slightly when sleeping', () => {
    state.isSleeping = true;
    state.needs.energy = 50;
    state.needs.hunger = 50;
    
    const oneHourMs = 3600 * 1000;
    const updated = calculateDecayedState(state, state.lastUpdated + oneHourMs);
    
    expect(updated.needs.energy).toBeCloseTo(50 + DEFAULT_DECAY_CONFIG.sleeping.energyRestorePerHr);
    expect(updated.needs.hunger).toBeCloseTo(50 - DEFAULT_DECAY_CONFIG.sleeping.hungerPerHr);
    // Happiness should not decay while sleeping
    expect(updated.needs.happiness).toBe(100);
  });

  it('wakes up automatically when energy reaches 100', () => {
    state.isSleeping = true;
    state.needs.energy = 80;
    
    const twoHoursMs = 2 * 3600 * 1000; // Will restore 50 energy
    const updated = calculateDecayedState(state, state.lastUpdated + twoHoursMs);
    
    expect(updated.needs.energy).toBe(100);
    expect(updated.isSleeping).toBe(false);
  });

  it('stats do not fall below 0 or exceed 100', () => {
    state.needs.hunger = 10;
    state.needs.energy = 10;
    state.needs.happiness = 10;

    const fiveDaysMs = 5 * 24 * 3600 * 1000;
    const updated = calculateDecayedState(state, state.lastUpdated + fiveDaysMs);
    
    expect(updated.needs.hunger).toBe(0);
    expect(updated.needs.energy).toBe(0);
    expect(updated.needs.happiness).toBe(0);
    
    state.isSleeping = true;
    const anotherFiveDaysMs = 5 * 24 * 3600 * 1000;
    const updated2 = calculateDecayedState(updated, updated.lastUpdated + anotherFiveDaysMs);
    
    expect(updated2.needs.energy).toBe(100); // capped at 100
  });
});

describe('determineMood', () => {
  let state: PokemonState;

  beforeEach(() => {
    state = createInitialPokemonState();
  });

  it('returns sleeping mood if sleeping', () => {
    state.isSleeping = true;
    expect(determineMood(state).name).toBe('sleeping');
  });

  it('returns hungry mood if hunger <= 10', () => {
    state.needs.hunger = 5;
    expect(determineMood(state).name).toBe('hungry');
  });

  it('returns tired mood if energy <= 15', () => {
    state.needs.energy = 10;
    expect(determineMood(state).name).toBe('tired');
  });

  it('returns sad mood if happiness <= 15', () => {
    state.needs.happiness = 10;
    expect(determineMood(state).name).toBe('sad');
  });

  it('returns happy mood if average >= 85', () => {
    state.needs = { hunger: 90, energy: 90, happiness: 90 };
    expect(determineMood(state).name).toBe('happy');
  });

  it('returns fine mood if average is moderate', () => {
    state.needs = { hunger: 50, energy: 50, happiness: 50 };
    expect(determineMood(state).name).toBe('fine');
  });
});
