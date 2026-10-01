import React, { useState } from 'react';
import { POKEMON_PRESETS } from '../constants/pokemonPresets';
import type { PokemonSpecies } from '../types/pokemon';

interface SpeciesSelectorProps {
  currentSpecies: PokemonSpecies;
  onSelectSpecies: (species: PokemonSpecies) => void;
  onClose: () => void;
}

export const SpeciesSelector: React.FC<SpeciesSelectorProps> = ({
  currentSpecies,
  onSelectSpecies,
  onClose,
}) => {
  const [customInput, setCustomInput] = useState('');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = customInput.trim().toLowerCase();
    if (!query) return;

    const idNumber = parseInt(query, 10);
    const isId = !isNaN(idNumber) && idNumber > 0 && idNumber <= 1025;

    const speciesName = isId ? `pokemon-${idNumber}` : query;
    const displayName = isId
      ? `Pokémon #${idNumber}`
      : query.charAt(0).toUpperCase() + query.slice(1);

    const customSpecies: PokemonSpecies = {
      id: isId ? idNumber : 9999,
      name: speciesName,
      displayName,
      spriteSlug: isId ? query : query.replace(/[^a-z0-9-]/g, ''),
      types: ['Custom'],
      colorTheme: '#6366f1',
    };

    onSelectSpecies(customSpecies);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        pointerEvents: 'auto',
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
      }}
    >
      <div
        style={{
          background: '#0f172a',
          border: '1px solid rgba(71, 85, 105, 0.8)',
          borderRadius: '16px',
          padding: '16px',
          width: '100%',
          maxWidth: '320px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '8px',
            borderBottom: '1px solid #334155',
          }}
        >
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>⚡</span> Choose Your Companion
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {/* Preset grid */}
        <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8' }}>Popular Companions</div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '6px',
            maxHeight: '190px',
            overflowY: 'auto',
            paddingRight: '4px',
          }}
        >
          {POKEMON_PRESETS.map((p) => {
            const isSelected = p.id === currentSpecies.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  onSelectSpecies(p);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 8px',
                  borderRadius: '10px',
                  border: isSelected ? '1px solid #f59e0b' : '1px solid #334155',
                  background: isSelected ? 'rgba(245, 158, 11, 0.2)' : 'rgba(30, 41, 59, 0.6)',
                  color: isSelected ? '#fde68a' : '#e2e8f0',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <img
                  src={`https://img.pokemondb.net/sprites/black-white/anim/normal/${p.spriteSlug}.gif`}
                  alt={p.displayName}
                  style={{ width: '26px', height: '26px', objectFit: 'contain' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`;
                  }}
                />
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.displayName}
                  </div>
                  <div style={{ fontSize: '9px', color: '#94a3b8' }}>#{p.id}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom Input */}
        <form
          onSubmit={handleCustomSubmit}
          style={{
            paddingTop: '8px',
            borderTop: '1px solid #334155',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <label style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 500 }}>
            Or enter custom Pokémon Name / Pokédex ID:
          </label>
          <div style={{ display: 'flex', gap: '6px' }}>
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="e.g. psyduck or 150"
              style={{
                flex: 1,
                background: '#020617',
                border: '1px solid #475569',
                borderRadius: '8px',
                padding: '6px 8px',
                fontSize: '11px',
                color: '#fff',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                background: '#f59e0b',
                color: '#0f172a',
                border: 'none',
                fontWeight: 700,
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              Set
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
