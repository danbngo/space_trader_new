
/**
 * @fileoverview Slavers encounter implementation.
 * @module encounters/SlaversEncounter
 */

/**
 * Represents a Slavers encounter.
 * Slavers are hostile criminals who capture and enslave crews.
 * If the player is defeated or surrenders, some of their officers will be captured.
 * @class SlaversEncounter
 * @extends FleetEncounter
 */
class SlaversEncounter extends FleetEncounter {
    /**
     * Called when the encounter starts.
     * Slavers check for stealth, then react based on reputation.
     * @override
     */
    onStart() {
        console.log('SlaversEncounter.onStart')
        const {enemyFleet} = this

        if (Math.random()*gs.captain.reputation.getAmount(FACTION_TYPES.SLAVERS) > 250) {
            // Friendly - they let you pass
            showModal('Recognized', `The ${coloredName(enemyFleet)} recognize you as an ally.<br/>They signal that you may pass freely.`,
            [
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackFleetModal()],
            ])
        }
        else if (gs.captain.reputation.getAmount(FACTION_TYPES.SLAVERS) > 0) {
            // Neutral - offer trade opportunities
            this.showNeutralSlavers()
        }
        else {
            // Hostile - demand surrender
            showModal('Demand Surrender', `The ${coloredName(enemyFleet)} hail you.<br/>Your ships and crew belong to us now. Surrender immediately or be destroyed!`,
                [
                    ['Surrender', ()=>this.showPlayerDidSurrenderModal()],
                    ['Refuse', ()=>closeModal()],
                ])
        }
    }

    showNeutralSlavers() {
        // 50% chance to offer to buy a subordinate if player has any
        if (Math.random() < 0.5 && gs.fleet.subordinates.length > 0) {
            this.offerToBuySubordinate()
            return
        }
        
        // Otherwise just ignore
        showModal('Ignored', `The ${coloredName(this.fleet)} note your presence but choose to ignore you.`,
            ['Continue', ()=>this.endEncounter()]
        )
    }

    offerToBuySubordinate() {
        // Pick random subordinate
        const subordinate = rndMember(gs.fleet.subordinates)
        const price = Math.round(subordinate.value * 0.5) // Half the officer's value
        
        let message = `The ${coloredName(this.fleet)} hail you with an offer:<br/><br/>`
        message += `"We're always looking for new... recruits. We'll take that ${subordinate.name} off your hands for ${price} CR. No questions asked."<br/><br/>`
        message += `<b>${subordinate.name}</b> - Level ${subordinate.level}<br/>`
        message += `<b>Value:</b> ${subordinate.value} CR<br/>`
        message += `<b>Offer:</b> ${price} CR (${Math.round(price / subordinate.value * 100)}% of value)`
        
        showModal(coloredName(this.fleet), message, [
            ['Sell', () => {
                gs.credits += price
                gs.fleet.officers = gs.fleet.officers.filter(o => o !== subordinate)
                
                // Add bounty with crew member's planet (selling crew = crime)
                const bountyAmount = Math.ceil(subordinate.value * 0.5)
                let resultMsg = `You receive ${price} CR as the ${coloredName(this.fleet)} take ${subordinate.name}.<br/><br/>` +
                    `"Pleasure doing business with you. We'll put them to good use."<br/><br/>` +
                    colorSpan(`${subordinate.name} has been sold to the slavers.`, COLORS.Red)
                
                if (subordinate.planet) {
                    gs.captain.grantBounty(subordinate.planet, bountyAmount)
                    resultMsg += `<br/><br/>` + colorSpan(`Bounty on ${subordinate.planet.name}: +${bountyAmount} CR`, COLORS.Red)
                }
                
                showModal('Officer Sold', resultMsg, [['Continue', () => this.endEncounter()]])
            }],
            ['Refuse', () => {
                showModal('Offer Declined',
                    `"Suit yourself. But the offer stands if you change your mind."`,
                    [['Continue', () => this.endEncounter()]]
                )
            }],
        ])
    }

    offerToSellOfficer() {
        // Generate officer from random faction
        const randomFaction = rndMember(FACTION_TYPES_ALL)
        const officer = generateOfficer(this.planet, randomFaction)
        
        // Price is officer value (slavers don't discount much)
        const price = officer.value
        const canAfford = gs.credits >= price
        const canHire = gs.fleet.officers.length < gs.captain.maxSubordinates
        
        let message = `The ${coloredName(this.fleet)} hail you with an offer:<br/><br/>`
        message += `"We have some... merchandise that might interest you. Fresh acquisition, willing to work. ${price} CR and they're yours."<br/><br/>`
        message += `<b>${officer.name}</b> - Level ${officer.level}<br/>`
        message += `<b>Faction:</b> ${colorSpan(officer.factionType.name, officer.factionType.color)}<br/>`
        message += `<b>Skills:</b> ${SKILLS_ALL.map(sk => `${sk.symbol}${officer.skills.getAmount(sk)}`).join(' ')}<br/>`
        message += `<b>CR Share:</b> ${Math.round(officer.crShare * 100)}%`
        
        showModal(coloredName(this.fleet), message, [
            ['Buy', () => {
                gs.credits -= price
                gs.fleet.addOfficer(officer)
                showModal('Officer Acquired',
                    `You transfer ${price} CR.<br/><br/>` +
                    `"Good. They're all yours now. Try not to lose them too quickly."<br/><br/>` +
                    `${officer.name} has joined your crew!`,
                    [['Continue', () => this.endEncounter()]]
                )
            }, !canAfford || !canHire],
            ['Decline', () => {
                showModal('Offer Declined',
                    `"Your loss. We'll find another buyer."`,
                    [['Continue', () => this.endEncounter()]]
                )
            }],
        ])
    }

    /**
     * Called when the player is defeated.
     * Slavers capture some of the player's officers.
     * @override
     */
    onDefeat() {
        console.log('SlaversEncounter.onDefeat')
        this.showPlayerDefeatedBySlaversModal()
    }

    /**
     * Called when the player surrenders.
     * Slavers capture some of the player's officers.
     * @override
     */
    onSurrender() {
        console.log('SlaversEncounter.onSurrender')
        this.showPlayerDefeatedBySlaversModal()
    }

    /**
     * Called when the player is victorious.
     * @override
     */
    onVictory() {
        console.log('SlaversEncounter.onVictory')
        this.showPlayerDefeatedEnemyModal()
    }

    /**
     * Called when the player escapes.
     * @override
     */
    onEscape() {
        console.log('SlaversEncounter.onEscape')
        this.showPlayerEscapedFromEnemyModal()
    }

    /**
     * Called at the end of each turn.
     * @override
     */
    onEndTurn() {
        // Default behavior
    }

    showPlayerDefeatedBySlaversModal() {
        console.log('showPlayerDefeatedBySlaversModal');
        const {enemyFleet, fleet, disabledPlayerShips} = this
        let msg = `Unfortunately, you were no match for the ${coloredName(enemyFleet)}.<br/>`

        if (disabledPlayerShips.length > 0) {
            msg += `${disabledPlayerShips.length} of your ships were disabled in the fighting.<br/>`
            msg += this.loseCargoFromDisabledShips(disabledPlayerShips)
        }

        msg += `Now that the fighting is over, the ${coloredName(enemyFleet)} eagerly board your ships.<br/>`
        
        // Take cargo
        const lootableCargoAmount = gs.fleet.cargo.total
        if (lootableCargoAmount <= 0) {
            msg += 'They are disgusted to find nothing worth looting!<br/>'
        }
        else {
            const canLootAmount = fleet.availableCargoSpace
            if (canLootAmount <= 0) {
                msg += 'They are embarrassed to find their cargo bays are too full to hold any more loot.<br/>'
            }
            else {
                const maxLootAmount = Math.min(canLootAmount, lootableCargoAmount)
                const lootAmount = rng(maxLootAmount * ENCOUNTER_MAX_LOSE_CARGO_RATIO, maxLootAmount * ENCOUNTER_MAX_LOSE_CARGO_RATIO / 2)
                msg += `They take ${lootAmount} units of loot from your cargo bays.<br/>`
                const looted = fleet.cargo.randomSubset(lootAmount)
                fleet.cargo.subtractAmounts(looted)
            }
        }
        
        // Take credits
        if (gs.credits <= 10) {
            msg += `They note with contempt that you have ${gs.credits == 0 ? 'no' : 'barely any'} credits to steal!<br/>`
        }
        else {
            const creditsStolen = rng(gs.credits * ENCOUNTER_MAX_LOSE_CREDITS_RATIO, gs.credits * ENCOUNTER_MAX_LOSE_CREDITS_RATIO / 2, true)
            msg += `They take ${creditsStolen} credits from you.<br/>`
            gs.credits -= creditsStolen
        }

        // Capture officers
        const officerCount = gs.fleet.officers.length
        if (officerCount > 0) {
            const officersToCaptureCount = Math.max(1, Math.round(officerCount * rng(ENCOUNTER_MAX_LOSE_OFFICERS_RATIO, ENCOUNTER_MAX_LOSE_OFFICERS_RATIO * 0.66)))
            const capturedOfficers = []
            
            // Remove random officers
            for (let i = 0; i < officersToCaptureCount; i++) {
                if (gs.fleet.officers.length > 0) {
                    const randomIndex = Math.floor(Math.random() * gs.fleet.officers.length)
                    const officer = gs.fleet.officers.splice(randomIndex, 1)[0]
                    capturedOfficers.push(officer)
                }
            }
            
            if (capturedOfficers.length > 0) {
                msg += ''+colorSpan(`The slavers capture ${capturedOfficers.length} of your officers!<br/>`, COLORS.Red)
                for (const officer of capturedOfficers) {
                    msg += `${officer.name} was taken into slavery.<br/>`
                }
            }
        }

        msg += this.conductRepairs()
        
        showModal(coloredName(enemyFleet), msg, [['Continue', ()=>this.endEncounter()]])
    }
}
