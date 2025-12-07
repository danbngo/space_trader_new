
// Orbit class
class Orbit {
    constructor(radius = 0, progressOffset = Math.random()) {
        this.radius = radius;
        this.progressOffset = progressOffset
    }

    // Calculate orbital period in Earth years (Kepler's third law simplified: P^2 = a^3, a in AU, P in years)
    calcPeriod() {
        return Math.sqrt(Math.pow(this.radius, 3));
    }

    // Calculate progress along orbit as a 0-1 ratio given elapsed years
    calcProgress(years = 0) {
        const period = this.calcPeriod();
        return this.progressOffset + (years % period) / period;
    }

    calcAngle(years = 0) {
        const progress = this.calcProgress(years);
        return 2 * Math.PI * progress;
    }

    // Calculate x, y position relative to center based on elapsed years
    calcRelativePosition(years = 0) {
        const angle = this.calcAngle(years);
        const x = this.radius * Math.cos(angle);
        const y = this.radius * Math.sin(angle);
        return [x,y]
    }
}