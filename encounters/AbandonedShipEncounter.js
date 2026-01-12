class AbandonedShipEncounter extends Encounter {
    
    /**
     * Override rollUndetected to prevent player from being undetected
     * (doesn't make sense to sneak up on an abandoned ship)
     */
    rollUndetected() {
        // For abandoned ships, never set player as undetected
        this.undetectedFleet = null
        this.playerUndetected = false
        this.enemyUndetected = false
        
        // Disable the abandoned ship fleet (it's derelict)
        if (this.fleet) {
            for (const ship of this.fleet.ships) {
                ship.hull[0] = 0
            }
        }
    }
    
    /**
     * Override onStart to show abandoned ship investigation modal
     */
    onStart() {
        super.onStart()
        if (this.playerUndetected) {
            return
        }
        
        let msg = `Your sensors detect a derelict vessel ahead!<br/><br/>`
        msg += `The ship appears to be drifting without power.<br/>`
        msg += `Your scanners can't detect any life signs aboard.<br/>`
        msg += `It could contain salvageable cargo... or it could be a trap.<br/>`
        
        showModal('Abandoned Ship', msg, [
            ['Investigate', () => this.investigateShip()],
            ['Leave', () => this.endEncounter()]
        ], '', null, 0)
    }

    /**
     * Player investigates the abandoned ship
     */
    investigateShip() {
        const isPirateTrap = Math.random() > 0.5
        
        if (isPirateTrap) {
            // It's a pirate ambush!
            this.springPirateTrap()
        } else {
            // Legitimate salvage opportunity
            this.showSalvageOpportunity()
        }
    }

    /**
     * Pirates spring their trap
     */
    springPirateTrap() {
        let msg = `As you approach, the "derelict" vessel suddenly powers up!<br/>`
        msg += `<span style="color: rgb(${COLORS.Red.join(',')})">It's a trap!</span><br/><br/>`
        msg += `Multiple pirate ships decloak around you!<br/>`
        msg += `They've been lying in wait!<br/>`
        
        showModal('Ambush!', msg, [['Continue', () => {
            // Generate pirate encounter
            const encounterType = ENCOUNTER_TYPES.PIRATES
            const encounterPlanet = this.planet
            const pirateFleet = generateFleet(encounterType.fleetType, encounterPlanet)
            
            // Create new pirate encounter with them undetected
            const pirateEncounter = new PiratesEncounter(encounterType, encounterPlanet, pirateFleet)
            pirateEncounter.undetectedFleet = pirateFleet
            pirateEncounter.enemyUndetected = true
            pirateEncounter.playerUndetected = false
            pirateEncounter.alwaysAttack = true // Pirates always attack from trap
            
            // Copy player ship hull values from original encounter
            pirateEncounter.playerShipHullsAtStart = new Map(this.playerShipHullsAtStart)
            
            // Replace current encounter with pirate encounter
            gs.encounter = pirateEncounter
            
            // Notify TravelMap to clean up old encounter ships and reset config
            if (currentMap && currentMap.resetNPCShipsConfig) {
                currentMap.resetNPCShipsConfig()
            }
            if (currentMap && currentMap.cleanupRemovedShips) {
                currentMap.cleanupRemovedShips()
            }
            
            // Start the pirate encounter
            pirateEncounter.onStart()
        }]], '', null, 0)
    }

    /**
     * Show salvage opportunity with loot
     */
    showSalvageOpportunity() {
        // Generate random loot based on salvage skill
        const baseLootAmt = rng(20, 5)
        const maxLootAmt = rng(50, baseLootAmt)
        const lootAmt = Math.floor(weightedAvg([baseLootAmt, maxLootAmt], [25, gs.fleet.totalSkills.getAmount(SKILLS.Salvage)]))
        
        // Generate loot from random cargo types
        const loot = new CountsMap()
        const availableCargoTypes = CARGO_TYPES_ALL.filter(ct => !ct.illegal) // No illegal cargo in abandoned ships
        
        for (let i = 0; i < lootAmt; i++) {
            const ct = rndMember(availableCargoTypes)
            loot.increment(ct, 1)
        }
        
        let msg = `You board the abandoned vessel.<br/>`
        msg += `The crew seems to have evacuated in a hurry...<br/><br/>`
        msg += `Your scanners reveal ${baseLootAmt} units of cargo in the hold.<br/>`
        if (lootAmt > baseLootAmt) {
            msg += `Your salvaging skills allow you to recover an additional ${lootAmt - baseLootAmt} units of cargo.<br/>`
        }
        
        showModal('Salvage', msg, [
            lootAmt > 0 ? ['Loot', () => showLootMenu(loot)] : ['Continue', () => this.endEncounter()]
        ], '', null, 0)
    }

    /**
     * Abandoned ships don't fight back
     */
    onVictory() {
        this.endEncounter()
    }

    onDefeat() {
        this.endEncounter()
    }

    onEscape() {
        this.endEncounter()
    }
}
