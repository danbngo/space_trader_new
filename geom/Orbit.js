
// Orbit class
class Orbit {
    constructor(radius = 0, progressOffset = Math.random()) {
        this.radius = radius;
        this.progressOffset = progressOffset % 1;
    }

    // Calculate orbital period in Earth years (Kepler's third law simplified: P^2 = a^3, a in AU, P in years)
    calcPeriod() {
        return Math.sqrt(Math.pow(this.radius, 3));
    }

    // Calculate progress along orbit as a 0-1 ratio given elapsed years
    calcProgress(years = 0) {
        years -= GAME_START_YEAR //adjusting this to make progressOffset work correctly
        const period = this.calcPeriod();
        const naturalProgress = (years / period)
        const result = (naturalProgress + this.progressOffset) % 1;
        return result;
    }

    calcAngle(years = 0) {
        const progress = this.calcProgress(years);
        const result = 2 * Math.PI * progress;
        //console.log('calcAngle:', years, progress, result);
        return result;
    }

    // Calculate x, y position relative to center based on elapsed years
    calcRelativePosition(years = 0) {
        const angle = this.calcAngle(years);
        const x = this.radius * Math.cos(angle);
        const y = this.radius * Math.sin(angle);
        return [x,y]
    }
}