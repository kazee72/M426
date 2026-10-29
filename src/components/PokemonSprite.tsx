import React, { useEffect, useState } from 'react';
import type { PokemonSpecies } from '../types/pokemon';
import { getPokemonSpriteUrls, POKEBALL_FALLBACK_SVG } from '../utils/sprites';

interface PokemonSpriteProps {
  species: PokemonSpecies;
  isSleeping: boolean;
  emote?: string;
  onClick?: () => void;
}

export const PokemonSprite: React.FC<PokemonSpriteProps> = ({
  species,
  isSleeping,
  emote,
  onClick,
}) => {
  const [urlIndex, setUrlIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [bouncing, setBouncing] = useState(false);

  const urls = getPokemonSpriteUrls(species);
  const currentSrc = urlIndex < urls.length ? urls[urlIndex] : POKEBALL_FALLBACK_SVG;

  // Reset index when species changes
  useEffect(() => {
    setUrlIndex(0);
    setLoaded(false);
  }, [species.id, species.spriteSlug]);

  const handleImageError = () => {
    if (urlIndex < urls.length) {
      setUrlIndex((prev) => prev + 1);
    }
  };

  const handleClick = () => {
    setBouncing(true);
    setTimeout(() => setBouncing(false), 500);
    if (onClick) onClick();
  };

  return (
    <div
      onClick={handleClick}
      title="Click to pet!"
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'transform 0.3s ease',
        transform: bouncing ? 'scale(1.1)' : 'scale(1)',
        opacity: isSleeping ? 0.85 : 1,
      }}
    >
      {/* Emotion Bubble */}
      {emote && (
        <div
          style={{
            position: 'absolute',
            top: '-2px',
            right: '18px',
            zIndex: 20,
            background: 'rgba(255, 255, 255, 0.95)',
            color: '#1e293b',
            fontSize: '16px',
            padding: '2px 8px',
            borderRadius: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            border: '1px solid #cbd5e1',
            pointerEvents: 'none',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          {emote}
        </div>
      )}

      {/* Sleep Night Ambient Overlay */}
      {isSleeping && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            borderRadius: '16px',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: '8px',
              left: '12px',
              fontSize: '20px',
            }}
          >
            💤
          </span>
        </div>
      )}

      {/* Main Pokémon Sprite */}
      <div
        style={{
          width: '110px',
          height: '110px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {!loaded && (
          <div
            style={{
              width: '24px',
              height: '24px',
              border: '3px solid #f59e0b',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'logo-spin 1s linear infinite',
            }}
          />
        )}
        <img
          src={currentSrc}
          alt={species.displayName}
          onLoad={() => setLoaded(true)}
          onError={handleImageError}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            imageRendering: 'pixelated',
            filter: isSleeping
              ? 'brightness(0.9) saturate(0.7) drop-shadow(0 4px 6px rgba(0,0,0,0.3))'
              : 'drop-shadow(0 6px 10px rgba(0,0,0,0.3))',
            display: loaded ? 'block' : 'none',
          }}
        />
      </div>
    </div>
  );
};
