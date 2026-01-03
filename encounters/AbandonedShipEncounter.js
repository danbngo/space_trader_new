/**
 * @class AbandonedShipEncounter
 * @extends {PiratesEncounter}
 */
class AbandonedShipEncounter extends PiratesEncounter {
    onStart() {
        const abandonedShip = this.fleet.ships[0]
        abandonedShip.takeDamage(Infinity, false, false, null)
        
        let msg = `You discover an abandoned ${abandonedShip.shipType.name}!<br/>`
        msg += `The ship appears to have been disabled and abandoned by its crew.<br/>`
        msg += `Your scanners detect cargo aboard. Do you want to investigate?<br/>`
        
        showModal('Abandoned Ship', msg, [
            ['Loot', ()=>this.attemptLoot()],
            ['Leave', ()=>this.endEncounter()]
        ])
    }

    attemptLoot() {
        // 50% chance of ambush (pirates or slavers)
        if (Math.random() < 0.5) {
            this.ambush()
        } else {
            this.successfulLoot()
        }
    }

    ambush() {
        // 50/50 chance of pirates or slavers
        const isPirates = Math.random() < 0.5
        const fleetType = isPirates ? FLEET_TYPES.PIRATES : FLEET_TYPES.SLAVERS
        const factionType = isPirates ? FACTION_TYPES.PIRATES : FACTION_TYPES.SLAVERS
        const ambushFleet = generateFleet(fleetType, factionType, this.planet)
        
        // Position enemy ships using PlayerEncircled formation (they surround the player)
        const maxSpawnDistance = this.mapRadius * ENCOUNTER_SHIP_MAX_SPAWN_DISTANCE_RATIO
        const angleStep = (Math.PI * 2) / ambushFleet.ships.length
        
        ambushFleet.ships.forEach((ship, i) => {
            ship.aiType = AI_TYPES.Ship
            
            // Position in circle around center (encircling player)
            const angle = angleStep * i
            const [x, y] = rotatePoint(maxSpawnDistance, 0, 0, 0, angle)
            Object.assign(ship, {x, y, color: this.encounterType.enemyColor})
            
            // Face towards center
            const targetAngle = new Path(ship.x, ship.y, 0, 0).angle
            ship.angle = targetAngle
            
            // Give every ship a cloak module and start cloaked
            ship.modules.push(new ShipModule(SHIP_MODULE_TYPES.CLOAK, 1))
            ship.statusEffects.setAmount(STATUS_EFFECTS.CLOAKED, 5)
            
            this.fleet.addShip(ship)
        })
        
        // Update encounter fleet captain to ambusher captain
        this.fleet.captain = ambushFleet.captain
        
        const ambusherName = isPirates ? 'Pirates' : 'Slavers'
        let msg = `It's a trap! ${ambusherName} decloak from all around you!<br/>`
        msg += `${ambushFleet.ships.length} ${ambusherName.toLowerCase()} ships appear and move to attack!<br/>`
        
        showModal(`${ambusherName} Ambush!`, msg, [
            ['Fight', ()=>this.startCombat(false)]
        ])
    }

    successfulLoot() {
        const abandonedShip = this.fleet.ships[0]
        
        // Calculate loot from the abandoned ship
        const cargoRatio = 1 // All cargo is available
        const maxLootAmt = Math.ceil(this.fleet.cargo.total * cargoRatio)
        const baseLootAmt = Math.ceil(Math.random() * maxLootAmt)
        const lootAmt = Math.floor(weightedAvg([baseLootAmt, maxLootAmt], [25, gs.fleet.totalSkills.getAmount(SKILLS.Salvage)]))
        const loot = this.fleet.cargo.randomSubset(lootAmt)
        
        // Calculate credits
        let creditsAmt = Math.ceil(Math.random() * this.fleet.captain.credits)
        const officersShare = gs.fleet.calcTotalCRShare(creditsAmt, true)
        const finalCredits = creditsAmt - officersShare
        
        let msg = `No signs of danger. You begin salvaging the abandoned ship.<br/>`
        
        if (baseLootAmt > 0) {
            msg += `Your scanners reveal ${baseLootAmt} units of cargo aboard.<br/>`
            if (lootAmt > baseLootAmt) msg += `Your salvaging skills allow you to recover an additional ${lootAmt - baseLootAmt} units of cargo.<br/>`
        } else {
            msg += `The ship's cargo hold is empty.<br/>`
        }
        
        if (finalCredits > 0) {
            gs.credits += finalCredits
            msg += `You also salvage ${finalCredits}CR from the ship${officersShare ? ` (-${officersShare}CR for officers)` : ''}.<br/>`
        }
        
        showModal('Abandoned Ship', msg, [
            lootAmt > 0 ? ['Loot', ()=>showLootMenu(loot)] : ['Continue', ()=>this.endEncounter()]
        ])
    }

    onVictory() {
        // After defeating pirates, allow looting both pirate ships and abandoned ship
        this.showPlayerDefeatedEnemyModal()
    }

    onDefeat() {
        this.showPlayerDefeatedByPiratesModal()
    }

    onEscape() {
        showModal('Abandoned Ship', 'You decide to leave the abandoned ship and continue on your way.', [
            ['Continue', ()=>this.endEncounter()]
        ])
    }

    onSurrender() {
        this.onDefeat()
    }
}
