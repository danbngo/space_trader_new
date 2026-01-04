/**
 * AI for hacker fleets - targets damaged fleets for repair services, resurrects abandoned fleets, and siphons credits.
 * @class HackerFleetAI
 * @extends FleetAI
 */
class HackerFleetAI extends FleetAI {
    constructor(fleet = null, origin = null, starMap = null) {
        super(fleet, origin, starMap);
    }
    
    calcValidTargets() {
        const targets = [];
        
        // Priority 1: Abandoned fleets with crew
        const abandonedWithCrew = gs.system.abandonedFleets.filter(af => {
            if (this.visited.includes(af)) return false;
            return af.officers && af.officers.length > 0;
        });
        if (abandonedWithCrew.length > 0) return abandonedWithCrew;
        
        // Priority 2: Damaged fleets (25%+ hull damage, non-criminal, non-authority)
        const damagedFleets = gs.system.fleets.filter(f => {
            if (f === this.fleet) return false;
            if (f.location) return false;
            if (this.visited.includes(f)) return false;
            if (!f.factionType) return false;
            
            // Skip criminal and authority factions
            if (f.factionType.criminal || f.factionType.authority) return false;
            
            // Calculate total hull damage
            const totalMaxHull = f.ships.reduce((sum, ship) => sum + ship.hull[1], 0);
            const totalCurrentHull = f.ships.reduce((sum, ship) => sum + ship.hull[0], 0);
            const damagePercent = (totalMaxHull - totalCurrentHull) / totalMaxHull;
            
            return damagePercent >= 0.25;
        });
        if (damagedFleets.length > 0) return damagedFleets;
        
        // Priority 3: Any fleet with credits to siphon
        const fleetsWithCredits = gs.system.fleets.filter(f => {
            if (f === this.fleet) return false;
            if (f === gs.fleet) return false; // Don't target player (they get encounter)
            if (f.location) return false;
            if (this.visited.includes(f)) return false;
            return f.captain && f.captain.credits > 100;
        });
        return fleetsWithCredits;
    }
    
    calcDestination() {
        return rndMember([...gs.system.planets, ...gs.system.dwarfPlanets, ...gs.system.spaceStations].filter(p => p !== this.origin));
    }
    
    onNearTarget() {
        // Handle abandoned fleet resurrection
        if (this.target instanceof AbandonedFleet) {
            this.visited.push(this.target);
            this.resurrectAbandonedFleet(this.target);
            return;
        }
        
        // Handle damaged fleet repair
        if (this.target instanceof Fleet) {
            this.visited.push(this.target);
            
            const totalMaxHull = this.target.ships.reduce((sum, ship) => sum + ship.hull[1], 0);
            const totalCurrentHull = this.target.ships.reduce((sum, ship) => sum + ship.hull[0], 0);
            const damagePercent = (totalMaxHull - totalCurrentHull) / totalMaxHull;
            
            if (damagePercent >= 0.25) {
                this.offerRepairService(this.target);
            } else {
                this.attemptCreditSiphon(this.target);
            }
        }
    }
    
    resurrectAbandonedFleet(abandonedFleet) {
        if (!(abandonedFleet instanceof AbandonedFleet)) return;
        if (!abandonedFleet.officers || abandonedFleet.officers.length === 0) return;
        
        console.log(`💻 ${this.fleet.name} is resurrecting abandoned fleet ${abandonedFleet.name}`);
        
        // Use StarSystem.resurrectFleet function
        const resurrectedFleet = gs.system.resurrectFleet(abandonedFleet);
        
        if (resurrectedFleet) {
            // Transfer credits from resurrected captain to hackers
            if (resurrectedFleet.captain && resurrectedFleet.captain.credits > 0) {
                const credits = resurrectedFleet.captain.credits;
                this.fleet.captain.credits += credits;
                resurrectedFleet.captain.credits = 0;
                console.log(`💰 ${this.fleet.name} took ${credits} CR from ${resurrectedFleet.name}'s captain`);
            }
            
            this.addPopup('💻', COLORS.Cyan, abandonedFleet.x, abandonedFleet.y);
            this.addPopup('✨', COLORS.Green);
        }
    }
    
    offerRepairService(targetFleet) {
        if (!(targetFleet instanceof Fleet)) return;
        
        // 50% chance to help, 50% chance nothing happens
        if (Math.random() < 0.5) {
            // Nothing happens
            console.log(`💻 ${this.fleet.name} observed ${targetFleet.name} but took no action`);
            return;
        }
        
        // Calculate repair and payment
        const totalMaxHull = targetFleet.ships.reduce((sum, ship) => sum + ship.hull[1], 0);
        const totalCurrentHull = targetFleet.ships.reduce((sum, ship) => sum + ship.hull[0], 0);
        const totalDamage = totalMaxHull - totalCurrentHull;
        
        // Take 25% of fleet's credits
        const payment = Math.floor(targetFleet.captain.credits * 0.25);
        targetFleet.captain.credits -= payment;
        this.fleet.captain.credits += payment;
        
        // Repair all ships to full
        for (const ship of targetFleet.ships) {
            ship.repairHull(ship.hull[1]);
        }
        
        console.log(`🔧 ${this.fleet.name} repaired ${targetFleet.name} (${totalDamage} hull) for ${payment} CR`);
        this.addPopup('🔧', COLORS.Green);
        this.addPopup('💰', COLORS.Yellow, targetFleet.x, targetFleet.y);
    }
    
    attemptCreditSiphon(targetFleet) {
        if (!(targetFleet instanceof Fleet)) return;
        if (!targetFleet.captain || targetFleet.captain.credits <= 100) return;
        
        const roll = Math.random();
        
        if (roll < 0.5) {
            // 50% chance: Success - siphon 50% of credits
            const siphonAmount = Math.floor(targetFleet.captain.credits * 0.5);
            targetFleet.captain.credits -= siphonAmount;
            this.fleet.captain.credits += siphonAmount;
            
            console.log(`💻 ${this.fleet.name} siphoned ${siphonAmount} CR from ${targetFleet.name}`);
            this.addPopup('💻', COLORS.Cyan);
            this.addPopup('💸', COLORS.Red, targetFleet.x, targetFleet.y);
        } else if (roll < 0.75) {
            // 25% chance: Combat ensues
            console.log(`⚔️ ${this.fleet.name} was detected by ${targetFleet.name} - combat!`);
            this.addPopup('⚔️', COLORS.Red);
            this.fightTarget();
        } else {
            // 25% chance: Nothing happens
            console.log(`💻 ${this.fleet.name} attempted to siphon from ${targetFleet.name} but failed silently`);
        }
    }
    
    fightTarget() {
        return super.fightTarget(true);
    }
    
    onDestroyed() {
        // Losing hackers slightly reduces technology in their origin civilization
        if (this.fleet.planet && this.fleet.planet.civilization) {
            this.fleet.planet.c.technology *= 0.99;
        }
        super.onDestroyed();
    }
}
