import type { PokemonSpecies } from '../types/pokemon';

export function getPokemonSpriteUrls(species: PokemonSpecies): string[] {
  const slug = species.spriteSlug.toLowerCase().trim();
  const id = species.id;

  return [
    // 1. Pokémon Database animated sprite (Black/White style - standard requested by user)
    `https://img.pokemondb.net/sprites/black-white/anim/normal/${slug}.gif`,
    // 2. PokeAPI Showdown animated sprite (Gen 5-9 animated showdown)
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${id}.gif`,
    // 3. Pokémon Database static sprite
    `https://img.pokemondb.net/sprites/bank/normal/${slug}.png`,
    // 4. PokeAPI Official Artwork
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
    // 5. PokeAPI standard front sprite
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
  ];
}

/**
 * Clean SVG fallback data URI of a Pokeball for full offline safety
 */
export const POKEBALL_FALLBACK_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="48" fill="%23fff" stroke="%23333" stroke-width="4"/><path d="M 2 50 A 48 48 0 0 1 98 50 Z" fill="%23e3350d" stroke="%23333" stroke-width="4"/><line x1="2" y1="50" x2="98" y2="50" stroke="%23333" stroke-width="6"/><circle cx="50" cy="50" r="14" fill="%23fff" stroke="%23333" stroke-width="5"/><circle cx="50" cy="50" r="6" fill="%23fff" stroke="%23333" stroke-width="2"/></svg>`;
