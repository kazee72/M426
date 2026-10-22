import React, { useState } from 'react';
import type { PokemonState } from '../types/pokemon';
import { formatElapsedTime } from '../utils/decay';

interface DebugSimulatorProps {
  state: PokemonState;
  onFastForward: (hours: number) => void;
  onReset: () => void;
}

export const DebugSimulator: React.FC<DebugSimulatorProps> = ({
  state,
  onFastForward,
  onReset,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ width: '100%', paddingTop: '4px' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          textAlign: 'center',
          fontSize: '11px',
          color: '#94a3b8',
          padding: '4px 0',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
        }}
      >
        <span>🛠️</span>
        <span>{open ? 'Hide Time Decay Simulator' : 'Test Time Decay Simulator'}</span>
        <span style={{ fontSize: '9px' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div
          style={{
            marginTop: '6px',
            padding: '10px',
            background: 'rgba(2, 6, 23, 0.85)',
            border: '1px solid rgba(51, 65, 85, 0.8)',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '11px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '10px' }}>
            <span>Last saved: {formatElapsedTime(state.lastUpdated)}</span>
            <span>Status: {state.isSleeping ? 'Sleeping' : 'Awake'}</span>
          </div>

          <div style={{ fontSize: '11px', fontWeight: 600, color: '#cbd5e1' }}>
            Simulate offline / closed-tab elapsed time:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
            <button
              onClick={() => onFastForward(1)}
              style={{
                padding: '4px 2px',
                background: '#1e293b',
                color: '#e2e8f0',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: 500,
                border: '1px solid #334155',
                cursor: 'pointer',
              }}
            >
              +1 Hour
            </button>
            <button
              onClick={() => onFastForward(3)}
              style={{
                padding: '4px 2px',
                background: '#1e293b',
                color: '#e2e8f0',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: 500,
                border: '1px solid #334155',
                cursor: 'pointer',
              }}
            >
              +3 Hours
            </button>
            <button
              onClick={() => onFastForward(8)}
              style={{
                padding: '4px 2px',
                background: '#1e293b',
                color: '#e2e8f0',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: 500,
                border: '1px solid #334155',
                cursor: 'pointer',
              }}
            >
              +8 Hours
            </button>
            <button
              onClick={() => onFastForward(24)}
              style={{
                padding: '4px 2px',
                background: '#1e293b',
                color: '#e2e8f0',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: 500,
                border: '1px solid #334155',
                cursor: 'pointer',
              }}
            >
              +1 Day
            </button>
          </div>

          <div
            style={{
              paddingTop: '6px',
              borderTop: '1px solid #334155',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <button
              onClick={onReset}
              style={{
                padding: '4px 8px',
                background: 'rgba(225, 29, 72, 0.2)',
                color: '#fda4af',
                borderRadius: '6px',
                fontSize: '10px',
                border: '1px solid rgba(225, 29, 72, 0.4)',
                cursor: 'pointer',
              }}
            >
              Reset Needs to 100%
            </button>
            <span style={{ fontSize: '10px', color: '#94a3b8' }}>Real-time sync active</span>
          </div>
        </div>
      )}
    </div>
  );
};
