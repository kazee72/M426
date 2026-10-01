import React from 'react';
import ReactDOM from 'react-dom/client';
import { PokemonOverlay } from '../../src/components/PokemonOverlay';

const MOUNT_ID = 'pokepet-overlay-root';

function mountOverlay() {
  // Prevent double-mounting
  if (document.getElementById(MOUNT_ID)) return;

  // Host element — sits at top level of DOM, no styling
  const host = document.createElement('div');
  host.id = MOUNT_ID;
  host.style.cssText = `
    all: unset;
    position: fixed;
    z-index: 2147483647;
    top: 0;
    left: 0;
    width: 0;
    height: 0;
    pointer-events: none;
  `;
  document.documentElement.appendChild(host);

  // Shadow DOM for full style isolation from the page
  const shadow = host.attachShadow({ mode: 'open' });

  // Style injection into shadow root
  const style = document.createElement('style');
  style.textContent = OVERLAY_CSS;
  shadow.appendChild(style);

  // React mount point inside shadow
  const mountPoint = document.createElement('div');
  mountPoint.id = 'pokepet-shadow-mount';
  shadow.appendChild(mountPoint);

  ReactDOM.createRoot(mountPoint).render(
    <React.StrictMode>
      <PokemonOverlay />
    </React.StrictMode>,
  );
}

