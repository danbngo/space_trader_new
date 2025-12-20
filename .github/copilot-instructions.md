# Space Trader — AI Coding Instructions

This file contains the most important, discoverable details an AI coding agent needs to be productive in this repo.

## Quick Architecture
- Single-page vanilla JS game (no bundler). Scripts are loaded via [index.html](../../index.html) in a fixed order: utilities → enums → types → classes → generators → UI → menus → `main.js`.
- Central state: `gs` (see [globals.js](../../globals.js)) is the authoritative runtime state and is serialized to `localStorage` under key `spaceGameState` by [GameState.js](../../classes/GameState.js).
- UI: modal/panel system in [ui.js](../../ui.js) — use `ce()`, `createPanel()` / `showPanel()` or `showModal()` and `showElement()` to replace `#game-container`.
- Rendering: `CanvasWrapper` ([menus/CanvasWrapper.js](../../menus/CanvasWrapper.js)) provides an imperative canvas API (addFilledCircle, addText, addLine, etc.) used by star map and encounters.

## Core Patterns & Conventions
- Global-first: code relies on globals (e.g., `gs`, `EARTH`, `PLANETS`), not ES modules. Keep script order and don't convert files to modules without updating `index.html`.
- Factories: use `generators.js` (`generateShip`, `generateFleet`, `generateEncounter`) to create domain objects rather than mutating templates inline.
- Types: `types/` defines type classes (e.g., `ShipType` in `types/SHIP_TYPES.js`). To add a new ship, update that file and use `generateShip()` where appropriate.
- UI panels: build content with `ce({children:[...]})` and pass to `showModal(title, contentEl, buttons)` or `showPanel()`; use `refreshPanelButtons(panel, buttons)` to update buttons.

## Debug / Run Notes
- No npm scripts — open `index.html` in a browser or serve folder via a lightweight server: e.g. `python -m http.server 8000` and browse to `http://localhost:8000`.
- Debugging: use browser DevTools. Helpful globals to inspect: `gs`, `gs.fleet`, `gs.system`.
- Console logging: many places already use `console.log()`; add `debugger` or breakpoints in the browser for real-time inspection (encounter tick runs from `menus/encounterMap.js`).

## Important Implementation Details & Gotchas
- Script order is critical: reordering `index.html` breaks constructor references (classes assume prior globals exist).
- Persistent save format: `GameState._serialize()` saves references (e.g., system by name) — follow existing `_deserialize()` when adding new fields.
- Encounters are transient: `GameState.encounter` is intentionally not serialized.
- UI replace pattern: menus call `showElement()` which wipes `#game-container`. To create non-modal overlays, attach to DOM manually via `ce()`.
- Canvas hit detection uses `isMouseOverObject()`; note simple circular hitboxes for text fallback.
- Common bug pattern: some handlers use the implicit `event` variable; prefer function parameters (e.g., `handleClick(e)` uses `event` inside — watch for this when editing).

## Examples (Concrete)
- Add a ship type: edit `types/SHIP_TYPES.js` (see `ShipType` class). Example: `SHIP_TYPES.MY_SHIP = new ShipType('MyShip', hull, shields, lasers, engine, cargoSpace)`.
- Add a menu: create a function in `menus/*.js` that builds content with `ce()` and calls `showModal(title, content, buttons)`; follow `menus/titleMenu.js` and `menus/planetMenu.js` for examples.
- Add a canvas object: use `const map = new CanvasWrapper()` then `map.addFilledCircle('id', x, y, size, minSize, '#fff', onClick)`.
- Persisted fields: if adding persistent fields to `GameState`, update `_serialize()` and `_deserialize()` together.

## File Edit Priorities
When making changes, edit in this order to minimize breakage:
1. `CONSTS.js` & `ENUMS.js` (global constants)
2. `classes/` (domain models)
3. `types/` (type definitions)
4. `menus/` and `ui.js` (UI logic)
5. `generators.js` (content generators)

## Developer workflows / Tips
- Run locally: `python -m http.server 8000` or use VS Code Live Server extension.
- To inspect save data: `localStorage.getItem('spaceGameState')` in DevTools.
- To reproduce encounter issues: open the encounter map (`menus/encounterMap.js`) and set breakpoints in `Encounter.tick()`.

If anything above is unclear or you'd like step-by-step examples for a specific change (add ship, add menu, change serialization), tell me which area and I will expand the instructions.
