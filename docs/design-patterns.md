# Design Patterns & Konzepte

Die Architektur des PokéPet-Systems basiert auf fünf zentralen Design Patterns, die Zustands-, Regel- und UI-Logik sauber trennen und Testbarkeit sowie Erweiterbarkeit sicherstellen.

## 1. Custom Hook (State Machine)

`src/hooks/usePokemonPet.ts`

Der zentrale Hook ist der **einzige Zustandsbesitzer** (*Single Source of Truth*) für den virtuellen Begleiter. Er kapselt die komplette State Machine:

- **Zustände:** `loading → ready` (asynchrones Laden aus dem Storage) sowie *wach ↔ schlafend* (`isSleeping`).
- **Bewachte Übergänge (*Guarded Transitions*):** Jede Aktion prüft vor dem Übergang die Zustandsguards:
  - `feed` wird blockiert, wenn das Pokémon schläft oder `hunger ≥ 98` ("completely full").
  - `play` wird blockiert, wenn das Pokémon schläft oder `energy < 15` ("too exhausted").
- **Übergangsmechanik:** Jede Aktion erzeugt einen **neuen, immutablen `PokemonState`** → persistiert ihn (`savePokemonState`) → löst ein transientes `ActionFeedback` (Emote + Nachricht) aus.
- **Stabiler Decay-Ticker:** Das `setInterval` (3 s) besitzt ein leeres Dependency-Array und liest den aktuellen Zustand über `stateRef`, sodass der Ticker nie neu erzeugt wird (`usePokemonPet.ts:96-112`):

```ts
const stateRef = useRef<PokemonState | null>(null);
stateRef.current = state;

useEffect(() => {
  const interval = window.setInterval(() => {
    const prev = stateRef.current;
    if (!prev) return;
    const now = Date.now();
    if (now - prev.lastUpdated < 1000) return;
    const updated = calculateDecayedState(prev, now);
    savePokemonState(updated);
    setState(updated);
  }, 3000);
  return () => window.clearInterval(interval);
}, []); // stable — never re-runs
```

**Nutzen:** Die UI-Komponente (`PokemonOverlay`) bleibt dünn und deklarativ; sämtliche Übergangsregeln und Guards liegen an einer Stelle und sind über `test/usePokemonPet.test.ts` (7 Hook-Tests) abgedeckt.

## 2. Pure Functions with Injectable Time

`src/utils/decay.ts`

Die gesamte Verfallslogik (*Decay*) besteht aus **reinen Funktionen ohne Seiteneffekte** — gleiche Eingaben liefern immer dieselben Ergebnisse. Die Zeit wird als **Parameter injiziert** und besitzt lediglich einen Default-Wert:

```ts
export function calculateDecayedState(
  state: PokemonState,
  currentTime: number = Date.now(), // ← injizierbar
  config: DecayConfig = DEFAULT_DECAY_CONFIG
): PokemonState { ... }

export function formatElapsedTime(lastUpdated: number, now: number = Date.now()): string { ... }
```

- **Timestamp-based Delta Calculation:** Bedürfnisse werden anhand der Differenz $\Delta t = t_{\text{now}} - t_{\text{lastUpdated}}$ berechnet. Dadurch funktioniert der Offline-Decay exakt, auch wenn der Browser stundenlang geschlossen war.
- **Testbarkeit:** Da `currentTime` injizierbar ist, laufen alle 12 Unit-Tests in `test/decay.test.ts` deterministisch — ohne `setTimeout` oder Fake-Timer-Tricks.
- **Simulation:** Derselbe Mechanismus ermöglicht die `fastForwardHours`-Funktion im Hook, mit der Offline-Zeit beliebig simuliert werden kann.

## 3. Lazy Injection

Abhängigkeiten werden **nicht beim Modul-Load gebunden, sondern erst zur Aufrufzeit aufgelöst** — und nur, wenn sie nicht explizit übergeben wurden (Default-Parameter-Injektion):