// CSS injected into Shadow DOM — fully isolated
const OVERLAY_CSS = `
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  }

  :host {
    all: initial;
  }

  #pokepet-shadow-mount {
    position: fixed;
    z-index: 2147483647;
    pointer-events: none;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
  }

  /* ─── Draggable Widget ─── */
  .pokepet-widget {
    position: fixed;
    bottom: 80px;
    right: 24px;
    width: 200px;
    pointer-events: all;
    user-select: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
    z-index: 2147483647;
  }

  /* ─── Sprite stage (transparent background) ─── */
  .pokepet-stage {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: grab;
  }

  .pokepet-stage:active {
    cursor: grabbing;
  }

  .pokepet-sprite-wrap {
    position: relative;
    width: 96px;
    height: 96px;
    display: flex;
    align-items: center;
    justify-content: center;
    filter: drop-shadow(0 8px 24px rgba(0,0,0,0.6));
    transition: transform 0.15s ease;
  }

  .pokepet-sprite-wrap:hover {
    transform: translateY(-3px) scale(1.05);
  }

  .pokepet-sprite-wrap img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    image-rendering: pixelated;
  }

  /* ─── Emote bubble ─── */
  .pokepet-emote {
    position: absolute;
    top: -8px;
    right: -4px;
    background: rgba(255,255,255,0.95);
    border: 1.5px solid rgba(0,0,0,0.1);
    border-radius: 50px;
    padding: 2px 7px;
    font-size: 14px;
    line-height: 1.4;
    box-shadow: 0 4px 12px rgba(0,0,0,0.25);
    pointer-events: none;
    animation: pokepet-popIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    z-index: 10;
    white-space: nowrap;
  }

  /* ─── Sleep overlay ─── */
  .pokepet-sleep-overlay {
    position: absolute;
    inset: 0;
    border-radius: 12px;
    background: rgba(10, 15, 40, 0.5);
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    padding: 4px;
    pointer-events: none;
  }

  .pokepet-sleep-zzz {
    font-size: 16px;
    animation: pokepet-float 2s ease-in-out infinite;
  }

  /* ─── Name plate ─── */
  .pokepet-nameplate {
    display: flex;
    align-items: center;
    gap: 5px;
    background: rgba(10, 15, 30, 0.78);
    border: 1px solid rgba(255,255,255,0.12);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-radius: 20px;
    padding: 3px 10px 3px 8px;
    margin-top: 4px;
    cursor: grab;
  }

  .pokepet-nameplate:active {
    cursor: grabbing;
  }

  .pokepet-name {
    font-size: 12px;
    font-weight: 700;
    color: #f8fafc;
    letter-spacing: 0.2px;
    white-space: nowrap;
  }

  .pokepet-level {
    font-size: 9px;
    font-weight: 700;
    background: linear-gradient(135deg, #3b82f6, #6366f1);
    color: #fff;
    padding: 1px 5px;
    border-radius: 6px;
    white-space: nowrap;
  }

  .pokepet-mood-emoji {
    font-size: 13px;
    line-height: 1;
  }

  /* ─── Needs mini bars (shown on hover) ─── */
  .pokepet-needs-panel {
    width: 100%;
    background: rgba(10, 15, 30, 0.82);
    border: 1px solid rgba(255,255,255,0.1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 12px;
    padding: 8px 10px;
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-top: 6px;
    pointer-events: all;
    animation: pokepet-slideDown 0.2s ease-out;
  }

  .pokepet-need-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .pokepet-need-icon {
    font-size: 11px;
    width: 14px;
    text-align: center;
    flex-shrink: 0;
  }

  .pokepet-need-track {
    flex: 1;
    height: 5px;
    background: rgba(255,255,255,0.1);
    border-radius: 4px;
    overflow: hidden;
  }

  .pokepet-need-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.5s ease;
  }

  .pokepet-need-fill.green  { background: linear-gradient(90deg, #10b981, #34d399); }
  .pokepet-need-fill.yellow { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
  .pokepet-need-fill.red    {
    background: linear-gradient(90deg, #ef4444, #f87171);
    animation: pokepet-pulse 1.2s ease-in-out infinite;
  }

  .pokepet-need-val {
    font-size: 9px;
    font-weight: 700;
    color: #94a3b8;
    width: 22px;
    text-align: right;
    flex-shrink: 0;
  }

  /* ─── Action buttons ─── */
  .pokepet-actions {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 4px;
    margin-top: 5px;
  }

  .pokepet-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 5px 2px;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(30, 41, 59, 0.7);
    color: #e2e8f0;
    font-size: 9px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
    pointer-events: all;
    gap: 2px;
    line-height: 1;
  }

  .pokepet-btn:hover:not(:disabled) {
    background: rgba(51, 65, 85, 0.9);
    transform: translateY(-1px);
  }

  .pokepet-btn:active:not(:disabled) {
    transform: scale(0.95);
  }

  .pokepet-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .pokepet-btn-icon {
    font-size: 14px;
    line-height: 1;
  }

  .pokepet-btn.feed   { border-color: rgba(245,158,11,0.4);  color: #fcd34d; }
  .pokepet-btn.play   { border-color: rgba(236,72,153,0.4);  color: #f472b6; }
  .pokepet-btn.rest   { border-color: rgba(99,102,241,0.4);  color: #a5b4fc; }
  .pokepet-btn.rest.active { border-color: rgba(251,191,36,0.5); color: #fde68a; background: rgba(251,191,36,0.12); }
  .pokepet-btn.cuddle { border-color: rgba(244,63,94,0.4);   color: #fda4af; }

  /* ─── Panel close button ─── */
  .pokepet-close-btn {
    background: transparent;
    border: 1px solid rgba(255,255,255,0.12);
    color: #94a3b8;
    font-size: 10px;
    width: 18px;
    height: 18px;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    line-height: 1;
    transition: all 0.15s;
    flex-shrink: 0;
  }
  .pokepet-close-btn:hover {
    background: rgba(255,255,255,0.1);
    color: #f1f5f9;
  }

  /* ─── Inline feedback message ─── */
  .pokepet-inline-toast {
    background: rgba(30, 41, 59, 0.9);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 6px;
    color: #cbd5e1;
    font-size: 10px;
    padding: 4px 7px;
    text-align: center;
  }

  /* ─── Toggle visibility button ─── */
  .pokepet-toggle {
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: rgba(10, 15, 30, 0.85);
    border: 1.5px solid rgba(255,255,255,0.15);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    cursor: pointer;
    pointer-events: all;
    transition: all 0.2s ease;
    z-index: 2147483647;
  }

  .pokepet-toggle:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 28px rgba(0,0,0,0.5);
    border-color: rgba(255,255,255,0.3);
  }

  /* ─── Feedback toast ─── */
  .pokepet-toast {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    background: rgba(10, 15, 30, 0.9);
    border: 1px solid rgba(255,255,255,0.12);
    backdrop-filter: blur(10px);
    color: #f1f5f9;
    font-size: 11px;
    font-weight: 500;
    padding: 5px 10px;
    border-radius: 8px;
    white-space: nowrap;
    pointer-events: none;
    animation: pokepet-popIn 0.25s ease;
    box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  }

  /* ─── Spinner ─── */
  .pokepet-spinner {
    width: 28px;
    height: 28px;
    border: 3px solid rgba(245,158,11,0.3);
    border-top-color: #f59e0b;
    border-radius: 50%;
    animation: pokepet-spin 0.8s linear infinite;
  }

  /* ─── Animations ─── */
  @keyframes pokepet-popIn {
    from { opacity: 0; transform: translateX(-50%) scale(0.8); }
    to   { opacity: 1; transform: translateX(-50%) scale(1); }
  }

  @keyframes pokepet-slideDown {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes pokepet-float {
    0%, 100% { transform: translateY(0); opacity: 0.8; }
    50%       { transform: translateY(-6px); opacity: 1; }
  }

  @keyframes pokepet-spin {
    to { transform: rotate(360deg); }
  }

  @keyframes pokepet-pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.6; }
  }
`;

export default defineContentScript({
  matches: ['<all_urls>'],
  cssInjectionMode: 'ui',
  async main() {
    // Small delay to let the page DOM settle
    await new Promise(r => setTimeout(r, 300));
    mountOverlay();

    // Listen for toggle message from background (icon click)
    browser.runtime.onMessage.addListener((message: unknown) => {
      if (
        typeof message === 'object' &&
        message !== null &&
        (message as Record<string, unknown>)['type'] === 'POKEPET_TOGGLE'
      ) {
        const host = document.getElementById(MOUNT_ID);
        if (!host) {
          mountOverlay();
          return;
        }
        // Toggle widget visibility via a custom event into the Shadow DOM
        const shadow = host.shadowRoot;
        if (shadow) {
          const widget = shadow.getElementById('pokepet-shadow-mount');
          if (widget) {
            widget.style.display = widget.style.display === 'none' ? '' : 'none';
          }
        }
      }
    });
  },
});

