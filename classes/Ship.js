
// Ship class
class Ship {
    constructor(name = "Unnamed", graphics = new Graphics('triangle', 'white', SPACE_SHIP_SIZE_IN_EARTH_RADII), hull = [0, 0], shields = [0, 0], lasers = 0, thrusters = 0, cargoSpace = 0) {
        this.name = name;
        this.graphics = graphics;
        this.hull = hull;
        this.shields = shields;
        this.lasers = lasers;
        this.thrusters = thrusters;
        this.cargoSpace = cargoSpace;
        this.x = 0; //used for encounters, only fleets travel in systems
        this.y = 0;
        this.destinationX = 0;
        this.destinationY = 0;
        this.angle = Math.PI*2; //direction ship is facing in. it can only accelerate/decelerate and shoot in that direction
        this.speedX = 0; //ships have momentum!
        this.speedY = 0;
        this.target = null; //ship that this one's trying to attack
        this.firingTimeRemaining = null; //ships shoot in a stream
        this.currentLaser = 0;
        this.combatStrategy = COMBAT_STRATEGIES[0];
        this.autoCombat = true;
        this.laserRechargeProgress = 0;
        this.shieldRechargeProgress = 0;
        this.accelerating = false;
        this.turning = false;
        this.beingHit = false;
    }

    get mass() {
        return this.hull[1]/5 + this.shields[1]/5 + this.lasers + this.thrusters + this.cargoSpace
    }

    get value() {
        return Math.pow(this.mass, 2)*10
    }

    resetCombatVars() {
        this.destinationX = undefined;
        this.destinationY = undefined;
        this.angle = Math.PI*2;
        this.speedX = 0;
        this.speedY = 0;
        this.target = null;
        this.firingTimeRemaining = null; 
        this.currentLaser = 0;
        this.combatStrategy = COMBAT_STRATEGIES_ALL[0];
        this.autoCombat = true;
        this.shieldRechargeProgress = 0;
        this.laserRechargeProgress = 0;
        this.resetCombatVarsTurn()
    }

    resetCombatVarsTurn() {
        this.accelerating = false;
        this.turning = false;
        this.beingHit = false;
    }

    setDisabled() {
        this.hull[0] = 0
        const recordedAngle = this.angle
        this.resetCombatVars()
        this.angle = recordedAngle
    }

    isDisabled() {
        return this.hull[0] <= 0
    }

    //in AU per years. during combat etc. baggage train is left behind.
    calcSpeed() {
        //in SPACE, each thruster makes your fleet go 1 AU per MINUTE if there was no weight
        //in COMBAT, same value = 1,549,263.45  IN  miles per second
        if (this.isDisabled()) return 0
        const mod = 1549263
        let thrusters = this.thrusters * mod * ENCOUNTER_THRUSTER_PENALTY
        return thrusters / this.mass
    }

    calcAngleDeg() {
        return radiansToDegrees(this.angle)
    }

    accelerate(elapsedSeconds = 1, decel = false) {
        if (this.isDisabled()) return
        this.accelerating = true
        const speed = this.calcSpeed()
        const force = speed*elapsedSeconds
        const forceDims = rotatePoint(force,0,0,0,this.angle)
        this.speedX += (decel ? -1 : 1) * forceDims[0]
        this.speedY += (decel ? -1 : 1) * forceDims[1]
    }

    turn(elapsedSeconds = 1, counterClockwise = false) {
        if (this.isDisabled()) return
        this.turning = true
        const speed = this.calcSpeed()
        const force = speed*elapsedSeconds/TIME_TO_TURN_SHIP_WITH_ONE_THRUSTER_IN_SECONDS
        const turnRatio = force * (counterClockwise ? -1 : 1)
        this.angle += turnRatio*Math.PI*2
    }

    canFireAt(target = new Ship()) {
        if (this.isDisabled()) return false
        if (!target) return false
        if (this.firingTimeRemaining) return false
        if (this.laserRechargeProgress < 1) return false
        const angleToTarget = new Path(this.x, this.y, target.x, target.y).angle
        let dAngle = angleToTarget - this.angle;
        // Normalize angle difference to the range (-PI, PI]
        dAngle = Math.atan2(Math.sin(dAngle), Math.cos(dAngle)); 
        if (Math.abs(dAngle) > Math.PI/2) return false //have to shoot in front of you
        return true
    }

    fire(target = this.target) {
        console.log('ship attempting to fire:',this,target,this.firingTimeRemaining,this.laserRechargeProgress)
        if (!this.canFireAt(target)) return
        this.laserRechargeProgress = 0
        this.firingTimeRemaining = TIME_TO_SHOOT_LASER_IN_SECONDS
        console.log('ship firing:',this,this.firingTimeRemaining)
    }
    
    checkDoneFiring(elapsedSeconds = 1) {
        if (!this.firingTimeRemaining) return
        const firingProgress = elapsedSeconds*Math.random()
        this.firingTimeRemaining = this.firingTimeRemaining - firingProgress
        if (this.firingTimeRemaining <= 0) {
            console.log('done firing! applying damage')
            const dmg = rng(this.lasers, 1)
            this.target.takeDamage(dmg)
            this.firingTimeRemaining = null
        }
    }

    takeDamage(dmg = 0) {
        if (this.isDisabled()) return
        this.beingHit = true
        if (this.shields[0] > 0) {
            this.shields[0] = Math.max(0, this.shields[0] - dmg)
            return
        }
        this.hull[0] = Math.max(0, this.hull[0] - dmg)
        if (this.hull[0] <= 0) this.setDisabled()
    }

    rechargeShields(elapsedSeconds = 1) {
        if (this.isDisabled()) return
        if (this.accelerating) return
        if (this.shields[0] >= this.shields[1]) return
        const rechargeProgress = elapsedSeconds/TIME_TO_RECHARGE_SHIELDS_IN_SECONDS * Math.random()
        this.shieldRechargeProgress += rechargeProgress
        const shieldChargedAmt = Math.floor(this.shieldRechargeProgress)
        if (shieldChargedAmt <= 0) return
        this.shieldRechargeProgress -= shieldChargedAmt
        this.shields[0] = Math.max(this.shields[1], this.shields[0]+this.shieldChargedAmt)
    }

    rechargeLaser(elapsedSeconds = 1) {
        if (this.isDisabled()) return
        if (this.firingTimeRemaining) return
        if (this.laserRechargeProgress >= 1) return
        const rechargeProgress = elapsedSeconds/TIME_TO_RECHARGE_LASER_IN_SECONDS * Math.random()
        this.laserRechargeProgress = Math.min(1, this.laserRechargeProgress+rechargeProgress)
        //console.log('new laser recharge progress:',this.laserRechargeProgress)
    }
}