# Space Trader - AI Coding Instructions

## Architecture Overview

**Space Trader** is a single-page JavaScript game with three core architectural layers:

1. **Game State** ([GameState.js](../../classes/GameState.js)) - The central data store holding: year, player's fleet, star system state, and all game logic. Persisted via `localStorage` with custom serialization (see `_serialize()` and `_deserialize()`).

2. **Menu System** ([menus/](../../menus/)) - Modal-driven UI that fills `#game-container`. Key navigation functions: `showTitleScreen()`, `showStarMap()`, `showPlanetMenu()`, etc. All menus use `showElement()` from [ui.js](../../ui.js) to replace the entire container.

3. **Canvas Rendering** ([CanvasWrapper.js](../../menus/CanvasWrapper.js)) - Custom 2D canvas abstraction with `CanvasObject` class (shapes: Dot, FilledCircle, Triangle, Text, Line). Powers the star map and encounter map with click/hover handlers.

## Key Data Models

- **Fleet** ([Fleet.js](../../classes/Fleet.js)): Ships, cargo (CountsMap), officers, captain, location (docked planet or route). Calculates speed from thrusters-to-weight ratio.
- **Ship** ([Ship.js](../../classes/Ship.js)): Hull, shields, lasers, thrusters, cargoSpace. Drawn from SHIP_TYPES (Transport, Cargo Ship, Scout, etc.).
- **StarSystem** ([StarSystem.js](../../classes/StarSystem.js)): Contains planets with orbital positions updated yearly via `refreshPositions()`.
- **Encounter** ([Encounter.js](../../classes/Encounter.js)): Real-time space combat system (600+ lines). Ships spawn within `ENCOUNTER_MAP_RADIUS_MILES`, tick physics, handle projectiles/collisions, and feed into `EncounterAI` for NPC behavior.

## Project Patterns & Conventions

### Global State vs. Factories
- Use `gameState` global for persistent game state (see [globals.js](../../globals.js)).
- Use generator functions for one-time content creation: `generateShip()`, `generateOfficer()`, `generateSettlement()`, `generateEncounter()` (see [generators.js](../../generators.js)).
- Enum-like objects are frozen: `ENCOUNTER_RESULTS`, `SKILLS`, `SHAPES` (see [ENUMS.js](../../ENUMS.js)).

### Module Organization
- Utilities in [utils.js](../../utils.js): `rndMember()`, `rndInt()`, `createElement()`.
- Type definitions in [types/](../../types/): `SHIP_TYPES`, `FLEET_TYPES`, `ENCOUNTER_TYPES`, `CARGO_TYPES` are object collections with explicit type classes (e.g., `ShipType`).
- Constants in [CONSTS.js](../../CONSTS.js): Physics values (ship radius, projectile speed, turn times), encounter mechanics, combat thresholds.

### HTML Structure & Loading Order
The [index.html](../../index.html) follows a strict script inclusion order: utilities → enums → types → classes → generators → UI helpers → menus → **main.js** (calls `start()`).
**DO NOT** reorder scripts—classes depend on prior definitions. Game state is instantiated in [globals.js](../../globals.js) *after* all classes load.

## UI Navigation & Render Cycle

**Title Menu** → **Star Map** → **Planet Menu** → **Market/Shipyard/Guild** → **Encounter Map** (real-time)

- All menu functions clear the container: `showElement()` replaces entire DOM.
- Use `showElement(createElement(...))` to build and display panels.
- The star map is the central "hub"—most menus return to it with `showStarMap()` or `displayStarMap()`.
- Encounters are modal overlays; after resolving, player returns to the planet menu or star map.

## Encounter System (Combat Loop)

[Encounter.js](../../classes/Encounter.js) drives real-time combat:
- **Tick-based**: Called at 60 FPS from [encounterMap.js](../../menus/encounterMap.js), each tick runs physics, collision detection, AI planning, and input handling.
- **AI** ([EncounterAI.js](../../classes/EncounterAI.js)): Ships plan moves, rotate toward targets, and fire based on strategy (currently `AttackNearest`).
- **Physics**: Acceleration, momentum, rotation limited by thrusters. See `ENCOUNTER_THRUSTER_PENALTY`, `DECELERATION_SPEED_RATIO` in [CONSTS.js](../../CONSTS.js).
- **Projectiles**: Spawn on fire, check distance-based collisions with ships, deal damage, and despawn on impact.

## Class Hierarchy

- **SpaceObject** (base): Position, name, color. Extended by Fleet, Projectile, and orbital SpaceObjects.
- **Officer**: Named crew with skills (Navigation, Diplomacy, Engineering) affecting prices, encounters, ship repair.
- **Culture & Settlement**: Generated per planet; flavor text and market/shipyard/guild inventories.
- **Route & Orbit**: Path calculations for fleet movement between planets and orbital mechanics.

## Save/Load Mechanism

[GameState.js](../../classes/GameState.js) implements custom serialization:
- `save()` stores stringified `_serialize()` output to localStorage key `"spaceGameState"`.
- `load()` reads and calls `_deserialize()` to restore complex objects (ships, officers, fleets).
- **Important**: Encounters cannot be saved in-progress; `this.encounter = null` initially.

## CSS Organization

[css/](../../css/) splits styles by concern: buttons, canvas (star map), core, modal, panels, tables, starmap layout.
Use semantic class names matching [ui.js](../../ui.js) helpers: `.panel`, `.panel-title`, `.panel-buttons`.

## Development Notes

- **No build step or package manager**—vanilla JS only.
- **Canvas scaling**: Star map positions use AU (Astronomical Units); encounter map uses miles. See conversions in [CONSTS.js](../../CONSTS.js).
- **Randomness**: `rndMember()` and `rndInt()` from [utils.js](../../utils.js).
- **Plans**: Check [plans.txt](../../plans.txt) for backlog.

## File Edit Priorities

When modifying the codebase, prioritize this order to avoid breakage:
1. [CONSTS.js](../../CONSTS.js) & [ENUMS.js](../../ENUMS.js) - Constants and globals
2. [classes/](../../classes/) - Core data models (respect constructor signatures)
3. [types/](../../types/) - Type definitions
4. [menus/](../../menus/) - UI/menu logic
5. [generators.js](../../generators.js) - Content generation
