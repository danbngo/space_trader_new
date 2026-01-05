/**
 * @class MissionariesEncounter
 * @extends {NeutralsEncounter}
 */
class MissionariesEncounter extends NeutralsEncounter {
    onStart() {
        // Check if already met
        if (this.hasAlreadyVisitedPlayer()) {
            this.showAlreadyMetMessage()
            return
        }
        
        if (FameLevel.hasInfamyLevel(gs.captain, this.planet, INFAMY_LEVELS.VILIFIED)) {
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} have heard of your fearsome deeds and start fleeing immediately!`, [
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackModal()],
            ])
            return
        }

        const playerReligion = gs.captain.religion
        const missionaryReligion = this.planet?.c?.stateReligion

        // Check if player is infamous with their religion
        const isInfamousWithReligion = missionaryReligion && 
            gs.captain.reputation.getAmount(missionaryReligion) < INFAMY_LEVELS.DISREPUTABLE.minReputation

        // If player is of the same religion, 25% chance for benediction
        if (playerReligion === missionaryReligion && Math.random() < 0.25) {
            this.offerBenediction()
            return
        }

        // If player is not of their faith and not infamous with their religion, 25% chance for blessing/conversion
        if (playerReligion !== missionaryReligion && !isInfamousWithReligion && Math.random() < 0.25) {
            this.offerBlessing()
            return
        }

        // Otherwise, standard greeting
        this.showStandardGreeting()
    }

    offerBenediction() {
        const greeting = this.getGreetingDialogue()
        const religionName = colorSpan(this.planet.c.stateReligion.name, this.planet.c.stateReligion.color)

        let message = greeting ? `"${greeting}"<br/><br/>` : ''
        message += `The ${coloredName(this.fleet)} recognize you as a fellow believer in ${religionName}!<br/><br/>`
        message += `"Brother/Sister, we sense you have faced hardship. Let us offer you the sacred rite of benediction - `
        message += `a divine blessing that will restore your vessels and strengthen your shields beyond their normal capacity!"`

        showModal(coloredName(this.fleet), message, [
            ['Accept Benediction', () => {
                // Restore all hull to full
                for (const ship of gs.fleet.ships) {
                    ship.hull[0] = ship.hull[1]
                }

                // Raise shields to 1.25x max
                for (const ship of gs.fleet.ships) {
                    ship.shields[0] = Math.floor(ship.shields[1] * 1.25)
                }

                let resultMessage = `The missionaries perform an elaborate ceremony, blessing each of your ships.<br/><br/>`
                resultMessage += `A warm, golden light envelops your fleet. You feel renewed strength flowing through your vessels!<br/><br/>`
                resultMessage += `<span style="color: #66ff66">✓ All hull restored to maximum!</span><br/>`
                resultMessage += `<span style="color: #6666ff">✓ All shields increased to 125% capacity!</span><br/><br/>`
                resultMessage += `"May ${this.planet.c.stateReligion.name} protect you on your journey, faithful one!"`

                showModal('Benediction Received', resultMessage, [
                    ['Continue', () => this.endEncounter()]
                ])
            }],
            ['Decline', () => this.showStandardGreeting()],
            ['Attack', () => this.showPlayerAttackModal()],
        ])
    }

