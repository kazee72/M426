import { describe, it, expect, beforeEach } from 'vitest';
import { calculateDecayedState, determineMood } from '../src/utils/decay';
import { createInitialPokemonState } from '../src/utils/storage';
import { DEFAULT_DECAY_CONFIG } from '../src/constants/pokemonPresets';
import type { PokemonState } from '../src/types/pokemon';

describe('decay logic', () => {
  let state: PokemonState;

  beforeEach(() => {
    state = createInitialPokemonState();
  });

  it('does not decay if time delta is too small', () => {
    const updated = calculateDecayedState(state, state.lastUpdated + 100);
    expect(updated.needs.hunger).toBe(100);
    expect(updated.needs.energy).toBe(100);
    expect(updated.needs.happiness).toBe(100);
  });

  it('decays stats correctly over time when awake', () => {
    const oneHourMs = 3600 * 1000;
    const updated = calculateDecayedState(state, state.lastUpdated + oneHourMs);
    
    expect(updated.needs.hunger).toBeCloseTo(100 - DEFAULT_DECAY_CONFIG.hungerDecayPerHour);
    expect(updated.needs.energy).toBeCloseTo(100 - DEFAULT_DECAY_CONFIG.energyDecayPerHour);
    expect(updated.needs.happiness).toBeCloseTo(100 - DEFAULT_DECAY_CONFIG.happinessDecayPerHour);
  });

  it('applies neglect penalty to happiness when hunger or energy are extremely low', () => {
    state.needs.hunger = 10;
    state.needs.energy = 10;
    
    const oneHourMs = 3600 * 1000;
    const updated = calculateDecayedState(state, state.lastUpdated + oneHourMs);
    
    const penalty = DEFAULT_DECAY_CONFIG.neglectPenaltyMultiplier;
    const expectedHappiness = 100 - (DEFAULT_DECAY_CONFIG.happinessDecayPerHour * penalty);
    expect(updated.needs.happiness).toBeCloseTo(expectedHappiness);
  });

  it('restores energy but decays hunger slightly when sleeping', () => {
    state.isSleeping = true;
    state.needs.energy = 50;
    state.needs.hunger = 50;
    
    const oneHourMs = 3600 * 1000;
    const updated = calculateDecayedState(state, state.lastUpdated + oneHourMs);
    
    expect(updated.needs.energy).toBeCloseTo(50 + DEFAULT_DECAY_CONFIG.sleepEnergyRegenPerHour);
    expect(updated.needs.hunger).toBeCloseTo(50 - DEFAULT_DECAY_CONFIG.sleepHungerDecayPerHour);
    expect(updated.needs.happiness).toBe(100);
  });

  it('wakes up automatically when energy reaches 100', () => {
    state.isSleeping = true;
    state.needs.energy = 80;
    
    const twoHoursMs = 2 * 3600 * 1000; 
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
    
    updated.isSleeping = true;
    const anotherFiveDaysMs = 5 * 24 * 3600 * 1000;
    const updated2 = calculateDecayedState(updated, updated.lastUpdated + anotherFiveDaysMs);
    
    expect(updated2.needs.energy).toBe(100); 
  });
});

describe('determineMood', () => {
  let state: PokemonState;

  beforeEach(() => {
    state = createInitialPokemonState();
  });

  it('returns sleeping mood if sleeping', () => {
    state.isSleeping = true;
    expect(determineMood(state).mood).toBe('sleeping');
  });

  it('returns starving mood if hunger <= 10', () => {
    state.needs.hunger = 5;
    expect(determineMood(state).mood).toBe('starving');
  });

  it('returns exhausted mood if energy <= 15', () => {
    state.needs.energy = 10;
    expect(determineMood(state).mood).toBe('exhausted');
  });

  it('returns sad mood if happiness <= 15', () => {
    state.needs.happiness = 10;
    expect(determineMood(state).mood).toBe('sad');
  });

  it('returns ecstatic mood if average >= 85', () => {
    state.needs = { hunger: 90, energy: 90, happiness: 90 };
    expect(determineMood(state).mood).toBe('ecstatic');
  });

  it('returns content mood if average is moderate', () => {
    state.needs = { hunger: 50, energy: 50, happiness: 50 };
    expect(determineMood(state).mood).toBe('content');
  });
});
