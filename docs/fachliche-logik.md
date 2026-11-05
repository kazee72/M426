# Fachliche Logik, Bugfixes & Qualitätssicherung

## 1. Fachliche Logik: Needs, Mood & Evolution

* **Wach-Zustand:** Hunger ($-10/\text{h}$), Energie ($-8/\text{h}$) und Zufriedenheit ($-12/\text{h}$) sinken kontinuierlich. Fällt Hunger oder Energie unter $20\%$, greift ein *Neglect-Multiplikator* ($\times 1.5$ auf Zufriedenheitsverlust).
* **Schlaf-Zustand:** Energie regeneriert sich ($+25/\text{h}$), Hunger sinkt verlangsamt ($-3/\text{h}$). Bei $100\%$ Energie wacht das Pokémon automatisch auf.
* **Interaktionen & Level-Up:** Aktionen (`Feed`, `Play`, `Pet`) erhöhen Bedürfnisse und vergeben `EXP`. Bei $\text{EXP} \ge \text{maxEXP}$ steigt das Level ($\text{maxEXP}_{\text{neu}} = \text{round}(\text{maxEXP} \times 1.25)$) und prüft automatisch auf **Evolution** (z. B. *Charmander* $\xrightarrow{\text{Lv.5}}$ *Charmeleon* $\xrightarrow{\text{Lv.10}}$ *Charizard*).

---

## 2. Gelöste technische Herausforderungen (Bugfixes)

* **React Render-Loop im Content Script:** Der Echtzeit-Ticker in `usePokemonPet.ts` nutzt ein stabiles `useRef` (`stateRef`) mit leerem Dependency-Array `[]`, sodass `setInterval` nicht bei jedem State-Update neu erzeugt wird.
* **Koordinaten-Mathematik & Viewport-Clamping:** Da das Widget über `bottom` und `right` positioniert wird, wird die vertikale Mausbewegung (`dy`) beim Ziehen korrekt subtrahiert (`startPos.bottom - dy`) und bei `window.resize` innerhalb der Bildschirmgrenzen gehalten.
* **Smart Panel Anchoring:** Befindet sich das Pokémon im unteren Bildschirmbereich (`bottom < 250px`), klappt das Menü automatisch **nach oben** auf (`position: absolute`), sodass der Sprite beim Öffnen/Schließen niemals springt.

---

## 3. Qualitätssicherung & CI/CD

Das Projekt nutzt **Vitest**, **@testing-library/react**, **jsdom** und das offizielle **WXT Vitest-Plugin (`WxtVitest`)**.

* `test/decay.test.ts` – 12 Unit-Tests für Zeit-Decay, Schlaf-Regeneration, Auto-Wakeup, Neglect-Penalty und Mood-Logik.
* `test/usePokemonPet.test.ts` – 7 Hook-Tests für Aktionen (`feed`, `play`, `changeSpecies`) und mehrstufige Evolutionen.
* `test/storage.test.ts` – 5 Tests für `chrome.storage.local` Persistenz und Tab-Sync.
* `test/sprites.test.ts` & `tests/background.test.ts` – Smoke- & Fallback-Tests.
* **CI-Pipeline:** Automatisierter Check bei jedem Push/PR via `pnpm install --frozen-lockfile`, `pnpm compile` (`tsc --noEmit`), `pnpm test` (**26/26 Tests bestanden**) sowie Chrome/Firefox MV3-Builds.
