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
     * @param {AsteroidBelt[]} asteroidBelts - The asteroid belts in the star system.
     * @param {Asteroid[]} asteroids - The asteroids in the star system.
     * @param {BackgroundStar[]} backgroundStars - The background stars for visual effect.
     * REMOVED: Religion, Anomaly, Ruins
     */
    constructor(name = "Unnamed", color = COLORS.White, radius = 0, barycenter = null, stars = [], planets = [], dwarfPlanets = [], 
        moons = [], spaceStations = [], asteroidBelts = [], asteroids = [], backgroundStars = []) {
        console.log('instantiating star system w name:', name, 'stars:', stars, 'planets:', planets, 'dwarf planets:', dwarfPlanets, 'moons:', moons, 'space stations:', spaceStations);
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
       
    }


     /**
     * Calculate total population across all planets, dwarf planets, and space stations
     * @param {boolean} visitedOnly - If true, only count visited locations
     * @returns {number} - Total population
     */
    getTotalPopulation = (visitedOnly = false) => {
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

    deductFuel(fleet, distanceTraveled) {
        if (!fleet || fleet.destroyed) return
        const fuelCost = distanceTraveled * FUEL_COST_PER_1_AU
        fleet.fuel = Math.max(0, fleet.fuel - fuelCost)
    }

    updatePositions(year = gs.year) {
        const objects = [...this.stars, ...this.planets, ...this.dwarfPlanets, ...this.spaceStations, ...this.asteroids]
        for (const obj of objects) {
            const [x, y] = obj.calcAbsPositionAtYear(year)
            obj.x = x
            obj.y = y
        }
        // Get primary star (assumes first star is the sun)
        const star = this.stars[0]
        if (!star) return // No star, can't process orbits
    }
}
