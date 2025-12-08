class Projectile {
    constructor(color = 'white', radius = 1, x = 0, y = 0, speedX = 0, speedY = 0, angle = Math.PI*2, firedBy = new Ship()) {
        this.color = color
        this.radius = radius
        this.x = x
        this.y = y
        this.angle = angle
        this.speedX = speedX
        this.speedY = speedY
        this.firedBy = firedBy
        this.uuid = crypto.randomUUID();
    }
}