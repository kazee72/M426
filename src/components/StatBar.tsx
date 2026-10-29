import React from 'react';

interface StatBarProps {
  label: string;
  value: number; // 0 to 100
  icon: string;
  sublabel?: string;
  colorType?: 'hunger' | 'energy' | 'happiness';
}

export const StatBar: React.FC<StatBarProps> = ({
  label,
  value,
  icon,
  sublabel,
}) => {
  const clampedValue = Math.min(100, Math.max(0, Math.round(value)));

  // Dynamic status color based on percentage
  const getColorScheme = (val: number) => {
    if (val >= 60) {
      return {
        bar: 'linear-gradient(90deg, #10b981, #34d399)',
        text: '#10b981',
        bg: '#064e3b20',
        badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        pulse: false,
      };
    }
    if (val >= 25) {
      return {
        bar: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
        text: '#f59e0b',
        bg: '#78350f20',
        badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        pulse: false,
      };
    }
    return {
      bar: 'linear-gradient(90deg, #ef4444, #f87171)',
      text: '#ef4444',
      bg: '#7f1d1d20',
      badge: 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse',
      pulse: true,
    };
  };

  const scheme = getColorScheme(clampedValue);

  return (
    <div className="flex flex-col gap-1 w-full bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80 shadow-sm backdrop-blur-sm">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-medium text-slate-200">
          <span className="text-sm select-none">{icon}</span>
          <span>{label}</span>
          {sublabel && <span className="text-[10px] text-slate-400">({sublabel})</span>}
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md border ${scheme.badge}`}
          >
            {clampedValue}%
          </span>
        </div>
      </div>

      {/* Progress track */}
      <div className="h-2.5 w-full bg-slate-950/80 rounded-full overflow-hidden p-0.5 border border-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            scheme.pulse ? 'animate-pulse' : ''
          }`}
          style={{
            width: `${clampedValue}%`,
            background: scheme.bar,
            boxShadow: `0 0 8px ${scheme.text}40`,
          }}
        />
      </div>
    </div>
  );
};