    offerBlessing() {
        const greeting = this.getGreetingDialogue()
        const religionName = colorSpan(this.planet.c.stateReligion.name, this.planet.c.stateReligion.color)
        const playerCurrentReligion = gs.captain.religion

        let message = greeting ? `"${greeting}"<br/><br/>` : ''
        message += `The ${coloredName(this.fleet)} missionaries approach with fervent enthusiasm:<br/><br/>`
        message += `"We bring word of ${religionName}! We sense great potential in you. `
        message += `Accept our blessing and join our faith - we will grant you a sacred boon that will aid you on your journey!"`
        
        if (playerCurrentReligion) {
            message += `<br/><br/><span style="color: #ff6666">Warning: Converting will make you infamous with your current religion (${colorSpan(playerCurrentReligion.name, playerCurrentReligion.color)})</span>`
        }

        showModal(coloredName(this.fleet), message, [
            ['Accept Blessing', () => {
                // Grant random perk
                const availablePerks = PERK_TYPES_ALL.filter(p => 
                    !gs.captain.perks.includes(p) && gs.captain.level >= p.minLevel
                )

                if (availablePerks.length === 0) {
                    showModal('No Perks Available', 
                        `The missionaries perform the blessing ceremony, but you have already achieved all perks available to you at your current level.<br/><br/>"The divine has already blessed you greatly, it seems!"`, 
                        [['Continue', () => this.endEncounter()]]
                    )
                    return
                }

                const grantedPerk = rndMember(availablePerks)
                gs.captain.perks.push(grantedPerk)

                // Make player infamous with their current religion (unless agnostic/null)
                const oldReligion = gs.captain.religion
                if (oldReligion) {
                    const infamyAmount = INFAMY_LEVELS.DISREPUTABLE.minReputation - 10
                    gs.captain.reputation.setAmount(oldReligion, infamyAmount)
                }

                // Convert to new religion
                gs.captain.religion = this.planet.c.stateReligion

                let resultMessage = `The missionaries perform an elaborate conversion ceremony. You feel a profound spiritual awakening!<br/><br/>`
                resultMessage += `<span style="color: #ffff66">✓ Granted ${colorSpan(grantedPerk.name, grantedPerk.color)}!</span><br/>`
                resultMessage += `<i>${grantedPerk.description}</i><br/><br/>`
                resultMessage += `<span style="color: #66ff66">You have converted to ${religionName}!</span><br/>`

                if (oldReligion) {
                    resultMessage += `<br/><span style="color: #ff6666">You are now infamous with ${colorSpan(oldReligion.name, oldReligion.color)}</span>`
                }

                resultMessage += `<br/><br/>"Welcome to the faith, brother/sister! May you spread the word on your travels!"`

                showModal('Blessing Received', resultMessage, [
                    ['Continue', () => this.endEncounter()]
                ])
            }],
            ['Decline', () => this.showStandardGreeting()],
            ['Attack', () => this.showPlayerAttackModal()],
        ])
    }

    showStandardGreeting() {
        const greeting = this.getGreetingDialogue()
        showModal(coloredName(this.fleet), `"${greeting}"`, [
            ['Greet them', ()=>this.endEncounter()],
            ['Ignore', ()=>this.endEncounter()],
            ['Attack', ()=>this.showPlayerAttackModal()],
        ])
    }

    getGreetingDialogue() {
        const religion = this.planet?.c?.stateReligion
        
        // Check reputation with the religion, not the planet
        let dialogue
        if (religion) {
            const reputation = gs.captain.reputation.getAmount(religion)
            
            if (reputation >= FAME_LEVELS.ADMIRED.minReputation) {
                dialogue = rndMember(DIALOGUE_MISSIONARIES_FAMOUS)
            }
            else if (reputation <= INFAMY_LEVELS.DISREPUTABLE.minReputation) {
                dialogue = rndMember(DIALOGUE_MISSIONARIES_INFAMOUS)
            }
            else {
                dialogue = rndMember(DIALOGUE_MISSIONARIES_GREETING)
            }
        }
        else {
            dialogue = rndMember(DIALOGUE_MISSIONARIES_GREETING)
        }
        
        // Invoke dialogue if it's a function, otherwise return as string
        return typeof dialogue === 'function' ? dialogue() : dialogue
    }

    onVictory() {
        super.onVictory()
        // Attacking missionaries damages your reputation with their religion significantly
        if (this.planet && this.planet.c && this.planet.c.stateReligion) {
            const religion = this.planet.c.stateReligion
            const reputationLoss = -50
            gs.captain.reputation.increment(religion, reputationLoss)
        }
    }
}
