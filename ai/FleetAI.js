/**
 * Base class for AI that controls NPC fleet behavior in the solar system.
 * @class FleetAI
 */
class FleetAI {
    /**
     * @param {Fleet} fleet - The fleet controlled by this AI.
     * @param {SpaceObject} origin - The planet this fleet originated from.
     * @param {StarMap} starMap - Optional reference to the StarMap for displaying popups.
     */
    constructor(fleet = null, origin = null, starMap = null) {
        /** @type {Fleet} */
        this.fleet = fleet;
        /** @type {SpaceObject} */
        this.origin = origin;
        /** @type {StarMap|null} */
        this.starMap = starMap;
        /** @type {SpaceObject|Waypoint|null} */
        this.destination = null
        /** @type {any} */
        this.target = null
        this.voyageYearsRemaining = rng(2,0.5,false)*this.fleet.fleetType.voyageYears
        /** @type {SpaceObject[]} */
        this.visited = []
        if (!Number.isFinite(this.voyageYearsRemaining)) throw new Error('fleetAI must have a finite voyage duration!!')
        //console.log('created fleet AI with props:', {fleet: this.fleet, home: this.home, destination: this.destination, voyageYearsRemaining: this.voyageYearsRemaining})
        /*if (!this.destination) {
            console.log('Warning: Could not find a valid destination for fleet type, going to remove it immediately')
            this.origin = null
            this.destination = null
            this.target = null
            this.voyageYearsRemaining - -Infinity
            gs.system.destroyFleet(this.fleet)
        }*/
    }

    addPopup(text = '', color = COLORS.WHITE, overrideX = this.fleet.x, overrideY = this.fleet.y) {
        if (!this.starMap || !this.starMap.addPopup) return
        this.starMap.addPopup(overrideX, overrideY, text, color)
    }
    
