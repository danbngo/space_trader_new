class NeutralsEncounter extends FleetEncounter {
    /**
     * Called when the player is victorious.
     * @override
     */
    onVictory() {
        this.showPlayerDefeatedEnemyModal()
    }

    /**
     * Called when the player is defeated.
     * @override
     */
    onDefeat() {
        this.showPlayerDefeatedByNeutralsModal(1)
    }

    /**
     * Called when the player escapes.
     * @override
     */
    onEscape() {
        this.showPlayerEscapedFromEnemyModal()
    }

    /**
     * Called when the player surrenders.
     * @override
     */
    onSurrender() {
        this.onDefeat()
    }

    showPlayerDefeatedByNeutralsModal( infamyLossMultiplier = 1) {
        console.log('showPlayerDefeatedByNeutralsModal', { infamyLossMultiplier });
        const {enemyFleet, disabledPlayerShips} = this
        const planet = this.planet
        const faction = this.fleet.factionType
        const reputationShrink = Math.ceil(ENCOUNTER_BASE_REPUTATION_SHRINK_ON_DEFEAT)

        const victoriousDialogue = this.getVictoriousDialogue()

        let msg = ''
        if (victoriousDialogue) {
            msg += `"${victoriousDialogue}"<br/>`
        }
        msg += `The ${coloredName(enemyFleet)} seem shocked to have defeated you.<br/>`
        msg += `They quickly depart the scene in case there are other attackers nearby.<br/>`

        if (reputationShrink) {
            if (planet) msg += gs.captain.grantReputation(planet, gs.captain.reputation.getAmount(planet) > 0 ? -reputationShrink : reputationShrink)
            if (faction) msg += gs.captain.grantReputation(faction, gs.captain.reputation.getAmount(faction) > 0 ? -reputationShrink : reputationShrink)
        }
        if (disabledPlayerShips.length > 0) {
            msg += `${disabledPlayerShips.length} of your ships were disabled in the fighting.<br/>`
            msg += this.loseCargoFromDisabledShips(disabledPlayerShips)
        }

        msg += this.conductRepairs()

        showModal(this.encounterType.name, msg, [['Continue', ()=>this.endEncounter()]])
    }

    showNeutralsBribePlayerModal(maxCredits = 1000, infamyModifier = 0) {
        const baseCredits = Math.ceil(maxCredits*Math.random()/2)
        const credits = Math.round(weightedAvg([baseCredits, maxCredits], [25, gs.fleet.totalSkills.getAmount(SKILLS.Barter)]))
        const officersShare = gs.fleet.calcTotalCRShare(credits, true)
        const finalCredits = credits - officersShare
        const isInfamous = infamyModifier > Math.random()

        let msg = ''
        if (isInfamous) {
            msg = `The ${coloredName(this.fleet)} recognize your notorious reputation and hastily offer you ${credits}CR, desperately hoping to avoid your wrath!<br/>`
        } else {
            msg = `The ${coloredName(this.fleet)} frantically offers you ${credits}CR to let them go unharmed!<br/>`
        }
        if (credits > baseCredits) msg += `You employ your haggling skills and make them an offer they can't refuse.<br/>Their offer increases to ${credits}CR.<br/>`
        
        showModal(coloredName(this.fleet), msg, [
            ['Accept Bribe', ()=>{
                gs.credits += finalCredits
                const acceptMsg = isInfamous
                    ? `You accept the tribute of ${finalCredits}CR${officersShare ? ` (-${officersShare}CR for officers)` : ''}.<br/>The ${coloredName(this.fleet)} flee in terror, grateful to have escaped with their lives.<br/>`
                    : `You accept the tribute of ${finalCredits}CR${officersShare ? ` (-${officersShare}CR for officers)` : ''}.<br/>The ${coloredName(this.fleet)} anxiously departs before you can change your mind.<br/>`
                showModal(coloredName(this.fleet), acceptMsg, [['Continue', ()=>this.endEncounter()]])
            }],
            ['Refuse', ()=>{
                showModal(coloredName(this.fleet), `You scornfully refuse the tribute!<br/>The ${coloredName(this.fleet)} readies for combat!<br/>`, [['Continue', ()=>this.startCombat(false)]])
            }]
        ])
    }

    showPlayerAttackNeutralsModal() {
        this.showPlayerAttackFleetModal(()=>{
                let combatAdvantage = gs.fleet.combatRating / gs.encounter.fleet.combatRating
                //combat advantage should vary from 0.5 its original amount to 2x based on the player's infamy
                combatAdvantage *= 2 - (75/(50 + Math.abs(Math.min(0, gs.captain.calcReputationForTarget(gs.encounter.fleet.planet))))) //approaches 2x as reputation becomes more negative
                if (combatAdvantage * Math.random() > 1.5) {
                    this.showNeutralsBribePlayerModal(gs.encounter.fleet.captain.credits)
                }
                else {
                    this.startCombat(true)
                }
            }
        )
    }
}