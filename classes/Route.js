

class Route {
    /**
     * @param {Fleet} fleet
     * @param {SpaceObject|Waypoint} destination
     * @param {number} startYear
     * @param {boolean} [isInterception=false] - Whether this is an interception route (gets speed boost and reduced margin)
     */
    constructor(fleet, destination, startYear = gs.year, isInterception = false) {
        //run simu
        /** @type {string} */
        this.uuid = generateUUID('route_')
        this.fleet = fleet
        this.destination = destination
        this.startYear = startYear
        this.endYear = startYear
        this.travelTime = 0
        this.path = null
        this.valid = false

        if (fleet.x == destination.x && fleet.y == destination.y) { 
            /** @ts-ignore */
            console.log('ERR: Route destination is the same as fleet location:',fleet.name,fleet.uuid,destination.name,destination.uuid)
            return
        }

        const naiveDistance = calcDistance(fleet.x, fleet.y, destination.x, destination.y)
        // Apply 1.1x speed bonus for interceptions
        const effectiveSpeed = isInterception ? fleet.speed * 1.1 : fleet.speed
        const naiveTravelTime = naiveDistance/effectiveSpeed
        // Interceptions get half the travel margin for tighter pursuit
        const travelMargin = isInterception ? 1/730 : 1/365
        const route = Route.estimateTravelTimeToOrbitingBody(startYear, fleet, destination, 100, naiveTravelTime*10+travelMargin, effectiveSpeed)
        if (route) {
            const {toX, toY, endYear} = route
            this.endYear = endYear + travelMargin//add a small buffer to arrival time
            this.travelTime = this.endYear-this.startYear
            this.path = new Path(this.fleet.x, this.fleet.y, toX, toY)
            this.valid = true
        }
        
        gameRegistry.registerRoute(this)
    }

    positionAtYear(year = 0) {
        const duration = this.endYear - this.startYear
        const elapsedTime = year - this.startYear
        const progressRatio = elapsedTime/duration
        return this.path.positionAtProgress(progressRatio)
    }

    /**
     * 
     * @param {number} startYear 
     * @param {Fleet} fleet 
     * @param {SpaceObject|Waypoint} planet 
     * @param {number} [samples] 
     * @param {number} [maxYears] 
     * @param {number} [effectiveSpeed] - Override fleet speed (used for interception speed bonus)
     * @returns {{bestYearOffset: number, endPosition: [number, number], toX: number, toY: number, endYear: number, debug: Array}}  
     */
    static estimateTravelTimeToOrbitingBody(
        startYear = 0,
        fleet = new Fleet(),
        planet = new Planet(),
        samples = 100,
        maxYears = 10,
        effectiveSpeed = undefined
    ) {
        const results = [];
        const speed = effectiveSpeed !== undefined ? effectiveSpeed : fleet.speed
        let bestYearOffset = Infinity;
        /** @type {[number, number] | undefined} */
        let endPosition;

        //console.log('estimating travel time to an orbiting body:',startYear,fleet,planet,samples,maxYears)

        for (let i = 0; i < samples; i++) {
            const t = (i / samples) * maxYears; // future year offset

            // planet's position in AU
            const [px, py] = planet instanceof Planet ? planet.calcAbsPositionAtYear(startYear + t) : [planet.x, planet.y];

            const dx = px - fleet.x;
            const dy = py - fleet.y;

            const dist = Math.sqrt(dx * dx + dy * dy);
            const travelTime = dist / speed;

            if (travelTime > t) {
                //dont consider this a valid route if fleet couldn't make it there in time
                continue
            }

            results.push([t, travelTime]);

            if (t < bestYearOffset) {
                bestYearOffset = t;
                endPosition = [px,py]
            }
        }

        if (!endPosition) {
            console.log({
                fleet: fleet,
                speed: fleet.speed,
                planet: planet,
                endPosition: endPosition,
                bestYearOffset: bestYearOffset,
                results: results
            })
            /** @ts-ignore */
            console.log('ERR: Could not find a valid route:',fleet.name,fleet.uuid,planet.name,planet.uuid)
            return null
        }

        return {
            bestYearOffset,
            endPosition,
            toX: endPosition[0],
            toY: endPosition[1],
            endYear: startYear+bestYearOffset,
            debug: results
        };
    }
}
