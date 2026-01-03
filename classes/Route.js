

class Route {
    /**
     * @param {Fleet} fleet
     * @param {SpaceObject|Waypoint} destination
     * @param {number} startYear
     */
    constructor(fleet = new Fleet(), destination = new Planet(), startYear = gs.year) {
        //run simu
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
        const naiveTravelTime = naiveDistance/fleet.speed
        //add one extra day
        const {toX, toY, endYear} = Route.estimateTravelTimeToOrbitingBody(startYear, fleet, destination, 100, naiveTravelTime*10+1/365)
        this.endYear = endYear
        this.travelTime = endYear-startYear
        this.path = new Path(fleet.x, fleet.y, toX, toY)
        this.valid = true
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
     * @returns {{bestYearOffset: number, endPosition: [number, number], toX: number, toY: number, endYear: number, debug: Array}}  
     */
    static estimateTravelTimeToOrbitingBody(
        startYear = 0,
        fleet = new Fleet(),
        planet = new Planet(),
        samples = 100,
        maxYears = 10
    ) {
        const results = [];
        const speed = fleet.speed
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
