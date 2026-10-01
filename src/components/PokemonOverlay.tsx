import React, { useEffect, useRef, useState } from 'react';
import { usePokemonPet } from '@/src/hooks/usePokemonPet';
import { determineMood } from '@/src/utils/decay';
import { getPokemonSpriteUrls, POKEBALL_FALLBACK_SVG } from '@/src/utils/sprites';

// ─── Draggable hook ───────────────────────────────────────────────────────────
function useDraggable(initBottom = 100, initRight = 24) {
  const POS_KEY = 'pokepet_pos';

  const load = (): { bottom: number; right: number } => {
    try {
      const raw = localStorage.getItem(POS_KEY);
      if (raw) return JSON.parse(raw) as { bottom: number; right: number };
    } catch { /**/ }
    return { bottom: initBottom, right: initRight };
  };

  const [pos, setPos] = useState(load);
  const isDragging  = useRef(false);
  const didDrag     = useRef(false);
  const startMouse  = useRef({ x: 0, y: 0 });
  const startPos    = useRef({ bottom: 0, right: 0 });

  // Called from drag-handle elements only
  const startDrag = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    // Don't prevent default so child buttons still fire
    e.stopPropagation();
    isDragging.current = true;
    didDrag.current    = false;
    startMouse.current = { x: e.clientX, y: e.clientY };
    startPos.current   = { ...pos };
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - startMouse.current.x;
      const dy = e.clientY - startMouse.current.y;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) didDrag.current = true;
      const newRight  = Math.max(4, Math.min(window.innerWidth  - 215, startPos.current.right  - dx));
      const newBottom = Math.max(4, Math.min(window.innerHeight - 190, startPos.current.bottom + dy));
      setPos({ right: newRight, bottom: newBottom });
    };
    const onUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      setPos(p => {
        try { localStorage.setItem(POS_KEY, JSON.stringify(p)); } catch { /**/ }
        return p;
      });
    };
    // Use window-level listeners (not capture) so they don't block children
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
    };
  }, []);

  return { pos, startDrag, didDrag };
}

// ─── Sprite with fallback cascade ────────────────────────────────────────────
function SpriteImg({ urls, alt, isSleeping }: { urls: string[]; alt: string; isSleeping: boolean }) {
  const [idx, setIdx] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const src = idx < urls.length ? (urls[idx] ?? POKEBALL_FALLBACK_SVG) : POKEBALL_FALLBACK_SVG;
  useEffect(() => { setIdx(0); setLoaded(false); }, [urls[0]]);
  return (
    <div className="pokepet-sprite-wrap">
      {!loaded && <div className="pokepet-spinner" />}
      <img
        src={src} alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setIdx(i => i + 1)}
        style={{
          display: loaded ? 'block' : 'none',
          filter: isSleeping
            ? 'brightness(0.75) saturate(0.5) drop-shadow(0 8px 14px rgba(0,0,0,0.55))'
            : 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))',
        }}
      />
    </div>
  );
}

function barColor(v: number) {
  if (v >= 60) return 'linear-gradient(90deg,#10b981,#34d399)';
  if (v >= 25) return 'linear-gradient(90deg,#f59e0b,#fbbf24)';
  return 'linear-gradient(90deg,#ef4444,#f87171)';
}