    /**
     * Checks if a route's path would intersect with the sun.
     * @param {Route} route - The route to check
     * @returns {boolean} True if the route intersects the sun, false otherwise
     */
    static checkRouteIntersectsSun(route) {
        if (!route || !route.valid || !route.path) return false
        if (!gs.system.stars || gs.system.stars.length === 0) return false
        
        const sun = gs.system.stars[0]
        const sunCircle = new Circle(sun.x, sun.y, sun.radius/SOLAR_RADII_PER_AU)
        
        // If the ship is already inside the sun, allow it to escape
        const startInsideSun = sunCircle.containsPoint(route.path.startX, route.path.startY)
        if (startInsideSun) {
            return false // Allow escape routes
        }
        
        return sunCircle.intersectsLine(route.path.startX, route.path.startY, route.path.toX, route.path.toY)
    }
    /**
     * Updates AI behavior each game tick.
     */
    tick(elapsedYears = 1) {
        this.voyageYearsRemaining -= elapsedYears;
        if (this.isNearOrigin(elapsedYears)) {
            this.onNearOrigin()
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
                if (Math.random() < .9) return //wait around a bit to avoid "turning jitter"
                const validTargets = this.calcValidTargets()
                const target = this.findNearest(validTargets, this.fleet.fleetType.targetMaxDistance || Infinity);
                if (target && target !== this.target) {
                    // Show interest popup when finding a new target
                    console.log(`🔍 ${this.fleet.name} ${this.fleet.uuid} found new target: ${target.name} ${target.uuid} and could target:`)
                    const canTarget = this.setTarget(target);
                    /*if (!canTarget) {
                        this.visited.push(target) //give up if we cant reach the target
                    }*/
                    if (canTarget) this.addPopup('!', COLORS.DarkYellow)
                }
            }
        }
        if (!this.fleet.route) {
            this.resumeVoyage()
        }
        else {
           //was some route refresh logic here but it was causing problems
        }
        if (this.fleet.factionType.cloaked) {
            this.fleet.cloakLevel = Math.min(1.0, this.fleet.cloakLevel + (CLOAK_REGEN_RATE * elapsedYears));
        }
    }

    checkAsteroidHits() {
        if (!gs.system.asteroids || gs.system.asteroids.length === 0) return
        
        // Check for nearby asteroids
        for (const asteroid of gs.system.asteroids) {
            const distance = calcDistance(this.fleet.x, this.fleet.y, asteroid.x, asteroid.y)
            
            if (distance < FLEET_COLLISION_DISTANCE) {
                // Small chance to be hit by asteroid (10% per check)
                if (Math.random() < 0.1) {
                    // Apply damage to a random ship in the fleet
                    const activeShips = this.fleet.ships.filter(s => !s.disabled)
                    if (activeShips.length === 0) return
                    
                    const hitShip = rndMember(activeShips)
                    const damage = rng(asteroid.radius * 10, asteroid.radius * 2) // Damage based on asteroid size
                    hitShip.takeDamage(damage, true) // Bypass shields
                    
                    console.log(`☄️ ${this.fleet.name} was struck by asteroid near ${asteroid.parent?.name || 'space'}! ${damage.toFixed(1)} damage to ${hitShip.name}`)
                    this.addPopup('☄️', COLORS.Orange)
                    
                    // Check if entire fleet is disabled
                    const allShipsDisabled = this.fleet.ships.every(ship => ship.disabled)
                    if (allShipsDisabled) {
                        console.log(`💥 ${this.fleet.name} was destroyed by asteroid collision!`)
                        this.addPopup('💥', COLORS.Red)
                        this.onDestroyed()
                        return
                    }
                }
            }
        }
    }

    /** @returns {Fleet[]|SpaceObject[]} */
    calcValidTargets() {        
        //override in subclasses
        return []
    }
    /** @returns {SpaceObject|Waypoint|null} */
    calcDestination() {
        return rndMember(gs.system.planets.filter(p=>(p !== this.origin)))
    }

    /*resetVoyageDuration() {
        this.voyageYearsRemaining = this.fleet.fleetType.voyageYears;
    }*/

    setTarget(target) {
        const route = new Route(this.fleet, target)
        if (route.valid) {
            // Check if route path intersects with the sun
            if (FleetAI.checkRouteIntersectsSun(route)) {
                return false
            }
            
            this.fleet.startRoute(route)
            this.target = target
            return true
        }
        return false
    }

    /**
     * Checks if fleet has arrived at destination.
     * @returns {boolean}
     */
    isNearDestination(elapsedYears = 1) {
        return this.destination && this.isNearby(this.destination, elapsedYears)
    }

    isNearOrigin(elapsedYears = 1) {
        return this.isNearby(this.origin, elapsedYears) && !this.destination && this.voyageYearsRemaining <= 0
    }

    isNearTarget(elapsedYears = 1) {
        return this.target && this.isNearby(this.target, elapsedYears)
    }

    /**
     * 
     * @param {SpaceObject|Waypoint} object 
     * @param {number} elapsedYears 
     * @returns 
     */
    isNearby(object, elapsedYears = 1) {
        // @ts-ignore
        if (object.location) return false
        const distMod = elapsedYears/MAX_FRAMES_PER_SECOND/STAR_MAP_YEARS_PER_MS //during simus make ships able to collide easier
        return calcDistance(this.fleet.x, this.fleet.y, object.x, object.y) < (FLEET_COLLISION_DISTANCE*distMod) // Within 0.01 AU
    }

    resumeVoyage() {
        if (Math.random() < .9) return; //ships will "hang out" for a while before moving on
        console.log('▶', `${this.fleet.name+' '+this.fleet.uuid} is resuming its voyage.`)
        this.target = null
        
        // Try destination first
        if (this.destination && this.fleet.location != this.destination) {
            const route = new Route(this.fleet, this.destination)
            if (!FleetAI.checkRouteIntersectsSun(route)) {
                this.fleet.startRoute(route)
                return
            } else {
                console.log('⚠️', `${this.fleet.name} cannot resume voyage to destination - path intersects sun`)
            }
        }
        const newDestination = this.calcDestination()
        if (newDestination) {
            const route = new Route(this.fleet, newDestination)
            if (!FleetAI.checkRouteIntersectsSun(route)) {
                this.destination = newDestination
                this.fleet.startRoute(route)
                return
            } else {
                console.log('⚠️', `${this.fleet.name} cannot set new destination - path intersects sun`)
            }
        }

        // Try origin as fallback
        if (this.origin && this.fleet.location != this.origin) {
            const route = new Route(this.fleet, this.origin)
            if (!FleetAI.checkRouteIntersectsSun(route)) {
                this.fleet.startRoute(route)
                this.destination = this.origin
                return
            } else {
                console.log('⚠️', `${this.fleet.name} cannot return home - path intersects sun`)
            }
        }
    }

    /**
     * Called when fleet arrives at destination.
     */
    onNearOrigin() {
        console.log('🏠', `${this.fleet.name+' '+this.fleet.uuid} has returned home to ${this.origin.name+' '+this.origin.uuid}.`)
        gs.system.destroyFleet(this.fleet)
    }

    onNearDestination() {
        console.log('🛬', `${this.fleet.name+' '+this.fleet.uuid} has arrived at destination ${this.destination.name}.`)
        this.destination = null
        
        // If we still have voyageYears remaining, find a new destination
        if (this.voyageYearsRemaining > 0) {
            this.resumeVoyage()
            console.log('🔄', `${this.fleet.name+' '+this.fleet.uuid} has ${this.voyageYearsRemaining.toFixed(2)} years remaining in its voyage after reaching a destination!`)
        }
        //this.resetVoyageDuration()
    }

    onNearTarget() {
        //override in subclass
    }

    fightTarget(andLoot = false) {
        if (!this.target || !(this.target instanceof Fleet) || (!this.target.fleetAI && this.target !== gs.fleet)) {
            console.log(this,this.target,this.fleet)
            throw new Error('FleetAI.fightTarget called with invalid target!');
        }
        
        // If target is the player fleet, trigger an encounter instead
        if (this.target === gs.fleet) {
            console.log('⚔️', `${this.fleet.name+' '+this.fleet.uuid} is engaging player fleet - starting encounter!`)
            const encounter = generateEncounterForFleet(this.fleet)
            encounter.startEncounter()
            return
        }
        
        console.log('⚔️', `${this.fleet.name+' '+this.fleet.uuid} is engaging ${this.target.name+' '+this.target.uuid}!`)
        
    // Show popup if starMap is available
        this.addPopup('⚔️', COLORS.Red)
        this.addPopup('⚔️', COLORS.Red, this.target.x, this.target.y)
        
        // Reveal both fleets during combat
        this.fleet.cloakLevel = 0
        this.target.cloakLevel = 0
        //chance to win is based on our fleet combat scores
        const ourScore = this.fleet.combatRating
        const theirScore = this.target.combatRating
        const totalScore = ourScore + theirScore
        const roll = rng(totalScore, 1)
        const loser = (roll <= ourScore) ? this.target : this.fleet
        const winner = (roll <= ourScore) ? this.fleet : this.target
        const winnerScore = (roll <= ourScore) ? ourScore : theirScore
        const loserScore = (roll <= ourScore) ? theirScore : ourScore

        const strengthRatio = (loserScore / winnerScore) / (winnerScore+loserScore) // How strong they were relative to us
        // Apply damage to both sides
        for (const ship of winner.ships) {
            const damage = rng(ship.hull[1]*strengthRatio)
            ship.takeDamage(damage,true)
        }
        for (const ship of loser.ships) {
            const damage = rng(ship.hull[1]*1/strengthRatio)
            ship.takeDamage(damage,true)
        }
        
        // Check if loser still has any active ships after damage
        const loserHasActiveShips = loser.ships.some(ship => ship.hull[0] > 0)
        
        // 30% chance for loser to flee if they still have active ships
        if (loserHasActiveShips && Math.random() < 0.3) {
            // Loser flees - no loot, both sides took damage
            console.log('💨', `${loser.name+' '+loser.uuid} has fled from ${winner.name+' '+winner.uuid}!`)
            this.addPopup('💨', COLORS.Yellow, loser.x, loser.y)
            
            // Clear targets for both fleets
            loser.fleetAI.target = null
            loser.fleetAI.fleet.route = null
            winner.fleetAI.target = null
            winner.fleetAI.fleet.route = null
            
            
            return winner
        }
        
        // Loser is destroyed

        loser.fleetAI.onDestroyed()
        winner.fleetAI.target = null
        console.log('🏆', `${winner.name+' '+winner.uuid} has defeated ${loser.name+' '+loser.uuid} in combat!`)

        if (andLoot) {
            // Winner takes cargo from loser
            winner.fleetAI.transferCargo(loser, winner)
            winner.fleetAI.transferCredits(loser, winner)
        }

        return winner
    }

    onDestroyed() {
        // Disable all ships in the fleet
        for (const ship of this.fleet.ships) {
            ship.hull[0] = 0
        }
        
        this.addPopup('💀', COLORS.Red, this.fleet.x, this.fleet.y)
        
        // Random crew survival (0-100%, average 50%)
        const crewSurvivalRate = Math.random()
        if (crewSurvivalRate < 0.5) {
            // Remove all officers except captain
            this.fleet.officers = this.fleet.officers.filter(o => o === this.fleet.captain)
            // Remove captain too
            if (this.fleet.captain) {
                this.fleet.removeOfficer(this.fleet.captain)
            }
            console.log(`☠️ ${this.fleet.name} crew did not survive the destruction`)
        } else {
            console.log(`🆘 ${this.fleet.name} crew survived in escape pods`)
        }
        
        // Random cargo destruction (0-100%, average 50%)
        if (this.fleet.cargo && this.fleet.cargo.total > 0) {
            const cargoDestructionRate = Math.random()
            const cargoTypes = [...this.fleet.cargo.counts.keys()]
            let totalDestroyed = 0
            
            for (const cargoType of cargoTypes) {
                const amount = this.fleet.cargo.getAmount(cargoType)
                const destroyed = Math.floor(amount * cargoDestructionRate)
                if (destroyed > 0) {
                    this.fleet.cargo.increment(cargoType, -destroyed)
                    totalDestroyed += destroyed
                }
            }
            
            if (totalDestroyed > 0) {
                console.log(`📦 ${this.fleet.name} lost ${totalDestroyed} cargo units (${Math.round(cargoDestructionRate * 100)}% destroyed)`)
            }
        }
        
        // Create abandoned fleet before removing from active fleets
        const abandonedFleet = new AbandonedFleet(this.fleet)
        abandonedFleet.name = 'Wreckage' // Obscure identifying information
        gs.system.abandonedFleets.push(abandonedFleet)
        console.log(`🔧 ${this.fleet.name} added to abandoned fleets at (${this.fleet.x.toFixed(2)}, ${this.fleet.y.toFixed(2)})`)
        
        gs.system.destroyFleet(this.fleet)
    }

    /**
     * Transfer cargo from one fleet to another (up to available space)
     * @param {Fleet} fromFleet - Fleet to take cargo from
     * @param {Fleet} toFleet - Fleet to transfer cargo to
     */
    transferCargo(fromFleet, toFleet) {
        console.log(`💰 ${toFleet.name+' '+toFleet.uuid} seizing of cargo from ${fromFleet.name+' '+fromFleet.uuid}`);
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
            
            // Show theft popup at the location where cargo is being taken
            this.addPopup('💰', COLORS.LightYellow, toFleet.x, toFleet.y)
            //show another popup to show that target is LOSING money
            this.addPopup('💸', COLORS.DarkYellow, fromFleet.x, fromFleet.y)
        }
    }

    /**
     * Transfer credits from one fleet's captain to another
     * @param {Fleet} fromFleet - Fleet to take credits from
     * @param {Fleet} toFleet - Fleet to transfer credits to
     */
    transferCredits(fromFleet, toFleet) {
        if (!fromFleet.captain || !toFleet.captain) return;
        
        const creditsToTake = fromFleet.captain.credits;
        if (creditsToTake <= 0) return;
        
        fromFleet.captain.credits = 0;
        toFleet.captain.credits += creditsToTake;
        
        console.log(`💵 ${toFleet.name+' '+toFleet.uuid} took ${creditsToTake} credits from ${fromFleet.name+' '+fromFleet.uuid}`);
        
        // Show credits transfer popup
        this.addPopup('💵', COLORS.Green, toFleet.x, toFleet.y)
        this.addPopup('💸', COLORS.DarkYellow, fromFleet.x, fromFleet.y)
    }

    /**
     * Transfer officers (excluding captain) from one fleet to another
     * @param {Fleet|AbandonedFleet} fromFleet - Fleet to take officers from
     * @param {Fleet} toFleet - Fleet to transfer officers to
     * @param {string} emoji - Emoji to display for capture action (default 👥)
     * @param {number[]} color - Color for capture popup (default Orange)
     * @param {string} fromEmoji - Emoji to display at source fleet (default 💔)
     * @param {number[]} fromColor - Color for source popup (default DarkRed)
     */
    transferOfficers(fromFleet, toFleet, emoji = '👥', color = COLORS.Orange, fromEmoji = '💔', fromColor = COLORS.DarkRed) {
        if (!fromFleet.captain || !toFleet.captain) return;
        
        const officersToTake = fromFleet.officers.slice(); // Copy array
        if (officersToTake.length === 0) return;
        
        // Remove all subordinates from source fleet
        for (const officer of officersToTake) {
            fromFleet.removeOfficer(officer);
            toFleet.officers.push(officer); //no need.
        }
        
        console.log(`${emoji} ${toFleet.name+' '+toFleet.uuid} captured ${officersToTake.length} officers from ${fromFleet.name+' '+fromFleet.uuid}`);
        
        // Show crew capture popup
            this.addPopup(emoji, color, toFleet.x, toFleet.y)
            this.addPopup(fromEmoji, fromColor, fromFleet.x, fromFleet.y)
    }

    /**
     * Unload all cargo from fleet to a planet's market
     * @param {Planet} planet - Planet with market to unload to
     * @param {boolean} boostEconomy - Whether to boost the planet's economy (default true)
     */
    /**
     * Sell all cargo at a planet's market for credits
     * @param {Planet} planet - Planet with market to sell at
     * @returns {number} Total credits earned from sale
     */
    sellCargoAtMarket(planet) {
        if (!planet || !planet.s || !planet.s.market) return 0;
        if (!this.fleet.cargo || this.fleet.cargo.total === 0) return 0;
        if (!this.fleet.captain) return 0;
        
        const market = planet.s.market;
        let totalValue = 0;
        let actualSaleValue = 0;
        
        // Calculate total value of cargo
        for (const [cargoType, amount] of this.fleet.cargo.counts.entries()) {
            totalValue += cargoType.value * amount;
        }
        
        // Check how much the market can actually afford to pay
        const marketCanAfford = market.credits || 0;
        actualSaleValue = Math.min(totalValue, marketCanAfford);
        
        if (actualSaleValue <= 0) {
            console.log(`💰 ${this.fleet.name} cannot sell cargo at ${planet.name} - market has no credits`);
            return 0;
        }
        
        // Calculate what fraction of cargo we can actually sell
        const sellFraction = actualSaleValue / totalValue;
        
        // Sell cargo proportionally based on what market can afford
        for (const [cargoType, amount] of this.fleet.cargo.counts.entries()) {
            const amountToSell = Math.ceil(amount * sellFraction);
            this.fleet.cargo.increment(cargoType, -amountToSell);
            market.cargo.increment(cargoType, amountToSell);
        }
        
        // Transfer credits: market pays captain
        market.credits -= actualSaleValue;
        this.fleet.captain.credits += actualSaleValue;
        
        console.log(`💰 ${this.fleet.name} sold cargo at ${planet.name} for ${actualSaleValue} credits`);
        this.addPopup('💵', COLORS.Green);
        
        // Boost economy when cargo is sold
        if (planet.civilization) {
            planet.c.economy *= 1.01;
        }
        
        return actualSaleValue;
    }

    /**
     * Buy cargo from a planet's market using fleet captain's credits
     * @param {Planet} planet - Planet with market to buy from
     * @param {boolean} illegalOnly - If true, only buy illegal cargo (for smugglers)
     * @returns {number} Total cargo units purchased
     */
    buyCargoFromMarket(planet, illegalOnly = false) {
        if (!planet || !planet.s || !planet.s.market) return 0;
        if (!this.fleet.captain) return 0;
        
        const market = planet.s.market;
        const availableSpace = this.fleet.availableCargoSpace;
        if (availableSpace <= 0) return 0;
        
        // Determine max cargo to purchase based on market availability and ratio
        const maxPurchaseAmount = Math.min(
            availableSpace,
            Math.ceil(market.cargo.total * NPC_FLEET_MAX_PURCHASE_CARGO_RATIO)
        );
        
        if (maxPurchaseAmount <= 0) return 0;
        
        // Filter cargo by illegal status if needed
        let availableCargo;
        if (illegalOnly) {
            availableCargo = new CountsMap();
            for (const [cargoType, amount] of market.cargo.counts.entries()) {
                if (cargoType.illegal) {
                    availableCargo.increment(cargoType, amount);
                }
            }
        } else {
            availableCargo = market.cargo;
        }
        
        if (availableCargo.total === 0) return 0;
        
        // Calculate what we can afford and fit
        let purchasedCount = 0;
        let totalCost = 0;
        const targetCargo = new CountsMap();
        
        // Try to buy cargo up to our limits (buying costs 50% of base value)
        const cargoSubset = availableCargo.randomSubset(maxPurchaseAmount);
        
        for (const [cargoType, amount] of cargoSubset.counts.entries()) {
            // Buying costs 50% of base value
            const costPerUnit = Math.ceil(cargoType.value * 0.5);
            const affordableAmount = Math.floor(this.fleet.captain.credits / costPerUnit);
            const marketHasAmount = market.cargo.getAmount(cargoType);
            const purchaseAmount = Math.min(amount, affordableAmount, marketHasAmount, availableSpace - purchasedCount);
            
            if (purchaseAmount > 0) {
                const cost = purchaseAmount * costPerUnit;
                targetCargo.increment(cargoType, purchaseAmount);
                totalCost += cost;
                purchasedCount += purchaseAmount;
            }
            
            if (purchasedCount >= availableSpace || this.fleet.captain.credits <= totalCost) break;
        }
        
        // Execute the purchase
        if (purchasedCount > 0 && this.fleet.captain.credits >= totalCost) {
            // Transfer credits: captain pays market
            this.fleet.captain.credits -= totalCost;
            market.credits += totalCost;
            
            // Transfer cargo: market to fleet
            for (const [cargoType, amount] of targetCargo.counts.entries()) {
                market.cargo.increment(cargoType, -amount);
                this.fleet.cargo.increment(cargoType, amount);
            }
            
            console.log(`💰 ${this.fleet.name} bought ${purchasedCount} cargo at ${planet.name} for ${totalCost} credits`);
            this.addPopup('📦', COLORS.Green);
        }
        
        return purchasedCount;
    }

    /**
     * Rescue all crew from an abandoned fleet
     * @param {AbandonedFleet} abandonedFleet - Abandoned fleet to rescue from
     * @param {string} emoji - Emoji to display for rescue action (default 🚁)
     * @param {number[]} color - Color for rescue popup (default Cyan)
     */
    rescueCrew(abandonedFleet, emoji = '🚁', color = COLORS.Cyan) {
        if (!(abandonedFleet instanceof AbandonedFleet)) return;
        if (abandonedFleet.officers.length === 0) return;
        
        const officersToRescue = [...abandonedFleet.officers];
        for (const officer of officersToRescue) {
            abandonedFleet.removeOfficer(officer);
            this.fleet.officers.push(officer);
        }
        
        console.log(`${emoji} ${this.fleet.name} rescued ${officersToRescue.length} survivors from ${abandonedFleet.name}`);
        this.addPopup(emoji, color, this.fleet.x, this.fleet.y);
        this.addPopup('✅', COLORS.Green, abandonedFleet.x, abandonedFleet.y);
    }

    /**
     * Make scientific/exploration discoveries and award relics
     * @param {string} targetName - Name of the target being investigated
     * @param {number} minRelics - Minimum relics to find (default 1)
     * @param {number} maxRelics - Maximum relics to find (default 3)
     * @param {string} emoji - Emoji to display (default ✨)
     * @param {number[]} color - Color for popup (default Green)
     * @returns {number} Number of relics found
     */
    makeDiscoveries(targetName, minRelics = 1, maxRelics = 3, emoji = '✨', color = COLORS.Green) {
        if (this.fleet.availableCargoSpace <= 0) {
            console.log(`${emoji} ${this.fleet.name} investigated ${targetName} but has no cargo space`);
            this.addPopup(emoji, COLORS.Gray);
            return 0;
        }
        
        const relicsFound = Math.min(rng(maxRelics, minRelics), this.fleet.availableCargoSpace);
        this.fleet.cargo.increment(CARGO_TYPES.RELICS, relicsFound);
        console.log(`${emoji} ${this.fleet.name} investigated ${targetName} and discovered ${relicsFound} relics`);
        this.addPopup(emoji, color);
        return relicsFound;
    }

    /**
     * Convert a target fleet's captain to our religion
     * @param {Fleet} targetFleet - Fleet whose captain to convert
     * @param {Religion} religion - Religion to convert to (defaults to our captain's religion)
     * @param {string} emoji - Emoji to display (default ✝️)
     * @param {number[]} color - Color for popup (default White)
     * @returns {boolean} True if conversion succeeded
     */
    convertToReligion(targetFleet, religion = null, emoji = '✝️', color = COLORS.White) {
        if (!targetFleet.captain) return false;
        if (!religion && this.fleet.captain) {
            religion = this.fleet.captain.religion;
        }
        if (!religion) return false;
        
        const oldReligion = targetFleet.captain.religion;
        targetFleet.captain.religion = religion;
        
        console.log(`${emoji} ${this.fleet.name} converted ${targetFleet.captain.name} from ${oldReligion?.name || 'no religion'} to ${religion.name}`);
        this.addPopup(emoji, color);
        
        return true;
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
            const dist = Math.sqrt(dx * dx + dy * dy) * (obj instanceof Fleet ? 1-obj.cloakLevel : 1);
            //cloaked ships are 10x harder to see
            const adjustedDist = obj instanceof Fleet ? dist*(10*obj.cloakLevel) : dist;
            
            if (dist < nearestDist) {
                nearest = obj;
                nearestDist = dist;
            }
        }
        return nearest;
    }
}
