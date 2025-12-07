
class Route {
    constructor(fleet = new Fleet(), destination = new Planet(), startYear = gameState.year) {
        //run simu
        const naiveDistance = calcDistance(fleet.x, fleet.y, destination.x, destination.y)
        const naiveTravelTime = naiveDistance/fleet.calcSpeed()
        const {endX, endY, endYear, bestTime} = Route.estimateTravelTimeToOrbitingBody(startYear, fleet, destination, 100, naiveTravelTime*2+1)
        this.fleet = fleet
        this.destination = destination
        this.startYear = startYear
        this.endYear = endYear
        this.travelTime = bestTime
        this.path = new Path(fleet.x, fleet.y, endX, endY)
    }

    positionAtYear(year = 0) {
        if (year < this.startYear) return [this.path.startX, this.path.startY]
        if (year > this.endYear) return [this.path.endX, this.path.endY]
        const duration = this.endYear - this.startYear
        const elapsedTime = year - this.startYear
        const progressRatio = elapsedTime/duration
        const normalProgress = applyNormalCurve(progressRatio)
        return [this.path.startX + this.path.dx*normalProgress, this.path.startY + this.path.dy*normalProgress]
    }

    static estimateTravelTimeToOrbitingBody(
        startYear = 0,
        fleet = new Fleet(),
        planet = new Planet(),
        samples = 100,
        maxYears = 10
    ) {
        const results = [];
        const speed = fleet.calcSpeed()
        let bestYearOffset = Infinity;
        let endPosition;

        console.log('estimating travel time to an orbiting body:',startYear,fleet,planet,samples,maxYears)

        for (let i = 0; i < samples; i++) {
            const t = (i / samples) * maxYears; // future year offset

            // planet's position in AU
            const [px, py] = planet.calcAbsPositionAtYear(startYear + t);

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

        if (!endPosition) throw new Error('couldnt find a valid route!')

        return {
            bestYearOffset,
            endPosition,
            endX: endPosition[0],
            endY: endPosition[1],
            endYear: startYear+bestYearOffset,
            debug: results
        };
    }
}
