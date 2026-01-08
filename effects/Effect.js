/**
 * Base class for environmental effects in encounters (clouds, trails, etc.).
 * @class Effect
 */
class Effect {
    /**
     * @param {EffectType} effectType - The type of effect.
     * @param {number} x - The x-coordinate of the effect's center or start point.
     * @param {number} y - The y-coordinate of the effect's center or start point.
     * @param {number|null} toX - The x-coordinate of the effect's end point (for line/trail effects).
     * @param {number|null} toY - The y-coordinate of the effect's end point (for line/trail effects).
     */
    constructor(effectType = EFFECT_TYPES_ALL[0], x = 0, y = 0, toX = null, toY = null) {
        /** @type {EffectType} */
        this.effectType = effectType;
        /** @type {number} */
        this.x = x;
        /** @type {number} */
        this.y = y;
        /** @type {number|null} */
        this.toX = toX;
        /** @type {number|null} */
        this.toY = toY;
        /** @type {Path|null} */
        this.path = (toX !== null && toY !== null) ? new Path(x, y, toX, toY) : null;
        /** @type {number} */
        this.angle = this.path ? this.path.angle : rng(Math.PI * 2, 0, false);
        /** @type {number} */
        this.radius = rng(effectType.maxSize, effectType.minSize, true);
        /** @type {number|null} */
        this.remainingTurns = rng(effectType.maxDuration, effectType.minDuration, true);
        /** @type {number|null} */
        this.duration = this.remainingTurns
        /** @type {number} */
        this.initialRadius = this.radius
        /** @type {string} */
        this.uuid = generateUUID('effect_');
    }

    containsPoint(x = 0, y = 0) {
        // Handle different effect shapes
        if (this.effectType.shape === SHAPES.FilledOval) {
            // For ovals, create an ellipse with minor axis = radius/2
            const ellipse = new Ellipse(this.x, this.y, this.radius, this.radius * 0.5, this.angle)
            return ellipse.containsPoint(x, y)
        } 
        else if (this.effectType.shape === SHAPES.FilledRectangle) {
            const centerX = (this.toX + this.x) / 2
            const centerY = (this.toY + this.y) / 2
            const rectangle = new Rectangle(centerX, centerY, this.path.distance, this.radius, this.angle)
            return rectangle.containsPoint(x, y)
        }
        else {
            // Default circular check for other shapes
            const dist = calcDistance(this.x, this.y, x, y)
            return dist <= this.radius
        }
    }

    hitShip(encounter, ship ) {
        // Override in subclass
        return []
    }

    onTurnEnd() {
        if (this.remainingTurns == null || this.duration == null) return //some clouds can be permanent
        this.remainingTurns -= 1
        this.radius = this.initialRadius * (0.25 + 0.75 * (this.remainingTurns / this.duration))
    }
}