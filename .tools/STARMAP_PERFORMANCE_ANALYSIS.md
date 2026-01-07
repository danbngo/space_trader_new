# StarMap Performance Analysis

## Executive Summary
The starmap has performance bottlenecks primarily from **continuous rendering loops** that run even when paused, and **expensive per-frame operations** on large datasets.

## Rendering Architecture

### Main Render Loops
1. **`animateBackgroundStars()`** - Runs continuously via `requestAnimationFrame` (even when paused)
   - Updates 5000+ background star pixels every frame
   - Updates asteroids every 600th frame
   - Calls `cvs.redraw(true)` every frame
   
2. **`tick()`** - Game update loop (runs when unpaused)
   - Updates every `requestAnimationFrame`
   - Calls `handleCanvasObjects()` which re-renders all entities
   - Runs at ~60 FPS

3. **`animateWaypoint()`** - Continuous waypoint animation
   - Runs every frame via `requestAnimationFrame`

## Most Expensive Operations (Ranked)

### 1. **Background Stars** (HIGHEST IMPACT)
**Location:** `StarMapBodiesHandler.handleBackgroundStars()`
- **Count:** 5000+ pixel objects
- **Per-frame cost:** 
  - Iterates all 5000 stars
  - Calls `bgStar.twinkle(gs.year)` on each
  - Calculates vision distance for each star
  - Updates alpha channel for fog-of-war
- **Why expensive:** Massive loop running every single frame
- **Optimization:** Already throttled to update only when camera/player moves

### 2. **Text Rendering** (HIGH IMPACT)
**Locations:** Planet labels, fleet labels, unknown markers
- **Cost per label:**
  - Canvas `measureText()` calls
  - Font rendering
  - Click detection hitboxes
- **Count:** ~20-50 text objects depending on system
- **Why expensive:** Canvas text rendering is slow, especially with custom fonts

### 3. **Fleet Updates** (MEDIUM-HIGH IMPACT)
**Location:** `StarMapFleetsHandler.handleFleets()`
- **Per fleet operations:**
  - Fog-of-war distance calculations (`calcDistance`)
  - Smooth rotation interpolation (every frame)
  - Brightness oscillation (`Math.sin` calculations)
  - Thruster size/alpha oscillation
  - Path line updates
- **Why expensive:** Trigonometry + oscillation calculations per fleet per frame

### 4. **Planet Shadow Polygons** (MEDIUM IMPACT)
**Location:** `StarMapBodiesHandler.handlePlanets()`
- Creates complex polygon with 50+ vertices for shadow
- Renders two overlapping shapes per planet (circle + crescent shadow)
- **Why expensive:** Polygon rendering with many vertices

### 5. **Asteroid Updates** (LOW-MEDIUM IMPACT)
**Location:** `StarMapBodiesHandler.handleAsteroids()`
- Updates ~100-500 asteroids
- Fog-of-war calculations per asteroid
- Screen radius calculations
- **Why expensive:** Large number of objects, though throttled to every 600 frames

### 6. **Vision Distance Calculations** (PERVASIVE)
- `calcDistance()` called for every entity to check fog-of-war
- Runs for: background stars, asteroids, planets, fleets
- **Why expensive:** Square root calculations are moderately expensive
- **Note:** Could be optimized with squared distance comparisons

## Frame-by-Frame Analysis

### Every Frame:
1. `animateBackgroundStars()` - processes 5000 stars
2. `animateWaypoint()` - animates waypoint marker
3. `cvs.redraw(true)` - full canvas redraw
4. If unpaused: `handleCanvasObjects()` - re-renders all entities

### Every 30 Frames (when player moves):
- Background stars repositioned

### Every 600 Frames (when player moves):
- Asteroids repositioned

### Every 30 Ticks:
- Discovery system updates (`updateDiscoveries()`)

## Debug Config Implementation

Added `STARMAP_DEBUG_CONFIG` at top of `starMap.js` with toggles for:
- `displayBackgroundStars` - 5000+ parallax stars (**biggest impact**)
- `displayAsteroids` - ~100-500 asteroids
- `displayOrbits` - Orbital circles
- `displayStars` - Sun/stars
- `displayPlanets` - Planets + shadows (**high polygon count**)
- `displayPlanetLabels` - Planet text labels (**expensive**)
- `displaySpaceStations` - Space stations
- `displayAnomalies` - Anomalies
- `displayRuins` - Ruins
- `displayFleets` - All fleets
- `displayFleetLabels` - Fleet text labels (**expensive**)
- `displayFleetPaths` - Fleet route lines
- `displayFleetThrusters` - Animated thruster effects
- `displayAbandonedFleets` - Destroyed fleets
- `displayWaypoint` - Waypoint marker
- `logPerformance` - Console timing logs

## Recommended Performance Tests

### Test 1: Isolate Background Stars
```javascript
STARMAP_DEBUG_CONFIG.displayBackgroundStars = false
```
**Expected impact:** 30-50% FPS improvement

### Test 2: Disable All Text
```javascript
STARMAP_DEBUG_CONFIG.displayPlanetLabels = false
STARMAP_DEBUG_CONFIG.displayFleetLabels = false
```
**Expected impact:** 15-25% FPS improvement

### Test 3: Disable Fleet Animations
```javascript
STARMAP_DEBUG_CONFIG.displayFleetThrusters = false
```
**Expected impact:** 5-10% FPS improvement

### Test 4: Minimal Mode (only essential elements)
```javascript
STARMAP_DEBUG_CONFIG.displayBackgroundStars = false
STARMAP_DEBUG_CONFIG.displayAsteroids = false
STARMAP_DEBUG_CONFIG.displayPlanetLabels = false
STARMAP_DEBUG_CONFIG.displayFleetLabels = false
STARMAP_DEBUG_CONFIG.displayFleetThrusters = false
```
**Expected impact:** 50-70% FPS improvement

## Optimization Recommendations

### Immediate (Easy):
1. **Reduce background star count** from 5000 to 1000-2000
2. **Throttle fleet oscillations** - update every 2-3 frames instead of every frame
3. **Use squared distance** for fog-of-war checks (avoid sqrt)
4. **Batch canvas operations** - minimize state changes

### Medium-term:
1. **Spatial partitioning** - only process entities near camera viewport
2. **Level-of-detail** - simplify distant objects (fewer vertices, no shadows)
3. **Object pooling** - reuse canvas objects instead of constant lookups
4. **Dirty flag system** - only redraw when something actually changed

### Long-term:
1. **WebGL renderer** - hardware-accelerated rendering
2. **Offscreen canvas** for background layers
3. **Web Workers** for physics/distance calculations
4. **Instance rendering** for similar objects (fleets, asteroids)

## Current Optimizations Already in Place
✓ Background stars only update when camera/player moves
✓ Asteroids throttled to every 600 frames
✓ Discoveries update every 30 ticks (not every frame)
✓ Visibility culling for hidden/unknown fleets (fog-of-war)
✓ Minimum screen size culling for tiny asteroids when zoomed out

## Bottleneck Priority
1. **Background stars** (5000 objects * every frame = 300,000 ops/sec @ 60fps)
2. **Text rendering** (20-50 labels * complex font rendering)
3. **Fleet oscillations** (trig calculations every frame)
4. **Planet shadows** (50+ vertex polygons per planet)
5. **Distance calculations** (hundreds per frame for fog-of-war)
