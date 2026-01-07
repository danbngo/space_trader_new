/**
 * Represents a star system with stars, planets, fleets, and other objects.
 * @class StarSystem
 * @extends {SpaceObject}
 */
class StarSystem extends SpaceObject {
    /**
     * @param {string} name - The name of the star system.
     * @param {number[]} color - The color of the star system.
     * @param {number} radius - The radius of the star system.
     * @param {SpaceObject} barycenter - The barycenter of the star system.
     * @param {Star[]} stars - The stars in the star system.
     * @param {Planet[]} planets - The planets in the star system.
     * @param {Planet[]} dwarfPlanets - The dwarf planets in the star system.
     * @param {Moon[]} moons - The moons in the star system.
     * @param {SpaceStation[]} spaceStations - The space stations in the star system.
     * @param {Fleet[]} fleets - The fleets in the star system.
     * @param {AsteroidBelt[]} asteroidBelts - The asteroid belts in the star system.
     * @param {Asteroid[]} asteroids - The asteroids in the star system.
     * @param {BackgroundStar[]} backgroundStars - The background stars for visual effect.
     * @param {Religion[]} religions - The religions in the star system.
     * @param {Anomaly[]} anomalies - The anomalies in the star system.
     * @param {Ruins[]} ruins - The ruins in the star system.
     */
    constructor(name = "Unnamed", color = COLORS.White, radius = 0, barycenter = null, stars = [], planets = [], dwarfPlanets = [], moons = [], spaceStations = [], fleets = [], asteroidBelts = [], asteroids = [], backgroundStars = [], religions = [], anomalies = [], ruins = []) {
        console.log('instantiating star system w name:', name, 'stars:', stars, 'planets:', planets, 'dwarf planets:', dwarfPlanets, 'moons:', moons, 'space stations:', spaceStations, 'fleets:', fleets);
        super(name, OBJECT_TYPES.ABSTRACT, color, radius, 0, 0);
        /** @type {SpaceObject} */
        this.barycenter = barycenter
        /** @type {Star[]} */
        this.stars = stars
        /** @type {Planet[]} */
        this.planets = planets
        /** @type {Planet[]} */
        this.dwarfPlanets = dwarfPlanets
        /** @type {Moon[]} */
        this.moons = moons
        /** @type {SpaceStation[]} */
        this.spaceStations = spaceStations
        /** @type {Fleet[]} */
        this.fleets = fleets
        /** @type {Fleet[]} - Destroyed fleets that can be salvaged or resurrected */
        this.abandonedFleets = []
        /** @type {number} - Frame counter for orbital decay timing */
        this.updatePositionsFrameCount = 0
        /** @type {AsteroidBelt[]} */
        this.asteroidBelts = asteroidBelts
        /** @type {Asteroid[]} */
        this.asteroids = asteroids
        /** @type {BackgroundStar[]} */
        this.backgroundStars = backgroundStars
        this.asteroids = asteroids
        /** @type {News[]} */
        this.news = [] //actual News class objects, used to build a timeline
        /** @type {News[]} */
        this.history = []
        /** @type {string[]} */
        this.newsFeed = [] //strings that have more detailed data
        this.simpleNews = []
        /** @type {Religion[]} */
        this.religions = religions
        /**
         * Calculate total population across all planets, dwarf planets, and space stations
         * @param {boolean} visitedOnly - If true, only count visited locations
         * @returns {number} - Total population
         */
        this.getTotalPopulation = (visitedOnly = false) => {
            let total = 0
            const allBodies = [...this.planets, ...this.dwarfPlanets, ...this.spaceStations]
            for (const body of allBodies) {
                if (visitedOnly && !gs.lastVisitedDates.has(body)) continue
                if (body.c && body.c.population) {
                    total += body.c.population
                }
            }
            return total
        }
        
        /**
         * Calculate what percentage of total system population this planet represents
         * @param {Planet} planet - The planet to get share for
         * @returns {number} - Percentage (0-100) of total population
         */
        this.getPopulationShare = (planet) => {
            const totalPop = this.getTotalPopulation(false)
            if (totalPop === 0 || !planet.c || !planet.c.population) return 0
            return (planet.c.population / totalPop) * 100
        }
        
        /** @type {Anomaly[]} */
        this.anomalies = anomalies
        /** @type {Ruins[]} */
        this.ruins = ruins
    }

