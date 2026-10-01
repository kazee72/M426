export interface PokemonNeeds {
  /** 0 (starving) to 100 (full) */
  hunger: number;
  /** 0 (exhausted) to 100 (energized) */
  energy: number;
  /** 0 (depressed) to 100 (ecstatic) */
  happiness: number;
}

export type NeedType = keyof PokemonNeeds;

export interface PokemonSpecies {
  id: number;
  name: string;
  displayName: string;
  spriteSlug: string;
  types: string[];
  colorTheme: string;
}

export type PetMood = 
  | 'ecstatic' 
  | 'happy' 
  | 'content' 
  | 'tired' 
  | 'hungry' 
  | 'starving' 
  | 'exhausted' 
  | 'sad' 
  | 'sleeping';

export interface PokemonState {
  id: string;
  species: PokemonSpecies;
  nickname: string;
  level: number;
  experience: number;
  maxExperience: number;
  needs: PokemonNeeds;
  isSleeping: boolean;
  /** Milliseconds timestamp when state was last calculated and stored */
  lastUpdated: number;
  /** Milliseconds timestamp when pet was adopted */
  createdAt: number;
  /** Status message or recent event description */
  statusMessage?: string;
  /** Emotion bubble shown over sprite */
  currentEmote?: string;
}

export interface DecayConfig {
  /** Hunger points lost per hour while awake */
  hungerDecayPerHour: number;
  /** Energy points lost per hour while awake */
  energyDecayPerHour: number;
  /** Happiness points lost per hour while awake */
  happinessDecayPerHour: number;
  /** Energy points regenerated per hour while sleeping */
  sleepEnergyRegenPerHour: number;
  /** Hunger points lost per hour while sleeping (slower metabolism) */
  sleepHungerDecayPerHour: number;
  /** Multiplier for happiness decay if hunger or energy is critically low (<20) */
  neglectPenaltyMultiplier: number;
}

export interface ActionFeedback {
  success: boolean;
  message: string;
  emote?: string;
  expGained?: number;
}
