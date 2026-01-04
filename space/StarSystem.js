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
     * @param {SpaceStation[]} spaceStations - The space stations in the star system.
     * @param {Fleet[]} fleets - The fleets in the star system.
     * @param {AsteroidBelt[]} asteroidBelts - The asteroid belts in the star system.
     * @param {Asteroid[]} asteroids - The asteroids in the star system.
     * @param {BackgroundStar[]} backgroundStars - The background stars for visual effect.
     * @param {Religion[]} religions - The religions in the star system.
     * @param {Anomaly[]} anomalies - The anomalies in the star system.
     * @param {Ruins[]} ruins - The ruins in the star system.
     */
    constructor(name = "Unnamed", color = COLORS.White, radius = 0, barycenter = null, stars = [], planets = [], dwarfPlanets = [], spaceStations = [], fleets = [], asteroidBelts = [], asteroids = [], backgroundStars = [], religions = [], anomalies = [], ruins = []) {
        console.log('instantiating star system w name:', name, 'stars:', stars, 'planets:', planets, 'dwarf planets:', dwarfPlanets, 'space stations:', spaceStations, 'fleets:', fleets);
        super(name, OBJECT_TYPES.ABSTRACT, color, radius, 0, 0);
        /** @type {SpaceObject} */
        this.barycenter = barycenter
        /** @type {Star[]} */
        this.stars = stars
        /** @type {Planet[]} */
        this.planets = planets
        /** @type {Planet[]} */
        this.dwarfPlanets = dwarfPlanets
        /** @type {SpaceStation[]} */
        this.spaceStations = spaceStations
        /** @type {Fleet[]} */
        this.fleets = fleets
        /** @type {AbandonedFleet[]} */
        this.abandonedFleets = []
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
            
            // Skip if target fleet no longer exists
            if (!targetFleet || !this.fleets.includes(targetFleet)) {
                fleet.route = null
                continue
            }
            
            // Check if target's route has changed (including both becoming null or non-null)
            if (targetFleet.route !== interceptionRoute.targetRouteAtCreation) {
                console.log(`🎯 ${fleet.name}'s target ${targetFleet.name} changed route - recalculating interception`)
                
                // Create new InterceptionRoute to continue the chase
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
     * Resurrects an abandoned fleet back into a normal active fleet.
     * @param {AbandonedFleet} abandonedFleet - The abandoned fleet to resurrect.
     * @returns {Fleet|null} The resurrected fleet, or null if resurrection failed.
     */
    resurrectFleet(abandonedFleet) {
        if (!(abandonedFleet instanceof AbandonedFleet)) {
            console.error('resurrectFleet: Not an AbandonedFleet');
            return null;
        }
        
        if (!abandonedFleet.officers || abandonedFleet.officers.length === 0) {
            console.error('resurrectFleet: No officers to resurrect fleet');
            return null;
        }
        
        console.log(`✨ Resurrecting abandoned fleet ${abandonedFleet.name}`);
        
        // Create new Fleet from the abandoned one
        const resurrectedFleet = new Fleet(
            abandonedFleet.fleetType.name, // Restore original name from fleet type
            abandonedFleet.planet,
            abandonedFleet.fleetType,
            abandonedFleet.factionType,
            abandonedFleet.color.map(c => c * 2), // Restore original brightness
            abandonedFleet.x,
            abandonedFleet.y
        );
        
        // Transfer properties from abandoned fleet
        resurrectedFleet.ships = abandonedFleet.ships;
        resurrectedFleet.cargo = abandonedFleet.cargo;
        resurrectedFleet.equipment = abandonedFleet.equipment;
        resurrectedFleet.officers = abandonedFleet.officers;
        resurrectedFleet.flagship = abandonedFleet.flagship;
        resurrectedFleet.angle = abandonedFleet.angle;
        
        // Resurrected ships come back with half hull
        for (const ship of resurrectedFleet.ships) {
            ship.hull[0] = Math.ceil(ship.hull[1] / 2);
        }
        
        // Assign captain if none exists (pick first living officer)
        if (!resurrectedFleet.captain || !resurrectedFleet.officers.includes(resurrectedFleet.captain)) {
            resurrectedFleet.captain = resurrectedFleet.officers[0];
            console.log(`👤 Assigned ${resurrectedFleet.captain.name} as new captain`);
        }
        
        // Assign appropriate AI based on fleet type
        const aiType = getFleetAITypeForFleetType(resurrectedFleet.fleetType);
        if (aiType) {
            resurrectedFleet.fleetAI = new aiType.aiClass(resurrectedFleet, resurrectedFleet.planet, currentMap);
            console.log(`🤖 Assigned ${aiType.name} to resurrected fleet`);
        }
        
        // Remove from abandonedFleets and add to active fleets
        this.removeAbandonedFleet(abandonedFleet);
        this.fleets.push(resurrectedFleet);
        
        console.log(`✅ Successfully resurrected ${resurrectedFleet.name} with ${resurrectedFleet.officers.length} officers`);
        return resurrectedFleet;
    }
}
