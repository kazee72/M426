import { useCallback, useEffect, useRef, useState } from 'react';
import type { ActionFeedback, PokemonSpecies, PokemonState } from '../types/pokemon';
import { calculateDecayedState } from '../utils/decay';
import {
  createInitialPokemonState,
  loadPokemonState,
  resetPokemonState,
  savePokemonState,
  subscribeToPokemonStateChanges,
} from '../utils/storage';

export function usePokemonPet() {
  const [state, setState] = useState<PokemonState | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastFeedback, setLastFeedback] = useState<ActionFeedback | null>(null);
  const feedbackTimeoutRef = useRef<number | null>(null);

  // Show temporary action feedback/emote
  const triggerFeedback = useCallback((feedback: ActionFeedback) => {
    setLastFeedback(feedback);
    if (feedbackTimeoutRef.current) {
      window.clearTimeout(feedbackTimeoutRef.current);
    }
    feedbackTimeoutRef.current = window.setTimeout(() => {
      setLastFeedback(null);
    }, 2800);
  }, []);

  // Helper to apply exp and check level up
  const addExperience = (currentState: PokemonState, expToAdd: number): { level: number; exp: number; maxExp: number; leveledUp: boolean } => {
    let level = currentState.level;
    let exp = currentState.experience + expToAdd;
    let maxExp = currentState.maxExperience;
    let leveledUp = false;

    while (exp >= maxExp) {
      exp -= maxExp;
      level += 1;
      maxExp = Math.round(maxExp * 1.25);
      leveledUp = true;
    }

    return { level, exp, maxExp, leveledUp };
  };

  // 1. Initial Load & Storage Subscription
  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        const loaded = await loadPokemonState();
        if (isMounted) {
          setState(loaded);
          setLoading(false);
        }
      } catch (e) {
        console.error('Failed to load Pokémon state:', e);
        if (isMounted) {
          setState(createInitialPokemonState());
          setLoading(false);
        }
      }
    }

    init();

    // Sync with external updates
    const unsubscribe = subscribeToPokemonStateChanges((newState) => {
      if (isMounted) {
        setState(newState);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
      if (feedbackTimeoutRef.current) {
        window.clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  // Keep a ref so the interval callback always has latest state
  const stateRef = useRef<PokemonState | null>(null);
  stateRef.current = state;

  // 2. Real-time active decay ticker (stable interval, never re-created)
  useEffect(() => {
    const interval = window.setInterval(() => {
      const prev = stateRef.current;
      if (!prev) return;
      const now = Date.now();
      if (now - prev.lastUpdated < 1000) return;
      const updated = calculateDecayedState(prev, now);
      savePokemonState(updated);
      setState(updated);
    }, 3000);
    return () => window.clearInterval(interval);
  }, []); // stable — never re-runs


  // Actions
  const feed = useCallback(async () => {
    if (!state) return;

    if (state.isSleeping) {
      triggerFeedback({
        success: false,
        message: `${state.nickname} is fast asleep! Wake them up first.`,
        emote: '💤',
      });
      return;
    }

    if (state.needs.hunger >= 98) {
      triggerFeedback({
        success: false,
        message: `${state.nickname} is completely full! 😋`,
        emote: '✨',
      });
      return;
    }

    const newHunger = Math.min(100, Math.round(state.needs.hunger + 25));
    const newHappiness = Math.min(100, Math.round(state.needs.happiness + 5));
    const { level, exp, maxExp, leveledUp } = addExperience(state, 8);

    const updated: PokemonState = {
      ...state,
      level,
      experience: exp,
      maxExperience: maxExp,
      needs: {
        ...state.needs,
        hunger: newHunger,
        happiness: newHappiness,
      },
      lastUpdated: Date.now(),
      statusMessage: leveledUp
        ? `Level UP! ${state.nickname} reached Level ${level}! 🌟`
        : `Yummy! ${state.nickname} happily munched on a Berry! (+25 Hunger)`,
      currentEmote: leveledUp ? '🌟' : '🍎',
    };

    setState(updated);
    await savePokemonState(updated);

    triggerFeedback({
      success: true,
      message: leveledUp ? `LEVEL UP! Level ${level}!` : `Fed ${state.nickname}! (+25 Hunger, +8 EXP)`,
      emote: leveledUp ? '🌟' : '🍎',
      expGained: 8,
    });
  }, [state, triggerFeedback]);

  const play = useCallback(async () => {
    if (!state) return;

    if (state.isSleeping) {
      triggerFeedback({
        success: false,
        message: `${state.nickname} is sleeping. Can't play right now!`,
        emote: '💤',
      });
      return;
    }

    if (state.needs.energy < 15) {
      triggerFeedback({
        success: false,
        message: `${state.nickname} is too exhausted to play! Let them rest.`,
        emote: '🥱',
      });
      return;
    }

    const newHappiness = Math.min(100, Math.round(state.needs.happiness + 25));
    const newEnergy = Math.max(0, Math.round(state.needs.energy - 12));
    const newHunger = Math.max(0, Math.round(state.needs.hunger - 6));
    const { level, exp, maxExp, leveledUp } = addExperience(state, 15);

    const updated: PokemonState = {
      ...state,
      level,
      experience: exp,
      maxExperience: maxExp,
      needs: {
        hunger: newHunger,
        energy: newEnergy,
        happiness: newHappiness,
      },
      lastUpdated: Date.now(),
      statusMessage: leveledUp
        ? `Level UP! ${state.nickname} reached Level ${level}! 🌟`
        : `${state.nickname} had a blast playing with you! (+25 Fun)`,
      currentEmote: leveledUp ? '🌟' : '🎾',
    };

    setState(updated);
    await savePokemonState(updated);

    triggerFeedback({
      success: true,
      message: leveledUp ? `LEVEL UP! Level ${level}!` : `Played with ${state.nickname}! (+25 Fun, -12 Energy)`,
      emote: leveledUp ? '🌟' : '🎾',
      expGained: 15,
    });
  }, [state, triggerFeedback]);

  const toggleSleep = useCallback(async () => {
    if (!state) return;

    const willSleep = !state.isSleeping;

    const updated: PokemonState = {
      ...state,
      isSleeping: willSleep,
      lastUpdated: Date.now(),
      statusMessage: willSleep
        ? `${state.nickname} curled up and fell asleep... 💤`
        : `${state.nickname} woke up energized and ready to go! ☀️`,
      currentEmote: willSleep ? '💤' : '☀️',
    };

    setState(updated);
    await savePokemonState(updated);

    triggerFeedback({
      success: true,
      message: willSleep ? `${state.nickname} went to sleep.` : `${state.nickname} woke up!`,
      emote: willSleep ? '💤' : '☀️',
    });
  }, [state, triggerFeedback]);

  const pet = useCallback(async () => {
    if (!state) return;

    if (state.isSleeping) {
      triggerFeedback({
        success: false,
        message: `${state.nickname} is sleeping peacefully... Shh!`,
        emote: '💤',
      });
      return;
    }

    const newHappiness = Math.min(100, Math.round(state.needs.happiness + 8));
    const { level, exp, maxExp, leveledUp } = addExperience(state, 4);

    const updated: PokemonState = {
      ...state,
      level,
      experience: exp,
      maxExperience: maxExp,
      needs: {
        ...state.needs,
        happiness: newHappiness,
      },
      lastUpdated: Date.now(),
      statusMessage: `${state.nickname} leans into your hand happily! 💖`,
      currentEmote: '💖',
    };

    setState(updated);
    await savePokemonState(updated);

    triggerFeedback({
      success: true,
      message: `Petted ${state.nickname}! 💖 (+8 Happiness)`,
      emote: '💖',
      expGained: 4,
    });
  }, [state, triggerFeedback]);

  const changeSpecies = useCallback(async (newSpecies: PokemonSpecies) => {
    if (!state) return;

    const updated: PokemonState = {
      ...state,
      species: newSpecies,
      nickname: newSpecies.displayName,
      lastUpdated: Date.now(),
      statusMessage: `Say hello to your new companion, ${newSpecies.displayName}! ✨`,
      currentEmote: '✨',
    };

    setState(updated);
    await savePokemonState(updated);

    triggerFeedback({
      success: true,
      message: `Changed Pokémon to ${newSpecies.displayName}!`,
      emote: '✨',
    });
  }, [state, triggerFeedback]);

  const setCustomNickname = useCallback(async (nickname: string) => {
    if (!state) return;

    const trimmed = nickname.trim() || state.species.displayName;
    const updated: PokemonState = {
      ...state,
      nickname: trimmed,
      lastUpdated: Date.now(),
    };

    setState(updated);
    await savePokemonState(updated);
  }, [state]);

  const resetAllStats = useCallback(async () => {
    if (!state) return;
    const fresh = await resetPokemonState(state.species);
    setState(fresh);
    triggerFeedback({
      success: true,
      message: 'All stats reset to 100%!',
      emote: '✨',
    });
  }, [state, triggerFeedback]);

  // Simulation tool for testing offline decay
  const fastForwardHours = useCallback(async (hours: number) => {
    if (!state) return;
    const simulatedOldTime = state.lastUpdated - hours * 3600 * 1000;
    const simulatedOldState: PokemonState = {
      ...state,
      lastUpdated: simulatedOldTime,
    };
    const decayed = calculateDecayedState(simulatedOldState, Date.now());
    setState(decayed);
    await savePokemonState(decayed);

    triggerFeedback({
      success: true,
      message: `Fast-forwarded ${hours} hour(s) of offline time!`,
      emote: '⏳',
    });
  }, [state, triggerFeedback]);

  return {
    state,
    loading,
    lastFeedback,
    actions: {
      feed,
      play,
      toggleSleep,
      pet,
      changeSpecies,
      setCustomNickname,
      resetAllStats,
      fastForwardHours,
    },
  };
}
