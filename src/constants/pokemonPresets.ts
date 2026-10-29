import type { DecayConfig, PokemonSpecies } from '../types/pokemon';

export const DEFAULT_DECAY_CONFIG: DecayConfig = {
  // ~10 points per hour = ~10 hours to reach 0 from 100
  hungerDecayPerHour: 10,
  // ~8 points per hour = ~12.5 hours
  energyDecayPerHour: 8,
  // ~12 points per hour = ~8 hours
  happinessDecayPerHour: 12,
  // Sleep recovers ~25 points per hour = ~4 hours for full sleep
  sleepEnergyRegenPerHour: 25,
  // Metabolism is slower during sleep (~3 points/hr)
  sleepHungerDecayPerHour: 3,
  // If critically starved or exhausted, happiness drops 1.5x faster
  neglectPenaltyMultiplier: 1.5,
};

export const POKEMON_PRESETS: PokemonSpecies[] = [
  {
    id: 25,
    name: 'pikachu',
    displayName: 'Pikachu',
    spriteSlug: 'pikachu',
    types: ['Electric'],
    colorTheme: '#f7d02c',
  },
  {
    id: 4,
    name: 'charmander',
    displayName: 'Charmander',
    spriteSlug: 'charmander',
    types: ['Fire'],
    colorTheme: '#f08030',
  },
  {
    id: 1,
    name: 'bulbasaur',
    displayName: 'Bulbasaur',
    spriteSlug: 'bulbasaur',
    types: ['Grass', 'Poison'],
    colorTheme: '#78c850',
  },
  {
    id: 7,
    name: 'squirtle',
    displayName: 'Squirtle',
    spriteSlug: 'squirtle',
    types: ['Water'],
    colorTheme: '#6890f0',
  },
  {
    id: 133,
    name: 'eevee',
    displayName: 'Eevee',
    spriteSlug: 'eevee',
    types: ['Normal'],
    colorTheme: '#c69966',
  },
  {
    id: 94,
    name: 'gengar',
    displayName: 'Gengar',
    spriteSlug: 'gengar',
    types: ['Ghost', 'Poison'],
    colorTheme: '#705898',
  },
  {
    id: 143,
    name: 'snorlax',
    displayName: 'Snorlax',
    spriteSlug: 'snorlax',
    types: ['Normal'],
    colorTheme: '#36616b',
  },
  {
    id: 39,
    name: 'jigglypuff',
    displayName: 'Jigglypuff',
    spriteSlug: 'jigglypuff',
    types: ['Normal', 'Fairy'],
    colorTheme: '#f85888',
  },
  {
    id: 448,
    name: 'lucario',
    displayName: 'Lucario',
    spriteSlug: 'lucario',
    types: ['Fighting', 'Steel'],
    colorTheme: '#2e7fa8',
  },
  {
    id: 151,
    name: 'mew',
    displayName: 'Mew',
    spriteSlug: 'mew',
    types: ['Psychic'],
    colorTheme: '#f85888',
  },
];

export const DEFAULT_POKEMON_SPECIES: PokemonSpecies = POKEMON_PRESETS[0]!;

export interface EvolutionRule {
  fromId: number;
  minLevel: number;
  toSpecies: PokemonSpecies;
}

export const EVOLUTION_CHAIN: EvolutionRule[] = [
  // Bulbasaur -> Ivysaur -> Venusaur
  {
    fromId: 1,
    minLevel: 5,
    toSpecies: { id: 2, name: 'ivysaur', displayName: 'Ivysaur', spriteSlug: 'ivysaur', types: ['Grass', 'Poison'], colorTheme: '#78c850' },
  },
  {
    fromId: 2,
    minLevel: 10,
    toSpecies: { id: 3, name: 'venusaur', displayName: 'Venusaur', spriteSlug: 'venusaur', types: ['Grass', 'Poison'], colorTheme: '#78c850' },
  },
  // Charmander -> Charmeleon -> Charizard
  {
    fromId: 4,
    minLevel: 5,
    toSpecies: { id: 5, name: 'charmeleon', displayName: 'Charmeleon', spriteSlug: 'charmeleon', types: ['Fire'], colorTheme: '#f08030' },
  },
  {
    fromId: 5,
    minLevel: 10,
    toSpecies: { id: 6, name: 'charizard', displayName: 'Charizard', spriteSlug: 'charizard', types: ['Fire', 'Flying'], colorTheme: '#f08030' },
  },
  // Squirtle -> Wartortle -> Blastoise
  {
    fromId: 7,
    minLevel: 5,
    toSpecies: { id: 8, name: 'wartortle', displayName: 'Wartortle', spriteSlug: 'wartortle', types: ['Water'], colorTheme: '#6890f0' },
  },
  {
    fromId: 8,
    minLevel: 10,
    toSpecies: { id: 9, name: 'blastoise', displayName: 'Blastoise', spriteSlug: 'blastoise', types: ['Water'], colorTheme: '#6890f0' },
  },
  // Pikachu -> Raichu
  {
    fromId: 25,
    minLevel: 8,
    toSpecies: { id: 26, name: 'raichu', displayName: 'Raichu', spriteSlug: 'raichu', types: ['Electric'], colorTheme: '#f7d02c' },
  },
  // Jigglypuff -> Wigglytuff
  {
    fromId: 39,
    minLevel: 8,
    toSpecies: { id: 40, name: 'wigglytuff', displayName: 'Wigglytuff', spriteSlug: 'wigglytuff', types: ['Normal', 'Fairy'], colorTheme: '#f85888' },
  },
  // Eevee -> Sylveon
  {
    fromId: 133,
    minLevel: 8,
    toSpecies: { id: 700, name: 'sylveon', displayName: 'Sylveon', spriteSlug: 'sylveon', types: ['Fairy'], colorTheme: '#f472b6' },
  },
];

export function checkEvolution(currentSpecies: PokemonSpecies, level: number): PokemonSpecies | null {
  let evolved: PokemonSpecies | null = null;
  let cursor = currentSpecies;
  // Support multi-step evolution if multiple levels gained at once
  for (let i = 0; i < 3; i++) {
    const rule = EVOLUTION_CHAIN.find(r => r.fromId === cursor.id && level >= r.minLevel);
    if (!rule) break;
    evolved = rule.toSpecies;
    cursor = rule.toSpecies;
  }
  return evolved;
}
