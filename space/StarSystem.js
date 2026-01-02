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
     */
    constructor(name = "Unnamed", color = COLORS.White, radius = 0, barycenter = null, stars = [], planets = [], dwarfPlanets = [], spaceStations = [], fleets = [], asteroidBelts = [], asteroids = [], backgroundStars = [], religions = [], anomalies = []) {
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

    updatePositions(year = gs.year) {
        const objects = [...this.stars, ...this.planets, ...this.dwarfPlanets, ...this.spaceStations, ...this.asteroids]
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
        }
    }

    removeFleet(fleet) {
        console.log(`🗑️ Removing fleet ${fleet.name}`)
        this.fleets.splice(gs.system.fleets.indexOf(fleet), 1)
    }
}
