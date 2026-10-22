import React, { useEffect, useRef, useState } from 'react';
import { usePokemonPet } from '@/src/hooks/usePokemonPet';
import { determineMood } from '@/src/utils/decay';
import { getPokemonSpriteUrls, POKEBALL_FALLBACK_SVG } from '@/src/utils/sprites';
import {
  loadOverlayUiPrefs,
  saveOverlayUiPrefs,
  subscribeToOverlayUiPrefs,
} from '@/src/utils/storage';
import { SpeciesSelector } from './SpeciesSelector';

// ─── Draggable & Cross-Tab Synced UI Prefs Hook ───────────────────────────────
function useOverlayUiPrefs(initBottom = 100, initRight = 24) {
  const clamp = (bottom: number, right: number) => ({
    right: Math.max(8, Math.min((typeof window !== 'undefined' ? window.innerWidth : 1024) - 215, right)),
    bottom: Math.max(68, Math.min((typeof window !== 'undefined' ? window.innerHeight : 768) - 190, bottom)),
  });

  const [pos, setPos]         = useState<{ bottom: number; right: number }>({ bottom: initBottom, right: initRight });
  const [visible, setVisible] = useState(true);

  const isDragging = useRef(false);
  const didDrag    = useRef(false);
  const startMouse = useRef({ x: 0, y: 0 });
  const startPos   = useRef({ bottom: 0, right: 0 });
  const visibleRef = useRef(visible);
  visibleRef.current = visible;
  const posRef = useRef(pos);
  posRef.current = pos;

  useEffect(() => {
    let mounted = true;
    loadOverlayUiPrefs({ bottom: initBottom, right: initRight, visible: true }).then((prefs) => {
      if (!mounted) return;
      setPos(clamp(prefs.bottom, prefs.right));
      setVisible(prefs.visible);
    });

    const unsub = subscribeToOverlayUiPrefs((prefs) => {
      if (!mounted || isDragging.current) return;
      setPos(clamp(prefs.bottom, prefs.right));
      setVisible(prefs.visible);
    });

    return () => {
      mounted = false;
      unsub();
    };
  }, [initBottom, initRight]);

  const toggleVisible = () => {
    setVisible(v => {
      const next = !v;
      saveOverlayUiPrefs({ ...posRef.current, visible: next });
      return next;
    });
  };

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
      const clamped = clamp(startPos.current.bottom - dy, startPos.current.right - dx);
      setPos(clamped);
    };
    const onUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      setPos(p => {
        saveOverlayUiPrefs({ ...p, visible: visibleRef.current });
        return p;
      });
    };
    const onResize = () => {
      setPos(p => clamp(p.bottom, p.right));
    };
    // Use window-level listeners (not capture) so they don't block children
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    window.addEventListener('resize',    onResize);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
      window.removeEventListener('resize',    onResize);
    };
  }, []);

  return { pos, visible, toggleVisible, startDrag, didDrag };
}

