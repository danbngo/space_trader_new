/**
 * Base class for AI that controls NPC fleet behavior in the solar system.
 * @class FleetAI
 */
class FleetAI {
    /**
     * @param {Fleet} fleet - The fleet controlled by this AI.
     * @param {SpaceObject} home - The planet this fleet originated from.
     */
    constructor(fleet = null, home = null) {
        /** @type {Fleet} */
        this.fleet = fleet;
        /** @type {SpaceObject} */
        this.home = home;
        /** @type {SpaceObject} */
        this.destination = this.calcDestination();
        if (!this.destination) throw new Error('fleetAI must have a destination!!')
        /** @type {any} */
        this.target = null
        this.voyageYearsRemaining = Infinity
        this.resetVoyageDuration()
        if (!Number.isFinite(this.voyageYearsRemaining)) throw new Error('fleetAI must have a finite voyage duration!!')
        //console.log('created fleet AI with props:', {fleet: this.fleet, home: this.home, destination: this.destination, voyageYearsRemaining: this.voyageYearsRemaining})
    }
    /**
     * Updates AI behavior each game tick.
     */
    tick(elapsedYears = 1) {
        this.voyageYearsRemaining -= elapsedYears;
        if (this.isNearHome(elapsedYears)) {
            this.onNearHome()
            return
        }
        else if (this.isNearDestination(elapsedYears)) {
            this.onNearDestination();
            return
        }
        else if (this.isNearTarget(elapsedYears)) {
            this.onNearTarget();
            return
        }
        else if (this.voyageYearsRemaining > 0) {
            //ships that pursue other ships will continuously check for closer targets
            if (!this.target || Number.isFinite(this.fleet.fleetType.targetMaxDistance)) { 
                if (Math.random() < .9) return
                const validTargets = this.calcValidTargets()
                const target = this.findNearest(validTargets, this.fleet.fleetType.targetMaxDistance || Infinity);
                if (target && target !== this.target) {
                    this.setTarget(target);
                    return
                }
            }
        }
        if (!this.fleet.route) {
            this.resumeVoyage()
        }
    }
    /** @returns {Fleet[]|SpaceObject[]} */
    calcValidTargets() {        
        //override in subclasses
        return []
    }
    /** @returns {SpaceObject|null} */
    calcDestination() {
        return rndMember(gs.system.planets.filter(p=>(p !== this.home)))
    }

    resetVoyageDuration() {
        this.voyageYearsRemaining = this.fleet.fleetType.voyageYears;
    }

    setTarget(target) {
        this.target = target
        this.fleet.route = new Route(this.fleet, target)
    }

    /**
     * Checks if fleet has arrived at destination.
     * @returns {boolean}
     */
    isNearDestination(elapsedYears = 1) {
        return this.destination && this.isNearby(this.destination, elapsedYears)
    }

    isNearHome(elapsedYears = 1) {
        return this.isNearby(this.home, elapsedYears) && !this.destination
    }

    isNearTarget(elapsedYears = 1) {
        return this.target && this.isNearby(this.target, elapsedYears)
    }

    isNearby(object = new SpaceObject(), elapsedYears = 1) {
        const distMod = elapsedYears/MAX_FRAMES_PER_SECOND/STAR_MAP_YEARS_PER_MS
        return calcDistance(this.fleet.x, this.fleet.y, object.x, object.y) < (0.25*distMod) // Within 0.01 AU
    }

    resumeVoyage() {
        this.target = null
        if (Math.random() < .9) return; //ships will "hang out" for a while before moving on
        if (this.destination && this.fleet.location != this.destination) this.fleet.route = new Route(this.fleet, this.destination)
        else if (this.home && this.fleet.location != this.home) this.fleet.route = new Route(this.fleet, this.home)
    }

    /**
     * Called when fleet arrives at destination.
     */
    onNearHome() {
        console.log('🏠', `${this.fleet.name+' '+this.fleet.uuid} has returned home to ${this.home.name+' '+this.home.uuid}.`)
        this.route = null
        this.destination = null
        gs.system.removeFleet(this.fleet)
    }

