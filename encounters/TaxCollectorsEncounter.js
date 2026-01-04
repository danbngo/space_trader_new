/**
 * @class TaxCollectorsEncounter
 * @extends {NeutralsEncounter}
 */
class TaxCollectorsEncounter extends NeutralsEncounter {
    onStart() {
        // Check if player's nearest planet matches tax collector's origin
        const [playerNearestPlanet] = gs.system.calcNearestPlanet(gs.fleet)
        const taxCollectorPlanet = this.fleet.fleetAI?.origin
        
        // Only collect taxes if near the tax collector's jurisdiction planet
        if (!taxCollectorPlanet || playerNearestPlanet !== taxCollectorPlanet) {
            showModal(
                coloredName(this.fleet), 
                'A government tax collection fleet scans your identification. "You are outside our jurisdiction. Safe travels."', 
                [['Continue', ()=>this.endEncounter()]]
            )
            return
        }
        
        // Calculate tax amount
        const taxAmount = Math.max(100, Math.floor(gs.credits * ENCOUNTER_MAX_TAX_RATIO))
        const playerCredits = gs.credits
        
        let msg = `A government tax collection fleet from ${coloredName(taxCollectorPlanet)} hails you.<br/>`
        msg += `"Greetings. Our records show you owe ${taxAmount}CR in system taxes. Please remit payment immediately."`
        
        if (playerCredits === 0) {
            // No credits at all - send away with scorn
            const brokeDialogue = this.getPlayerBrokeDialogue()
            const dialogueMsg = brokeDialogue ? `"${brokeDialogue}"<br/><br/>` : ''
            showModal(
                coloredName(this.fleet),
                msg + '<br/><br/>You inform them you have no credits.<br/><br/>' + dialogueMsg + '"Pathetic. You\'re not even worth the paperwork. Move along, pauper."',
                [['Continue', ()=>this.endEncounter()]]
            )
        } else if (playerCredits < 100) {
            // Can't afford minimum - take what they can
            const actualTax = playerCredits
            gs.credits = 0
            
            showModal(
                coloredName(this.fleet),
                msg + `<br/><br/>You only have ${actualTax}CR.<br/><br/>"Insufficient, but we'll take what you have. Consider this a warning - keep your finances in order!"<br/><br/>You lost ${actualTax}CR.`,
                [['Continue', ()=>this.endEncounter()]]
            )
        } else if (playerCredits < taxAmount) {
            // Can afford something, but not full amount
            const actualTax = playerCredits
            
            showModal(
                coloredName(this.fleet),
                msg + `<br/><br/>You only have ${actualTax}CR, which is less than the required amount.`,
                [
                    ['Pay All', ()=>{
                        gs.credits = 0
                        showModal(
                            'Tax Paid',
                            `You hand over all ${actualTax}CR.<br/><br/>"This doesn't cover the full amount, but we'll note your compliance. Don't let it happen again."`,
                            [['Continue', ()=>this.endEncounter()]]
                        )
                    }],
                    ['Resist', ()=>this.startCombat()]
                ]
            )
        } else {
            // Can afford full tax
            showModal(
                coloredName(this.fleet),
                msg,
                [
                    ['Pay Tax', ()=>{
                        gs.credits -= taxAmount
                        showModal(
                            'Tax Paid',
                            `You transfer ${taxAmount}CR to the tax collectors.<br/><br/>"Payment received. Your account is current. Proceed."`,
                            [['Continue', ()=>this.endEncounter()]]
                        )
                    }],
                    ['Resist', ()=>this.startCombat()]
                ]
            )
        }
    }
}