    /**
     * @returns {[Planet, number]} The nearest planet and its distance from the given object.
     */
    calcNearestPlanet(obj = new SpaceObject(), planets = this.planets) {
        let nearestDistance = Infinity
        let nearestPlanet = planets[0]
        const allPlanets = [...this.planets, ...this.dwarfPlanets]
        for (const planet of allPlanets) {
            const dist = calcDistance(obj.x, obj.y, planet.x, planet.y)
            if (dist < nearestDistance) {
                nearestDistance = dist
                nearestPlanet = planet
            }
        }
        return [nearestPlanet, nearestDistance]
    }

    updateRoutes(year = gs.year) {
        // Check all fleets with InterceptionRoute to see if target route has changed
        for (const fleet of this.fleets) {
            if (!fleet.route || !(fleet.route instanceof InterceptionRoute)) continue
            
            const interceptionRoute = fleet.route
            const targetFleet = interceptionRoute.targetFleet
            
            // Skip if target fleet no longer exists or is destroyed/abandoned
            if (!targetFleet || !this.fleets.includes(targetFleet) || targetFleet.destroyed) {
                fleet.route = null
                continue
            }
            
            // Check if target's route has changed (including both becoming null or non-null)
            if (targetFleet.route !== interceptionRoute.targetRouteAtCreation) {
                if (targetFleet.route && interceptionRoute.targetRouteAtCreation) {
                    if (targetFleet.route.destination !== interceptionRoute.targetRouteAtCreation.destination) {
                        continue
                    }
                }
                console.log(`🎯 ${fleet.name}'s target ${targetFleet.name} changed route - recalculating interception`)
                // Create new InterceptionRoute to continue the chase (only for active fleets)
                fleet.route = new InterceptionRoute(fleet, targetFleet, year)
            }
        }
    }