    onNearDestination() {
        console.log('🛬', `${this.fleet.name+' '+this.fleet.uuid} has arrived at destination ${this.destination.name+' '+this.destination.uuid}.`)
        this.destination = null
        this.route = null
        this.resetVoyageDuration()
    }

    onNearTarget() {
        //override in subclass
    }

    fightTarget() {
        console.log('⚔️', `${this.fleet.name+' '+this.fleet.uuid} is engaging ${this.target.name+' '+this.target.uuid}!`)
        //chance to win is based on our fleet combat scores
        const ourScore = this.fleet.combatRating
        const theirScore = this.target.combatRating
        const totalScore = ourScore + theirScore
        const roll = rng(totalScore, 1)
        if (roll <= ourScore) {
            // We won - calculate damage to our fleet based on their strength
            const strengthRatio = theirScore / ourScore // How strong they were relative to us
            const baseDamage = strengthRatio * 0.3 // Base damage 0-30% based on strength ratio
            const randomVariance = Math.random() * 0.2 // Add 0-20% random variance
            const damagePercent = Math.min(0.8, baseDamage + randomVariance) // Cap at 80% damage
            
            // Apply damage to our ships
            for (const ship of this.fleet.ships) {
                const damage = ship.hull[1] * damagePercent
                ship.hull[0] = Math.max(0, ship.hull[0] - damage)
            }
            
            // Winner takes cargo from loser
            this.transferCargo(this.target, this.fleet)
            gs.system.removeFleet(this.target)
            this.target = null
            this.route = null
            return true
        }
        else {
            // They won - calculate damage to their fleet
            const strengthRatio = ourScore / theirScore
            const baseDamage = strengthRatio * 0.3
            const randomVariance = Math.random() * 0.2
            const damagePercent = Math.min(0.8, baseDamage + randomVariance)
            
            // Apply damage to their ships
            for (const ship of this.target.ships) {
                const damage = ship.hull[1] * damagePercent
                ship.hull[0] = Math.max(0, ship.hull[0] - damage)
            }
            
            // Loser's cargo is taken by winner
            this.transferCargo(this.fleet, this.target)
            gs.system.removeFleet(this.fleet)
            return false
        }
    }

    /**
     * Transfer cargo from one fleet to another (up to available space)
     * @param {Fleet} fromFleet - Fleet to take cargo from
     * @param {Fleet} toFleet - Fleet to transfer cargo to
     */
    transferCargo(fromFleet, toFleet) {
        if (!fromFleet.cargo || fromFleet.cargo.total === 0) return;
        
        const availableSpace = toFleet.availableCargoSpace;
        if (availableSpace <= 0) return;
        
        // Transfer cargo up to available space
        const cargoTypes = fromFleet.cargo.counts.keys();
        let transferred = 0;
        
        for (const cargoType of cargoTypes) {
            if (transferred >= availableSpace) break;
            
            const amount = fromFleet.cargo.getAmount(cargoType);
            const toTransfer = Math.min(amount, availableSpace - transferred);
            
            fromFleet.cargo.increment(cargoType, -toTransfer);
            toFleet.cargo.increment(cargoType, toTransfer);
            transferred += toTransfer;
        }
        
        if (transferred > 0) {
            //console.log(`💰 ${toFleet.name+' '+toFleet.uuid} seized ${transferred} units of cargo from ${fromFleet.name+' '+fromFleet.uuid}`);
        }
    }
    /**
     * Finds nearest object of a given type.
     * @param {SpaceObject[]} objects - Array of space objects to search.
     * @param {number} maxDistance - Maximum distance in AU.
     * @returns {SpaceObject|null}
     */
    findNearest(objects = [], maxDistance = Infinity) {
        if (!this.fleet || objects.length == 0) return null;
        
        let nearest = null;
        let nearestDist = maxDistance;
        
        for (const obj of objects) {
            const dx = obj.x - this.fleet.x;
            const dy = obj.y - this.fleet.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < nearestDist) {
                nearest = obj;
                nearestDist = dist;
            }
        }
        return nearest;
    }
}
