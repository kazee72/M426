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
