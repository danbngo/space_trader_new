/**
 * AI for merchant fleets - travels between planets to trade.
 * @class MerchantFleetAI
 * @extends FleetAI
 */
class MerchantFleetAI extends FleetAI {
    calcDestination() {
        return rndMember([...gs.system.planets, ...gs.system.dwarfPlanets, ...gs.system.spaceStations].filter(p=>(p !== this.origin)))
    }

    onNearDestination() {
        // Trade at destination: sell then buy
        if (this.destination && this.destination instanceof Planet) {
            this.sellCargoAtMarket(this.destination);
            this.buyCargoFromMarket(this.destination);
        }
        
        // Spread minor culture when trading at destinations (0.1% influence)
        if (this.destination instanceof Planet) {
            this.destination.addCulture(this.fleet.planet, 0.001);
        }
        
        super.onNearDestination()
    }

    onNearOrigin() {
        // Sell and restock at origin market
        if (this.origin && this.origin instanceof Planet) {
            this.sellCargoAtMarket(this.origin);
            this.buyCargoFromMarket(this.origin);
        }
        
        super.onNearOrigin()
    }
    onDestroyed(destroyedBy = null) {
        // Losing merchants hurts trade and economy
        if (this.fleet.planet && this.fleet.planet.civilization) {
            this.fleet.planet.c.economy *= 0.98;
            this.fleet.planet.c.wealth *= 0.99;
        }
        super.onDestroyed(destroyedBy)
    }
}