// ─── Sprite with fallback cascade ────────────────────────────────────────────
function SpriteImg({ urls, alt, isSleeping }: { urls: string[]; alt: string; isSleeping: boolean }) {
  const [idx, setIdx] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const isFallbackSvg = idx >= urls.length;
  const src = !isFallbackSvg ? (urls[idx] ?? POKEBALL_FALLBACK_SVG) : POKEBALL_FALLBACK_SVG;

  useEffect(() => {
    setIdx(0);
    setLoaded(false);
  }, [urls[0]]);

  const showImg = loaded || isFallbackSvg;

  return (
    <div className="pokepet-sprite-wrap">
      {!showImg && <div className="pokepet-spinner" />}
      <img
        src={src} alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (idx < urls.length) {
            setIdx(i => i + 1);
          } else {
            setLoaded(true);
          }
        }}
        style={{
          display: showImg ? 'block' : 'none',
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
  const [panelOpen, setPanelOpen]       = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [editingName, setEditingName]   = useState(false);
  const [nameDraft, setNameDraft]       = useState('');
  const { pos, visible, toggleVisible, startDrag, didDrag } = useOverlayUiPrefs(100, 24);

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
    if (didDrag.current || editingName) return;
    setPanelOpen(o => !o);
  };

  const startEditingNickname = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!state) return;
    setNameDraft(state.nickname);
    setEditingName(true);
  };

  const commitNickname = () => {
    setEditingName(false);
    if (nameDraft.trim()) {
      actions.setCustomNickname(nameDraft);
    }
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

  // Smart panel anchor: if pet is low on the screen (bottom < 250px), open panel ABOVE the sprite
  // Otherwise open BELOW the nameplate so the sprite never jumps around!
  const openUpwards = pos.bottom < 250;

  return (
    <>
      {/* ── Hide/show toggle ────────────────────────────────────────────────── */}
      <div
        className="pokepet-toggle"
        style={{ bottom: Math.max(8, pos.bottom - 56), right: pos.right }}
        onClick={(e) => { e.stopPropagation(); toggleVisible(); }}
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

          {/* ── Name plate: draggable + panel toggle + inline rename ── */}
          <div
            className="pokepet-nameplate"
            onMouseDown={editingName ? stopBubble : startDrag}
            onClick={handleNameplateClick}
            title="Click to open controls  •  Drag to move"
          >
            <span className="pokepet-mood-emoji">{mood.emoji}</span>
            {editingName ? (
              <input
                type="text"
                value={nameDraft}
                autoFocus
                maxLength={14}
                onChange={e => setNameDraft(e.target.value)}
                onBlur={commitNickname}
                onKeyDown={e => {
                  e.stopPropagation();
                  if (e.key === 'Enter') commitNickname();
                  if (e.key === 'Escape') setEditingName(false);
                }}
                onClick={stopBubble}
                style={{
                  width: '76px',
                  background: '#020617',
                  color: '#f8fafc',
                  border: '1px solid #6366f1',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '1px 4px',
                  outline: 'none',
                }}
              />
            ) : (
              <span
                className="pokepet-name"
                onDoubleClick={startEditingNickname}
                title="Double-click to rename"
              >
                {state.nickname}
              </span>
            )}
            {!editingName && (
              <span
                onClick={startEditingNickname}
                title="Rename Pokémon"
                style={{ fontSize: '9px', opacity: 0.55, cursor: 'pointer' }}
              >
                ✏️
              </span>
            )}
            <span className="pokepet-level">Lv.{state.level}</span>
            <span style={{ marginLeft: 'auto', fontSize: '9px', opacity: 0.5 }}>
              {panelOpen ? (openUpwards ? '▼' : '▲') : (openUpwards ? '▲' : '▼')}
            </span>
          </div>

          {/* ── Controls panel — anchored floating card so sprite never jumps! ── */}
          {panelOpen && (
            <div
              className="pokepet-needs-panel"
              style={
                openUpwards
                  ? {
                      position: 'absolute',
                      bottom: 'calc(100% + 8px)',
                      left: 0,
                      marginTop: 0,
                    }
                  : {
                      position: 'absolute',
                      top: 'calc(100% + 6px)',
                      left: 0,
                      marginTop: 0,
                    }
              }
            >
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

              <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowSelector(true); }}
                  style={{
                    width: '100%',
                    background: '#1e293b',
                    color: '#e2e8f0',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '4px',
                    fontSize: '10px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  ⚡ Change Pokémon
                </button>

                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); actions.fastForwardHours(2); }}
                    title="Simulate 2 hours of offline time"
                    style={{
                      flex: 1,
                      background: 'rgba(15, 23, 42, 0.7)',
                      color: '#94a3b8',
                      border: '1px solid rgba(51, 65, 85, 0.7)',
                      borderRadius: '6px',
                      padding: '3px',
                      fontSize: '9px',
                      cursor: 'pointer',
                    }}
                  >
                    ⏳ +2h Decay
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); actions.resetAllStats(); }}
                    title="Reset stats to 100%"
                    style={{
                      flex: 1,
                      background: 'rgba(15, 23, 42, 0.7)',
                      color: '#94a3b8',
                      border: '1px solid rgba(51, 65, 85, 0.7)',
                      borderRadius: '6px',
                      padding: '3px',
                      fontSize: '9px',
                      cursor: 'pointer',
                    }}
                  >
                    ✨ Reset 100%
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {showSelector && (
        <div onMouseDown={stopBubble} onClick={stopBubble}>
          <SpeciesSelector
            currentSpecies={state.species}
            onClose={() => setShowSelector(false)}
            onSelectSpecies={actions.changeSpecies}
          />
        </div>
      )}
    </>
  );
}
