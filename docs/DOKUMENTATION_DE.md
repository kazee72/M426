# Technische Dokumentation: Pokémon Entity & Needs System (SCRUM-14 / SCRUM-15)

## Übersicht & Zielsetzung

Im Rahmen von **SCRUM-14 & SCRUM-15** wurde das Kernmodell des virtuellen
Begleiters (**PokéPet**) als Browser-Extension (Manifest V3 mit **WXT**,
**React 19** und **TypeScript**) implementiert. Anstelle eines klassischen
Popups, das sich beim Klick in die Webseite automatisch schließt, wurde das
System als **persistentes, transparentes On-Page-Overlay** realisiert.

## Inhaltsverzeichnis

| Dokument | Inhalt |
| :--- | :--- |
| [systemarchitektur.md](systemarchitektur.md) | Systemarchitektur (Diagramm) & Übersicht der Kernkomponenten. |
| [design-patterns.md](design-patterns.md) | Die fünf zentralen Design Patterns: Custom Hook (State Machine), Pure Functions mit injizierbarer Zeit, Lazy Injection, Data-Driven Design (Rule Table) und Configuration Object. |
| [fachliche-logik.md](fachliche-logik.md) | Fachliche Logik (Needs, Mood, Evolution), gelöste technische Herausforderungen sowie Qualitätssicherung & CI/CD. |

### Weitere Dokumente

* [ki-usage.md](ki-usage.md) — Statement zur KI-Nutzung
* [review1.md](review1.md) — Sprint-Review 1
