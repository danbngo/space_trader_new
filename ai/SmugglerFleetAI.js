/**
 * AI for smuggler fleets - travels discreetly between planets, avoids police.
 * @class SmugglerFleetAI
 * @extends FleetAI
 */
class SmugglerFleetAI extends FleetAI {
    calcDestination() {
        // If no cargo, prefer going back to origin to restock
        if (this.fleet.cargo.total === 0 && this.origin) {
            return this.origin;
        }
        return rndMember([...gs.system.planets, ...gs.system.dwarfPlanets, ...gs.system.spaceStations].filter(p=>(p !== this.origin)))
    }

    onNearDestination() {
        // At origin: restock with illegal cargo
        if (this.destination === this.origin && this.destination instanceof Planet) {
            if (this.fleet.cargo.total === 0) {
                // Restock with illegal cargo only
                this.buyCargoFromMarket(this.destination, true);
                console.log(`🚨 ${this.fleet.name} restocked illegal cargo at ${this.destination.name}`);
            }
        }
        // At other destinations: sell smuggled cargo
        else if (this.destination && this.destination instanceof Planet && this.fleet.cargo.total > 0) {
            // Increase corruption from illicit activity
            if (this.destination.civilization) {
                this.destination.c.corruption *= 1.01;
            }
            this.sellCargoAtMarket(this.destination);
            
            // Override console message for smuggling
            console.log(`🚨 ${this.fleet.name} smuggled cargo into ${this.destination.name}`)
            
            // Show smuggling popup (different color)
            this.addPopup('💲', COLORS.Red)
        }
        
        super.onNearDestination()
    }

    onDestroyed(destroyedBy = null) {
        // Destroying smugglers reduces criminal activity
        if (this.fleet.planet && this.fleet.planet.civilization) {
            this.fleet.planet.c.crime *= 0.99;
            this.fleet.planet.c.corruption *= 0.99
            this.fleet.planet.c.economy *= 0.99;
        }
        super.onDestroyed(destroyedBy)
    }
}
