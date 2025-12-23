/**
 * Represents an arbitrary coordinate waypoint on the star map
 */
class Waypoint {
    /**
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    constructor(x = 0, y = 0) {
        this.x = x
        this.y = y
        this.name = `Coordinates (${roundToPlaces(x, 1)}, ${roundToPlaces(y, 1)})`
        /** @type {number[]} */
        this.color = COLORS.Cyan
        this.isWaypoint = true
    }
}
