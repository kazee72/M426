import { describe, it, expect } from 'vitest';
import { getSpriteUrl } from '../src/utils/sprites';
import { POKEMON_PRESETS } from '../src/constants/pokemonPresets';

describe('sprites utility', () => {
  it('returns local storage url if user has customized spriteUrl', () => {
    const customUrl = 'https://example.com/custom.gif';
    const urls = getSpriteUrl(POKEMON_PRESETS[0], false, customUrl);
    expect(urls[0]).toBe(customUrl);
  });

  it('returns sleeping sprite if isSleeping is true and preset supports it', () => {
    // Snorlax supports sleep sprite
    const snorlax = POKEMON_PRESETS.find(p => p.id === 'snorlax');
    const urls = getSpriteUrl(snorlax!, true);
    
    expect(urls.length).toBeGreaterThan(0);
    // The sleeping URL logic appends -sleep
    expect(urls[0]).toContain('-sleep');
  });

  it('generates standard fallback hierarchy for awake pokemon', () => {
    const urls = getSpriteUrl(POKEMON_PRESETS[0], false);
    
    expect(urls).toContain('https://img.pokemondb.net/sprites/black-white/anim/normal/pikachu.gif');
    expect(urls).toContain('https://img.pokemondb.net/sprites/home/normal/pikachu.png');
    // Ensure the array has multiple fallback options
    expect(urls.length).toBeGreaterThan(2);
  });
});
