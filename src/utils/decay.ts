import { DEFAULT_DECAY_CONFIG } from '../constants/pokemonPresets';
import type { DecayConfig, PetMood, PokemonNeeds, PokemonState } from '../types/pokemon';

/**
 * Calculates current needs after a given time delta has elapsed.
 * Fully accounts for offline/closed-tab time using timestamps.
 *
 * @param state Previous saved state
 * @param currentTime Target current timestamp in ms (defaults to Date.now())
 * @param config Optional decay configuration parameters
 */
export function calculateDecayedState(
  state: PokemonState,
  currentTime: number = Date.now(),
  config: DecayConfig = DEFAULT_DECAY_CONFIG
): PokemonState {
  const elapsedMs = Math.max(0, currentTime - state.lastUpdated);
  if (elapsedMs <= 0) {
    return state;
  }

  const elapsedHours = elapsedMs / (1000 * 60 * 60);

  let newHunger = state.needs.hunger;
  let newEnergy = state.needs.energy;
  let newHappiness = state.needs.happiness;
  let isSleeping = state.isSleeping;

  if (isSleeping) {
    // While sleeping:
    // 1. Energy regenerates
    newEnergy = Math.min(100, newEnergy + elapsedHours * config.sleepEnergyRegenPerHour);

    // 2. Hunger decays slower (reduced metabolism)
    newHunger = Math.max(0, newHunger - elapsedHours * config.sleepHungerDecayPerHour);

    // 3. Happiness stays mostly steady during gentle sleep
    // (slightly drops if starving)
    if (newHunger <= 0) {
      newHappiness = Math.max(0, newHappiness - elapsedHours * (config.happinessDecayPerHour * 0.3));
    }

    // Auto wake-up if fully rested (reached 100 energy)
    if (newEnergy >= 100) {
      isSleeping = false;
    }
  } else {
    // While awake:
    // 1. Hunger decays
    newHunger = Math.max(0, newHunger - elapsedHours * config.hungerDecayPerHour);

    // 2. Energy decays
    newEnergy = Math.max(0, newEnergy - elapsedHours * config.energyDecayPerHour);

    // 3. Happiness decays
    // Neglect penalty: if hunger or energy is critically low (<20), happiness decays faster
    const isNeglected = newHunger < 20 || newEnergy < 20;
    const penaltyMultiplier = isNeglected ? config.neglectPenaltyMultiplier : 1.0;
    const happinessLoss = elapsedHours * config.happinessDecayPerHour * penaltyMultiplier;

    newHappiness = Math.max(0, newHappiness - happinessLoss);
  }

  const updatedNeeds: PokemonNeeds = {
    hunger: Math.round(newHunger * 10) / 10,
    energy: Math.round(newEnergy * 10) / 10,
    happiness: Math.round(newHappiness * 10) / 10,
  };

  return {
    ...state,
    needs: updatedNeeds,
    isSleeping,
    lastUpdated: currentTime,
  };
}

/**
 * Determines the pet's current mood based on its need levels and sleep state.
 */
export function determineMood(state: PokemonState): {
  mood: PetMood;
  label: string;
  emoji: string;
  description: string;
} {
  if (state.isSleeping) {
    return {
      mood: 'sleeping',
      label: 'Sleeping',
      emoji: '💤',
      description: `${state.nickname} is resting peacefully...`,
    };
  }

  const { hunger, energy, happiness } = state.needs;
  const avg = (hunger + energy + happiness) / 3;

  if (hunger <= 10) {
    return {
      mood: 'starving',
      label: 'Starving!',
      emoji: '🍖',
      description: `${state.nickname} is desperately hungry! Please feed them!`,
    };
  }

  if (energy <= 15) {
    return {
      mood: 'exhausted',
      label: 'Exhausted',
      emoji: '🥱',
      description: `${state.nickname} can barely keep their eyes open. Needs rest!`,
    };
  }

  if (happiness <= 15) {
    return {
      mood: 'sad',
      label: 'Depressed',
      emoji: '😢',
      description: `${state.nickname} is feeling lonely and neglected.`,
    };
  }

  if (avg >= 85) {
    return {
      mood: 'ecstatic',
      label: 'Ecstatic!',
      emoji: '✨',
      description: `${state.nickname} is beaming with joy and full of life!`,
    };
  }

  if (avg >= 60) {
    return {
      mood: 'happy',
      label: 'Happy',
      emoji: '😊',
      description: `${state.nickname} is having a great time!`,
    };
  }

  if (avg >= 35) {
    return {
      mood: 'content',
      label: 'Content',
      emoji: '🙂',
      description: `${state.nickname} is doing okay, but could use some attention.`,
    };
  }

  return {
    mood: 'tired',
    label: 'Sluggish',
    emoji: '😟',
    description: `${state.nickname} is feeling drained and needs some care.`,
  };
}

/**
 * Formats a timestamp into human-readable elapsed duration (e.g. "5m ago", "2h ago")
 */
export function formatElapsedTime(lastUpdated: number, now: number = Date.now()): string {
  const diffSec = Math.floor((now - lastUpdated) / 1000);
  if (diffSec < 10) return 'just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