```ts
calculateDecayedState(state, currentTime = Date.now(), config = DEFAULT_DECAY_CONFIG)
createInitialPokemonState(species = DEFAULT_POKEMON_SPECIES)          // storage.ts:14
loadOverlayUiPrefs(defaults = { bottom: 100, right: 24, visible: true }) // storage.ts:163
```

Zusätzlich:

- **Lazy State-Init im Hook:** `usePokemonPet` lädt den Zustand erst asynchron **nach dem Mount** (`useEffect` + `loadPokemonState()`), statt den Storage bereits beim Import der Module zu kontaktieren.
- **`getStorageApi()` pro Aufruf:** Die Storage-API (`browser.storage` für Firefox, `chrome.storage` für Chromium, `localStorage` für Tests/Dev) wird bei jedem Aufruf neu ermittelt (`storage.ts:39-52`) statt beim Modul-Load gecacht.

**Nutzen:** Keine Import-Side-Effects und keine starren Umgebungs-Bindungen — Tests, Dev-Modus und Production teilen sich denselben Code, und jede injizierbare Abhängigkeit kann jederzeit überschrieben werden.

## 4. Data-Driven Design (Rule Table)

`src/constants/pokemonPresets.ts`

Fachregeln sind **Daten, keine Logik** — sie liegen als Tabellen (Arrays) vor:

- **Evolutionsregeln:** `EVOLUTION_CHAIN: EvolutionRule[]` ist eine reine Regel-Tabelle. `checkEvolution` ist lediglich ein Lookup, der bei Multi-Level-Ups bis zu drei Stufen in Folge auflöst (z. B. Bulbasaur $\xrightarrow{\text{Lv.5}}$ Ivysaur $\xrightarrow{\text{Lv.10}}$ Venusaur, `pokemonPresets.ts:163-174`):

```ts
export interface EvolutionRule {
  fromId: number;
  minLevel: number;
  toSpecies: PokemonSpecies;
}

export function checkEvolution(currentSpecies: PokemonSpecies, level: number): PokemonSpecies | null {
  let cursor = currentSpecies;
  let evolved: PokemonSpecies | null = null;
  for (let i = 0; i < 3; i++) {
    const rule = EVOLUTION_CHAIN.find(r => r.fromId === cursor.id && level >= r.minLevel);
    if (!rule) break;
    evolved = rule.toSpecies;
    cursor = rule.toSpecies;
  }
  return evolved;
}
```

- **Spezies-Katalog:** `POKEMON_PRESETS` (10 Pokémon) ist eine reine Datenquelle für ID, Name, Typen, `spriteSlug` und `colorTheme`.

**Nutzen:** Neue Spezies oder Evolutionsstufen werden mit
**einer neuen Tabellenzeile** ergänzt — ohne Änderung der Übergangslogik.

## 5. Configuration Object

`src/types/pokemon.ts` (`DecayConfig`) · `src/constants/pokemonPresets.ts` (`DEFAULT_DECAY_CONFIG`)

Alle Stellschrauben des Systems sind in **einem typisierten Konfigurationsobjekt** gebündelt:

```ts
export const DEFAULT_DECAY_CONFIG: DecayConfig = {
  hungerDecayPerHour: 10,        // ~10 h bis 0
  energyDecayPerHour: 8,         // ~12,5 h bis 0
  happinessDecayPerHour: 12,     // ~8 h bis 0
  sleepEnergyRegenPerHour: 25,   // ~4 h für vollen Schlaf
  sleepHungerDecayPerHour: 3,    // reduzierter Stoffwechsel im Schlaf
  neglectPenaltyMultiplier: 1.5, // 1,5× schnellerer Zufriedenheits-Verfall bei Hunger/Erschöpfung
};
```

- Das Objekt wird **injizier- und überschreibbar** an `calculateDecayedState` übergeben (Default: `DEFAULT_DECAY_CONFIG`).
- **Nutzen:** Balancing-Änderungen (z. B. "Hunger soll langsamer sinken") sind eine Einzelzeile an einer Stelle — kein Suchen durch die Berechnungslogik. Tests können alternative Konfigurationen deterministisch injizieren.