// ─── Main overlay ─────────────────────────────────────────────────────────────
export function PokemonOverlay() {
  const { state, loading, lastFeedback, actions } = usePokemonPet();
  const [visible,   setVisible]   = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const { pos, startDrag, didDrag } = useDraggable(100, 24);

  // Stop bubbling only at the widget boundary (bubble phase = after children handled it)
  // This prevents page-level click listeners from firing, but allows children to work normally
  const stopBubble = (e: React.MouseEvent) => e.stopPropagation();

  const handleSpriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (didDrag.current) return;
    actions.pet();
  };

  const handleNameplateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (didDrag.current) return;
    setPanelOpen(o => !o);
  };

  if (loading || !state) {
    return (
      <div
        className="pokepet-widget"
        style={{ bottom: pos.bottom, right: pos.right }}
      >
        <div style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="pokepet-spinner" />
        </div>
      </div>
    );
  }

  const mood       = determineMood(state);
  const spriteUrls = getPokemonSpriteUrls(state.species);
  const expPct     = Math.min(100, (state.experience / state.maxExperience) * 100);

  return (
    <>
      {/* ── Hide/show toggle ────────────────────────────────────────────────── */}
      <div
        className="pokepet-toggle"
        style={{ bottom: pos.bottom - 60, right: pos.right }}
        onClick={(e) => { e.stopPropagation(); setVisible(v => !v); }}
        title={visible ? 'Hide PokéPet' : 'Show PokéPet'}
      >
        {visible ? '👁️' : '⚡'}
      </div>

      {/* ── Widget ─────────────────────────────────────────────────────────── */}
      {visible && (
        <div
          className="pokepet-widget"
          style={{ bottom: pos.bottom, right: pos.right }}
          // Bubble-phase only — children receive events first, THEN we stop bubbling to page
          onClick={stopBubble}
          onMouseDown={stopBubble}
        >
          {/* ── Sprite: draggable + clickable ── */}
          <div
            className="pokepet-stage"
            onMouseDown={startDrag}
            onClick={handleSpriteClick}
            title="Click to pet  •  Drag to move"
          >
            {(lastFeedback?.emote ?? state.currentEmote) && (
              <div className="pokepet-emote" key={`${lastFeedback?.emote}${state.currentEmote}`}>
                {lastFeedback?.emote ?? state.currentEmote}
              </div>
            )}
            <SpriteImg urls={spriteUrls} alt={state.nickname} isSleeping={state.isSleeping} />
            {state.isSleeping && (
              <div className="pokepet-sleep-overlay">
                <span className="pokepet-sleep-zzz">💤</span>
              </div>
            )}
          </div>

          {/* ── Name plate: draggable + panel toggle ── */}
          <div
            className="pokepet-nameplate"
            onMouseDown={startDrag}
            onClick={handleNameplateClick}
            title="Click to open controls  •  Drag to move"
          >
            <span className="pokepet-mood-emoji">{mood.emoji}</span>
            <span className="pokepet-name">{state.nickname}</span>
            <span className="pokepet-level">Lv.{state.level}</span>
            <span style={{ marginLeft: 'auto', fontSize: '9px', opacity: 0.5 }}>
              {panelOpen ? '▲' : '▼'}
            </span>
          </div>

          {/* ── Controls panel — closes only with ✕ button ── */}
          {panelOpen && (
            <div className="pokepet-needs-panel">

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.5px' }}>
                  NEEDS &amp; ACTIONS
                </span>
                <button
                  className="pokepet-close-btn"
                  onClick={(e) => { e.stopPropagation(); setPanelOpen(false); }}
                >
                  ✕
                </button>
              </div>

              {lastFeedback && (
                <div className="pokepet-inline-toast">
                  {lastFeedback.emote && <span>{lastFeedback.emote} </span>}
                  {lastFeedback.message}
                </div>
              )}

              {([
                { icon: '🍖', label: 'Hunger',    val: state.needs.hunger },
                { icon: '⚡', label: state.isSleeping ? 'Recharging…' : 'Energy', val: state.needs.energy },
                { icon: '💖', label: 'Happiness', val: state.needs.happiness },
              ] as const).map(({ icon, label, val }) => (
                <div key={label} className="pokepet-need-row">
                  <span className="pokepet-need-icon">{icon}</span>
                  <div className="pokepet-need-track">
                    <div
                      className="pokepet-need-fill"
                      style={{
                        width: `${val}%`,
                        background: barColor(val),
                        animation: val < 25 ? 'pokepet-pulse 1.2s ease-in-out infinite' : 'none',
                      }}
                    />
                  </div>
                  <span className="pokepet-need-val">{Math.round(val)}%</span>
                </div>
              ))}

              <div className="pokepet-actions">
                <button
                  className="pokepet-btn feed"
                  onClick={(e) => { e.stopPropagation(); actions.feed(); }}
                  disabled={state.isSleeping || state.needs.hunger >= 98}
                  title="Feed (+25 Hunger)"
                >
                  <span className="pokepet-btn-icon">🍎</span>
                  <span>Feed</span>
                </button>
                <button
                  className="pokepet-btn play"
                  onClick={(e) => { e.stopPropagation(); actions.play(); }}
                  disabled={state.isSleeping || state.needs.energy < 15}
                  title="Play (+25 Fun, -12 Energy)"
                >
                  <span className="pokepet-btn-icon">🎾</span>
                  <span>Play</span>
                </button>
                <button
                  className={`pokepet-btn rest${state.isSleeping ? ' active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); actions.toggleSleep(); }}
                  title={state.isSleeping ? 'Wake up' : 'Rest'}
                >
                  <span className="pokepet-btn-icon">{state.isSleeping ? '☀️' : '💤'}</span>
                  <span>{state.isSleeping ? 'Wake' : 'Rest'}</span>
                </button>
                <button
                  className="pokepet-btn cuddle"
                  onClick={(e) => { e.stopPropagation(); actions.pet(); }}
                  disabled={state.isSleeping}
                  title="Pet (+8 Happiness)"
                >
                  <span className="pokepet-btn-icon">💖</span>
                  <span>Pet</span>
                </button>
              </div>

              <div style={{ marginTop: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#475569', marginBottom: '3px' }}>
                  <span>EXP</span>
                  <span>{state.experience} / {state.maxExperience}</span>
                </div>
                <div className="pokepet-need-track" style={{ height: '4px' }}>
                  <div style={{
                    height: '100%',
                    width: `${expPct}%`,
                    background: 'linear-gradient(90deg,#6366f1,#818cf8)',
                    borderRadius: '4px',
                    transition: 'width 0.4s ease',
                  }} />
                </div>
              </div>

            </div>
          )}
        </div>
      )}
    </>
  );
}
