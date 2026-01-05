/**
 * @class ExplorersEncounter
 * @extends {MercantileEncounter}
 */
class ExplorersEncounter extends MercantileEncounter {
    onStart() {
        // Check if already met to prevent repeated anomaly sharing
        if (this.hasAlreadyVisitedPlayer()) {
            this.showAlreadyMetMessage()
            return
        }
        
        // 50% chance to offer anomaly information
        if (Math.random() > 0.5) {
            this.offerAnomalyInformation();
        } else if (Math.random() > 0.5) {
            // 50% chance to offer trade
            const fleetName = coloredName(this.fleet);
            showModal(fleetName, 'An exploration fleet hails you. "Greetings! We\'re always interested in trading supplies. Would you like to trade?"', [
                ['Trade', ()=>this.showTradeOfferModal(true)],
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.startCombat()],
            ]);
        } else {
            // Explorers greet the player
            showModal(coloredName(this.fleet), 'An exploration fleet hails you. "Greetings, traveler! We\'re charting the far reaches of the system. Safe travels out there!"', [
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.startCombat()],
            ])
        }
    }

    offerAnomalyInformation() {
        const fleetName = coloredName(this.fleet);
        const undiscoveredAnomalies = (gs.system.anomalies || []).filter(a => a.discoveredYear === null);
        
        if (undiscoveredAnomalies.length === 0) {
            showModal(fleetName, 'An exploration fleet hails you. "We\'ve been mapping this system, but it seems you\'ve already found all the anomalies. Safe travels!"', [
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.startCombat()],
            ]);
            return;
        }

        // Calculate price based on barter skills and number of anomalies
        const basePrice = undiscoveredAnomalies.length * 5000;
        const barterMultiplier = gs.fleet.calcBarterPriceMultiplier(this.fleet, true);
        const price = Math.ceil(basePrice * barterMultiplier);

        let msg = `An exploration fleet hails you. "We've been mapping anomalies in this system. We've located ${undiscoveredAnomalies.length} undiscovered anomal${undiscoveredAnomalies.length === 1 ? 'y' : 'ies'}."<br/><br/>`;
        msg += `"For ${price}CR, we can share our findings with you and mark them on your star map."<br/><br/>`;
        msg += `Your credits: ${gs.credits}CR<br/>`;

        if (gs.credits < price) {
            msg += `<br/>You don't have enough credits for this offer.`;
            showModal(fleetName, msg, [
                ['Decline', ()=>this.endEncounter()],
                ['Attack', ()=>this.startCombat()],
            ]);
        } else {
            showModal(fleetName, msg, [
                ['Accept', ()=>this.buyAnomalyInformation(price, undiscoveredAnomalies.length)],
                ['Decline', ()=>this.endEncounter()],
                ['Attack', ()=>this.startCombat()],
            ]);
        }
    }

    buyAnomalyInformation(price, numAnomalies) {
        // Transfer credits
        gs.credits -= price;
        this.fleet.captain.credits += price;

        // Mark all anomalies as discovered
        for (const anomaly of gs.system.anomalies) {
            if (anomaly.discoveredYear === null) {
                anomaly.discoveredYear = gs.year;
            }
        }

        const fleetName = coloredName(this.fleet);
        showModal(fleetName, 
            `The explorers transfer their anomaly data to your systems. ${numAnomalies} anomal${numAnomalies === 1 ? 'y' : 'ies'} ${numAnomalies === 1 ? 'has' : 'have'} been marked on your star map!<br/><br/>` +
            `"Pleasure doing business with you. Good luck out there!"`, 
            [['Continue', ()=>this.endEncounter()]]
        );
    }
}