    updatePositions(year = gs.year) {
        const objects = [...this.stars, ...this.planets, ...this.dwarfPlanets, ...this.spaceStations, ...this.asteroids, ...(this.ruins || [])]
        for (const obj of objects) {
            const [x, y] = obj.calcAbsPositionAtYear(year)
            obj.x = x
            obj.y = y
        }

        const fleets = this.fleets
        for (const fleet of fleets) {
            //if docked, move with planet
            if (fleet.location && !fleet.route) {
                fleet.x = fleet.location.x
                fleet.y = fleet.location.y
                continue
            }
            if (!fleet.route) continue //if floating in space, do nothing
            //if route not started yet, do nothing
            if (year <= fleet.route.startYear) continue
            //check if route completed, if so arrive at destination and dock
            if (year >= fleet.route.endYear) {
                if (fleet == gs.fleet) {
                    if (currentMap && currentMap.togglePause) currentMap.togglePause(true)
                    if (currentMap && currentMap.selectObject && fleet == gs.fleet) currentMap.selectObject(fleet)
                    
                    // Check if destination is a fleet (for encounters)
                    if (fleet.route.destination instanceof Fleet) {
                        const targetFleet = fleet.route.destination
                        // Trigger encounter with the fleet
                        const encounter = generateEncounterForFleet(targetFleet)
                        if (encounter) {
                            encounter.startEncounter()
                        }
                    }
                    
                    // If using InterceptionRoute and target is still far away and not destroyed, create new route
                    if (fleet.route instanceof InterceptionRoute && fleet.route.targetFleet) {
                        const targetFleet = fleet.route.targetFleet
                        const distanceToTarget = calcDistance(fleet.x, fleet.y, targetFleet.x, targetFleet.y)
                        
                        // If target is still far away and not destroyed/abandoned, continue chase
                        if (distanceToTarget > FLEET_COLLISION_DISTANCE && !targetFleet.destroyed) {
                            console.log(`Target still ${distanceToTarget.toFixed(4)} AU away, generating new interception route...`)
                            fleet.route = new InterceptionRoute(fleet, targetFleet, year)
                            continue // Skip setting route to undefined
                        }
                    }
                }
                //only dock if player fleet near the destination, otherwise its handled by ai
                if (fleet.route.destination instanceof Planet) fleet.dock(fleet.route.destination)
                fleet.route = undefined
                continue
            }
            //otherwise, make progress along journey
            fleet.location = undefined
            const [fx,fy] = fleet.route.positionAtYear(year)
            fleet.x = fx
            fleet.y = fy
            fleet.angle = fleet.route.path ? fleet.route.path.angle : 0
        }
        
        // Check if player fleet has discovered any anomalies
        if (gs.fleet && this.anomalies) {
            for (const anomaly of this.anomalies) {
                if (anomaly.discoveredYear === null && anomaly.detectable(gs.fleet)) {
                    anomaly.discoveredYear = year
                    console.log(`🔍 Discovered anomaly: ${anomaly.name} at ${Math.round(year * 10) / 10}`)
                }
            }
        }

        // Update abandoned fleet positions based on their orbits
        this.updatePositionsFrameCount++
        const shouldDecayOrbits = this.updatePositionsFrameCount % 600 === 0
        
        // Get primary star (assumes first star is the sun)
        const star = this.stars[0]
        if (!star) return // No star, can't process orbits
        
        // Convert star radius from solar radii to AU (1 solar radius ≈ 0.00465047 AU)
        const sunRadiusAU = star.radius * 0.00465047
        
        for (let i = this.abandonedFleets.length - 1; i >= 0; i--) {
            const fleet = this.abandonedFleets[i]
            
            // Ensure fleet has an orbit
            if (!fleet.orbit) {
                // Generate orbit from current position
                fleet.orbit = star.getOrbitAtXY(fleet.x - star.x, fleet.y - star.y)
                console.log(`🌀 Generated orbit for abandoned fleet ${fleet.name} at radius ${fleet.orbit.radius.toFixed(4)} AU`)
            }
            
            // Update position based on orbital mechanics
            const [offsetX, offsetY] = fleet.orbit.calcRelativePosition(year)
            fleet.x = star.x + offsetX
            fleet.y = star.y + offsetY
            
            // Apply orbital decay every 600 frames
            if (shouldDecayOrbits) {
                // Decay rate: 0.001 AU per iteration (tune this for desired spiral speed)
                fleet.orbit.radius -= 0.001
                
                // Check if fleet has fallen into the sun
                if (fleet.orbit.radius < sunRadiusAU) {
                    console.log(`☀️ Abandoned fleet ${fleet.name} has fallen into the sun (radius ${fleet.orbit.radius.toFixed(6)} AU < sun radius ${sunRadiusAU.toFixed(6)} AU)`)
                    this.removeAbandonedFleet(fleet)
                }
            }
        }
    }

    /**
     * Updates what objects the player has discovered/seen based on vision range.
     * Should be called periodically (e.g., every 30 ticks).
     */
    updateDiscoveries() {
        if (!gs.fleet || !gs.fleet.mapViewDistance) return
        
        const viewDistance = gs.fleet.mapViewDistance
        const fleetX = gs.fleet.x
        const fleetY = gs.fleet.y
        
        // Helper function to check if object is in vision range
        const isInVisionRange = (obj) => {
            const distance = calcDistance(fleetX, fleetY, obj.x, obj.y)
            return distance <= viewDistance
        }
        
        // Update last seen dates for all visible objects
        const objectsToCheck = [
            ...this.stars,
            ...this.planets,
            ...this.dwarfPlanets,
            ...(this.spaceStations || []),
            ...(this.anomalies || [])
        ]
        
        for (const obj of objectsToCheck) {
            if (isInVisionRange(obj)) {
                gs.lastSeenDates.set(obj, gs.year)
                
                // Special handling for anomalies - mark as discovered
                if (obj instanceof Anomaly && obj.discoveredYear === null) {
                    obj.discoveredYear = gs.year
                    console.log(`🔍 Discovered anomaly: ${obj.name} at ${Math.round(gs.year * 10) / 10}`)
                }
            }
        }
    }

