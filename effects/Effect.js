class Effect {
    constructor(effectType = EFFECT_TYPES_ALL[0], x = 0, y = 0, toX = null, toY = null) {
        this.effectType = effectType;
        this.x = x;
        this.y = y;
        this.toX = toX;
        this.toY = toY;
        this.path = (toX !== null && toY !== null) ? new Path(x, y, toX, toY) : null;
        this.angle = this.path ? this.path.angle : rng(Math.PI * 2, 0, false);
        this.radius = rng(effectType.maxSize, effectType.minSize, true);
        this.remainingTurns = rng(effectType.maxDuration, effectType.minDuration, true);
        this.duration = this.remainingTurns
        this.initialRadius = this.radius
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

    hitShip(encounter = new Encounter(), ship = new Ship()) {
        // Override in subclass
    }

    onTurnEnd() {
        if (this.remainingTurns == null || this.duration == null) return //some clouds can be permanent
        this.remainingTurns -= 1
        this.radius = this.initialRadius * (0.25 + 0.75 * (this.remainingTurns / this.duration))
    }
}