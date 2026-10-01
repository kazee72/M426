import React from 'react';
import type { PokemonState } from '../types/pokemon';

interface ActionControlsProps {
  state: PokemonState;
  onFeed: () => void;
  onPlay: () => void;
  onToggleSleep: () => void;
  onPet: () => void;
}

export const ActionControls: React.FC<ActionControlsProps> = ({
  state,
  onFeed,
  onPlay,
  onToggleSleep,
  onPet,
}) => {
  const isSleeping = state.isSleeping;
  const isHungerFull = state.needs.hunger >= 98;
  const isExhausted = state.needs.energy < 15;

  return (
    <div className="grid grid-cols-4 gap-2 w-full pt-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
      {/* Feed Button */}
      <button
        onClick={onFeed}
        disabled={isSleeping || isHungerFull}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px 4px',
          borderRadius: '10px',
          fontSize: '11px',
          fontWeight: 600,
          border: '1px solid rgba(245, 158, 11, 0.4)',
          background: isSleeping || isHungerFull ? 'rgba(30, 41, 59, 0.4)' : 'rgba(245, 158, 11, 0.15)',
          color: isSleeping || isHungerFull ? '#64748b' : '#fcd34d',
          cursor: isSleeping || isHungerFull ? 'not-allowed' : 'pointer',
          opacity: isSleeping || isHungerFull ? 0.5 : 1,
        }}
        title={isSleeping ? 'Pet is sleeping!' : isHungerFull ? 'Pet is completely full!' : 'Feed a berry (+25 Hunger)'}
      >
        <span style={{ fontSize: '18px', marginBottom: '2px' }}>🍎</span>
        <span>Feed</span>
      </button>

      {/* Play Button */}
      <button
        onClick={onPlay}
        disabled={isSleeping || isExhausted}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px 4px',
          borderRadius: '10px',
          fontSize: '11px',
          fontWeight: 600,
          border: '1px solid rgba(236, 72, 153, 0.4)',
          background: isSleeping || isExhausted ? 'rgba(30, 41, 59, 0.4)' : 'rgba(236, 72, 153, 0.15)',
          color: isSleeping || isExhausted ? '#64748b' : '#f472b6',
          cursor: isSleeping || isExhausted ? 'not-allowed' : 'pointer',
          opacity: isSleeping || isExhausted ? 0.5 : 1,
        }}
        title={isSleeping ? 'Pet is sleeping!' : isExhausted ? 'Too exhausted to play!' : 'Play together (+25 Fun, -12 Energy)'}
      >
        <span style={{ fontSize: '18px', marginBottom: '2px' }}>🎾</span>
        <span>Play</span>
      </button>

      {/* Sleep / Wake Button */}
      <button
        onClick={onToggleSleep}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px 4px',
          borderRadius: '10px',
          fontSize: '11px',
          fontWeight: 600,
          border: isSleeping ? '1px solid rgba(251, 191, 36, 0.5)' : '1px solid rgba(99, 102, 241, 0.4)',
          background: isSleeping ? 'rgba(251, 191, 36, 0.2)' : 'rgba(99, 102, 241, 0.15)',
          color: isSleeping ? '#fde68a' : '#a5b4fc',
          cursor: 'pointer',
        }}
        title={isSleeping ? 'Wake up your pet' : 'Put your pet to sleep (Energy regenerates)'}
      >
        <span style={{ fontSize: '18px', marginBottom: '2px' }}>{isSleeping ? '☀️' : '💤'}</span>
        <span>{isSleeping ? 'Wake' : 'Rest'}</span>
      </button>

      {/* Pet / Cuddle Button */}
      <button
        onClick={onPet}
        disabled={isSleeping}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px 4px',
          borderRadius: '10px',
          fontSize: '11px',
          fontWeight: 600,
          border: '1px solid rgba(244, 63, 94, 0.4)',
          background: isSleeping ? 'rgba(30, 41, 59, 0.4)' : 'rgba(244, 63, 94, 0.15)',
          color: isSleeping ? '#64748b' : '#fda4af',
          cursor: isSleeping ? 'not-allowed' : 'pointer',
          opacity: isSleeping ? 0.5 : 1,
        }}
        title={isSleeping ? 'Pet is asleep' : 'Pet gently (+8 Happiness)'}
      >
        <span style={{ fontSize: '18px', marginBottom: '2px' }}>💖</span>
        <span>Pet</span>
      </button>
    </div>
  );
};