    destroyFleet(fleet) {
        console.log(`🗑️ Removing fleet ${fleet.name}`)
        this.fleets.splice(gs.system.fleets.indexOf(fleet), 1)
        fleet.x = Infinity
        fleet.y = Infinity
        fleet.location = null
        fleet.route = null
        // Clear this fleet as a target/route for any other fleets
        for (const otherFleet of this.fleets) {
            if (otherFleet.fleetAI?.target === fleet) {
                otherFleet.fleetAI.target = null
            }
        }
    }

    removeAbandonedFleet(abandonedFleet) {
        console.log(`🗑️ Removing abandoned fleet ${abandonedFleet.name}`)
        const index = this.abandonedFleets.indexOf(abandonedFleet)
        if (index >= 0) {
            this.abandonedFleets.splice(index, 1)
        }
        abandonedFleet.x = Infinity
        abandonedFleet.y = Infinity
        // Clear this abandoned fleet as a target for any fleets
        for (const otherFleet of this.fleets) {
            if (otherFleet.fleetAI?.target === abandonedFleet) {
                otherFleet.fleetAI.target = null
                otherFleet.route = null
            }
        }
    }

    /**
     * Resurrects a destroyed fleet back into active status.
     * @param {Fleet} fleet - The destroyed fleet to resurrect.
     * @returns {Fleet|null} The resurrected fleet, or null if resurrection failed.
     */
    resurrectFleet(fleet) {
        if (!fleet || !fleet.destroyed) {
            console.error('resurrectFleet: Not a destroyed fleet');
            return null;
        }
        
        if (!fleet.officers || fleet.officers.length === 0) {
            console.error('resurrectFleet: No officers to resurrect fleet');
            return null;
        }
        
        console.log(`✨ Resurrecting destroyed fleet ${fleet.name}`);
        
        // Remove from abandoned fleets array
        const abandonedIndex = this.abandonedFleets.indexOf(fleet);
        if (abandonedIndex >= 0) {
            this.abandonedFleets.splice(abandonedIndex, 1);
        }
        
        // Add back to active fleets array
        if (!this.fleets.includes(fleet)) {
            this.fleets.push(fleet);
            console.log(`➕ Added ${fleet.name} back to active fleets array`);
        }
        
        // Restore fleet properties
        fleet.destroyed = false;
        fleet.destroyedBy = null; // Clear death record
        fleet.abandonedYear = null;
        fleet.color = fleet.color.map(c => c * 2); // Restore original brightness
        // Restore original name if it was preserved, otherwise use fleet type name
        fleet.name = fleet.originalName || fleet.fleetType.name;
        fleet.originalName = null; // Clear the preserved name
        
        // Resurrected ships come back with half hull
        for (const ship of fleet.ships) {
            ship.hull[0] = Math.ceil(ship.hull[1] / 2);
        }
        
        // Assign captain if none exists (pick first living officer)
        if (!fleet.captain || !fleet.officers.includes(fleet.captain)) {
            throw new Error('fleet should always have a captain! even after abandoned!')
            fleet.captain = fleet.officers[0];
            console.log(`👤 Assigned ${fleet.captain.name} as new captain`);
        }
        
        // Assign appropriate AI based on fleet type (if not already present)
        if (!fleet.fleetAI) {
            const aiType = getFleetAITypeForFleetType(fleet.fleetType);
            if (aiType) {
                fleet.fleetAI = new aiType.aiClass(fleet, fleet.planet, currentMap);
                console.log(`🤖 Assigned ${aiType.name} to resurrected fleet`);
            }
        } else {
            console.log(`🤖 Keeping existing AI for resurrected fleet`);
        }
        
        console.log(`✅ Successfully resurrected ${fleet.name} with ${fleet.officers.length} officers`);
        return fleet;
    }
}
