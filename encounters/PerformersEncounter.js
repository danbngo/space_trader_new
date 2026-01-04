/**
 * @class PerformersEncounter
 * @extends {NeutralsEncounter}
 */
class PerformersEncounter extends NeutralsEncounter {
    onStart() {
        const rand = Math.random()
        
        // 50% chance to offer entertainment
        if (rand < 0.5) {
            this.offerEntertainment()
        } else {
            // 50% chance just greet and pass
            showModal(coloredName(this.fleet), 'A troupe of performers hails you. "Greetings, traveler! We bring art and entertainment to the far reaches of space. Perhaps our paths will cross again at a more opportune time!"', [
                ['Greet them', ()=>this.endEncounter()],
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.startCombat()],
            ])
        }
    }

    offerEntertainment() {
        const entranceFee = rng(500, 100)
        const canAfford = gs.credits >= entranceFee
        
        let message = `A troupe of ${coloredName(this.fleet)} hails you with excitement:<br/><br/>`
        message += `"Greetings, traveler! We're hosting a grand show aboard our ships! For just ${entranceFee} CR, you can join us for an unforgettable experience!"<br/><br/>`
        message += `The entertainment will take some time...`
        
        showModal(coloredName(this.fleet), message, [
            ['Accept', () => {
                gs.credits -= entranceFee
                this.showEntertainmentOptions()
            }, !canAfford],
            ['Decline', () => {
                showModal('Maybe Next Time',
                    `"Ah, perhaps another time! Safe travels, friend!"`,
                    [['Continue', () => this.endEncounter()]]
                )
            }],
        ])
    }

    showEntertainmentOptions() {
        // Go straight to performance
        this.watchPerformance()
    }

    watchPerformance() {
        // Advance time
        gs.year += rng(0.01, 0.005, false) // A few days
        
        let message = `You spend hours mesmerized by the troupe's incredible performance. Acrobats defy gravity, musicians weave haunting melodies, and holographic illusions blur reality.<br/><br/>`
        
        const rewards = []
        const roll = Math.random()
        
        // 10% chance for skill point
        if (roll < 0.1) {
            const randomSkill = rndMember(SKILLS_ALL)
            gs.captain.skills.increment(randomSkill, 1)
            rewards.push(`You learned something from the performance! ${colorSpan(`+1 ${randomSkill.name}`, COLORS.Green)}`)
        }
        // 1% chance for full skill level
        else if (roll < 0.11) {
            const randomSkill = rndMember(SKILLS_ALL)
            const currentLevel = gs.captain.skills.getAmount(randomSkill)
            const pointsNeeded = (currentLevel + 1) * SKILL_POINTS_PER_LEVEL
            gs.captain.skills.raiseTo(randomSkill, pointsNeeded)
            rewards.push(`The performance inspired you! ${colorSpan(`Gained a level in ${randomSkill.name}!`, COLORS.Green)}`)
        }
        // 0.1% chance for perk point
        else if (roll < 0.111) {
            gs.captain.numPerkPoints += 1
            rewards.push(`The experience was transcendent! ${colorSpan(`+1 Perk Point`, COLORS.Purple)}`)
        }
        
        if (rewards.length === 0) {
            message += `The performance was entertaining, but you gained no lasting benefit.`
        } else {
            message += rewards.join('<br/>')
        }
        
        // 25% chance performers are swindlers
        if (Math.random() < 0.25) {
            message += this.swindleCargo()
        }
        
        showModal('Performance Complete', message, [
            ['Continue', () => this.endEncounter()]
        ])
    }

    playCircusGames() {
        // Advance time
        gs.year += rng(0.01, 0.005, false) // A few days
        
        let message = `You participate in various games of chance and skill. The atmosphere is electric with cheers and groans from other contestants.<br/><br/>`
        
        const wager = Math.round(gs.credits * rng(0.3, 0.1))
        const roll = Math.random()
        
        // Less than 50% chance to win (45%)
        if (roll < 0.45) {
            const winnings = Math.round(wager * rng(2.5, 1.5))
            gs.credits += winnings
            message += `${colorSpan(`You won ${winnings} CR!`, COLORS.Green)} Lady luck was on your side!<br/><br/>`
        }
        // More than 50% chance to lose (53%)
        else if (roll < 0.98) {
            const loss = Math.min(gs.credits, wager)
            gs.credits -= loss
            message += `${colorSpan(`You lost ${loss} CR.`, COLORS.Red)} Better luck next time!<br/><br/>`
        }
        // 2% chance for grand prize
        else {
            const prizeRoll = Math.random()
            let prize
            
            if (prizeRoll < 0.33) {
                // High quality ship module
                const moduleType = rndMember(SHIP_MODULE_TYPES_ALL)
                const quality = rng(2.5, 1.5, false) * (this.planet.c?.technology || 1)
                const module = new ShipModule(moduleType, quality)
                
                // Store in settlement shipyard if docked
                if (gs.fleet.location && gs.fleet.location.settlement && gs.fleet.location.settlement.shipyard) {
                    gs.fleet.location.settlement.shipyard.modules.push(module)
                    message += `${colorSpan(`🎉 GRAND PRIZE! You won a ${moduleType.name}! (Added to shipyard)`, COLORS.Purple)}<br/><br/>`
                } else {
                    message += `${colorSpan(`🎉 GRAND PRIZE! You won a ${moduleType.name}! (But you can't store it without docking...)`, COLORS.Orange)}<br/><br/>`
                }
            }
            else if (prizeRoll < 0.66) {
                // High quality ship
                const ship = generateShip(this.planet, rndMember(SHIP_TYPES_ALL))
                ship.hull[0] = ship.hull[1]
                ship.shields[0] = ship.shields[1]
                gs.fleet.addShip(ship)
                message += `${colorSpan(`🎉 GRAND PRIZE! You won a ${ship.shipType.name}!`, COLORS.Purple)}<br/><br/>`
            }
            else {
                // High quality equipment
                prize = equipmentGenerator(this.planet)
                prize.quality = rng(2.5, 1.5, false) * (this.planet.c?.technology || 1)
                gs.fleet.equipment.push(prize)
                message += `${colorSpan(`🎉 GRAND PRIZE! You won ${prize.name}!`, COLORS.Purple)}<br/><br/>`
            }
        }
        
        // 25% chance performers are swindlers
        if (Math.random() < 0.25) {
            message += this.swindleCargo()
        }
        
        showModal('Games Complete', message, [
            ['Continue', () => this.endEncounter()]
        ])
    }

    swindleCargo() {
        const cargoAmount = gs.fleet.cargo.total
        if (cargoAmount === 0) {
            return ''
        }
        
        const stolenPercent = rng(0.5, 0.25, false) // 25-50%
        const stolenAmount = Math.ceil(cargoAmount * stolenPercent)
        
        // Remove random cargo
        const stolenCargo = gs.fleet.cargo.randomSubset(stolenAmount)
        gs.fleet.cargo.subtractAmounts(stolenCargo)
        
        return `<br/><br/>${colorSpan(`⚠️ While you were distracted, the performers helped themselves to ${stolenAmount} units of your cargo!`, COLORS.Red)}`
    }
}
