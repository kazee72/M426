import { describe, it, expect } from 'vitest';
import { getPokemonSpriteUrls } from '../src/utils/sprites';
import { DEFAULT_POKEMON_SPECIES } from '../src/constants/pokemonPresets';

describe('sprites utility', () => {
  it('generates standard fallback hierarchy for pokemon', () => {
    const urls = getPokemonSpriteUrls(DEFAULT_POKEMON_SPECIES);
    
    expect(urls).toContain('https://img.pokemondb.net/sprites/black-white/anim/normal/pikachu.gif');
    expect(urls.length).toBeGreaterThan(2);
  });
});
