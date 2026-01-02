

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
        this.init()
    }

    init() {
        this.valid = false
        const {fleet, destination, startYear} = this
        let result
        if (fleet.x == destination.x && fleet.y == destination.y) { 
            return
        }
        // Check if destination is a moving fleet with an active route
        if (destination instanceof Fleet && destination.route && destination.route.path) {
            result = Route.estimateInterceptTimeForMovingFleet(startYear, fleet, destination)
        }
        //fall back to og method
        if (!result) {
            // Original logic for stationary/orbiting bodies
            const naiveDistance = calcDistance(fleet.x, fleet.y, destination.x, destination.y)
            const naiveTravelTime = naiveDistance/fleet.speed
            result = Route.estimateTravelTimeToOrbitingBody(startYear, fleet, destination, 100, naiveTravelTime*10+1/365)
        }
        if (result) {
            this.endYear = result.endYear
            this.travelTime = this.endYear - startYear + 0.0001 //add a tiny bit to prevent ROCKETING over short distances
            this.path = new Path(fleet.x, fleet.y, result.toX, result.toY)
            this.valid = true
        }
    }

    refresh() {
        /*this.path.toX = this.destination.x
        this.path.toY = this.destination.y
        this.path.dx = this.path.toX - this.path.startX
        this.path.dy = this.path.toY - this.path.startY
        this.path.distance = Math.sqrt(this.path.dx*this.path.dx + this.path.dy*this.path.dy);
        this.path.angle = Math.atan2(this.path.dy, this.path.dx);
        this.path.angleDeg = radiansToDegrees(this.path.angle) // convert to degrees*/
        this.path = new Path(this.path.startX, this.path.startY, this.destination.x, this.destination.y)
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

    /**
     * Calculate interception course for a moving fleet target
     * @param {number} startYear - Current game year
     * @param {Fleet} pursuer - Fleet attempting to intercept
     * @param {Fleet} target - Fleet being pursued
     * @param {number} [samples=50] - Number of sample points along target's route
     * @param {number} [maxYearsAhead=null] - Max time to search (defaults to 1.5x target's remaining travel time)
     * @returns {{toX: number, toY: number, endYear: number, interceptTime: number}|null} - Intercept details or null if impossible
     */
    static estimateInterceptTimeForMovingFleet(
        startYear = 0,
        pursuer = new Fleet(),
        target = new Fleet(),
        samples = 50,
        maxYearsAhead = null
    ) {
        if (!target.route || !target.route.path) {
            console.warn('Target fleet has no route')
            return null
        }

        // Limit search to target's remaining travel time + buffer
        const targetRemainingTime = target.route.endYear - startYear
        const searchWindow = maxYearsAhead || (targetRemainingTime * 1.5)
        
        let bestInterceptTime = Infinity
        let bestPosition = null

        for (let i = 0; i < samples; i++) {
            const futureYear = startYear + (i / samples) * searchWindow
            
            // Where will target be at this future time?
            if (futureYear > target.route.endYear) {
                // Target will have reached destination - intercept there
                const tx = target.route.path.toX
                const ty = target.route.path.toY
                const dist = calcDistance(pursuer.x, pursuer.y, tx, ty)
                const pursuerTravelTime = dist / pursuer.speed
                const timeToReachDestination = futureYear - startYear
                
                if (pursuerTravelTime <= timeToReachDestination) {
                    const interceptTime = pursuerTravelTime
                    if (interceptTime < bestInterceptTime) {
                        bestInterceptTime = interceptTime
                        bestPosition = [tx, ty]
                    }
                }
            } else {
                // Target is still in transit
                const [tx, ty] = target.route.positionAtYear(futureYear)
                const dist = calcDistance(pursuer.x, pursuer.y, tx, ty)
                const pursuerTravelTime = dist / pursuer.speed
                const timeUntilTargetThere = futureYear - startYear
                
                // Can we get there before or when target does?
                if (pursuerTravelTime <= timeUntilTargetThere) {
                    if (pursuerTravelTime < bestInterceptTime) {
                        bestInterceptTime = pursuerTravelTime
                        bestPosition = [tx, ty]
                    }
                }
            }
        }

        if (!bestPosition) {
            return null // Interception impossible
        }

        return {
            toX: bestPosition[0],
            toY: bestPosition[1],
            endYear: startYear + bestInterceptTime,
            interceptTime: bestInterceptTime
        }
    }
}
