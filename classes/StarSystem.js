class StarSystem extends SpaceObject {
    constructor(name = "Unnamed", color = COLORS.White, radius = 0, x = 0, y = 0, barycenter = null, stars = [], planets = [], fleets = [], asteroidBelts = [], asteroids = [], backgroundStars = []) {
        super(name, color, radius, x, y)
        this.barycenter = barycenter
        this.stars = stars
        this.planets = planets
        this.fleets = fleets
        this.asteroidBelts = asteroidBelts
        this.asteroids = asteroids
        this.backgroundStars = backgroundStars
        this.asteroids = asteroids
    }

    calcNearestPlanet(obj = SpaceObject(), planets = this.planets) {
        let nearestDistance = Infinity
        let nearestPlanet = planets[0]
        for (const planet of this.planets) {
            const dist = calcDistance(obj.x, obj.y, planet.x, planet.y)
            if (dist < nearestDistance) {
                nearestDistance = dist
                nearestPlanet = planet
            }
        }
        return [nearestPlanet, nearestDistance]
    }

    refreshPositions(year = gs.year) {
        const objects = [...this.stars, ...this.planets, ...this.asteroids]
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
                if (fleet.route.destination instanceof Planet) fleet.dock(fleet.route.destination)
                else {
                    fleet.route = undefined
                    fleet.location = undefined
                    if (currentMap && currentMap.togglePause) currentMap.togglePause(true)
                    if (currentMap && currentMap.selectObject && fleet == gs.fleet) currentMap.selectObject(fleet)
                }
                continue
            }
            //otherwise, make progress along journey
            fleet.location = undefined
            const [fx,fy] = fleet.route.positionAtYear(year)
            fleet.x = fx
            fleet.y = fy
        }
    }
}
