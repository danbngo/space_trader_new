/**
 * AI for media fleets - journalists, advertisers, social media influencers, and celebrities.
 * @class MediaFleetAI
 * @extends FleetAI
 */
class MediaFleetAI extends FleetAI {
    constructor(fleet = null, origin = null, starMap = null) {
        super(fleet, origin, starMap);
    }

    calcValidTargets() {
        // Target any fleet that we haven't visited yet (for interviews/content creation)
        return gs.system.fleets.filter(f => {
            if (f === this.fleet) return false;
            if (f.location) return false; // Skip fleets at locations
            if (this.visited.includes(f)) return false;
            return true;
        });
    }

    calcDestination() {
        // Media goes to any planet, dwarf planet, space station, or asteroid
        const allDestinations = [
            ...gs.system.planets,
            ...gs.system.dwarfPlanets,
            ...gs.system.spaceStations,
            ...gs.system.asteroids
        ];
        
        return rndMember(allDestinations.filter(dest => dest !== this.origin));
    }

    onNearTarget() {
        if (this.target instanceof Fleet && !this.target.location) {
            // Don't automatically interact with player fleet - they get an encounter instead
            if (this.target === gs.fleet) {
                this.target = null;
                this.fleet.route = null;
                return;
            }

            // Mark as visited
            this.visited.push(this.target);

            // Media interaction: interview/create content about the target
            console.log(`📡 ${this.fleet.name} creates content featuring ${this.target.name}!`);

            // Home planet gains culture and education from media coverage
            if (this.fleet.planet && this.fleet.planet.civilization) {
                this.fleet.planet.c.culture *= 1.01;
                this.fleet.planet.c.education *= 1.01;
            }

            // Target fleet's planet gains prestige from media exposure
            if (this.target.planet && this.target.planet.civilization) {
                this.target.planet.c.prestige *= 1.01;
            }

            // Show popup indicating media interaction
            this.addPopup('📡', COLORS.Orange);
            if (this.starMap) {
                this.addPopup('✨', COLORS.Yellow, this.target.x, this.target.y);
            }

            // Clear target and move on
            this.target = null;
            this.fleet.route = null;
        }
    }

    onNearDestination() {
        // Media spreads information and culture when arriving at destinations
        if (this.destination instanceof Planet) {
            this.destination.addCulture(this.fleet.planet, 0.001);
            // Boost local awareness/education slightly
            if (this.destination.civilization) {
                this.destination.c.education *= 1.005;
            }
        }

        super.onNearDestination();
    }

    onDestroyed(destroyedBy = null) {
        // Losing media reduces cultural influence
        if (this.fleet.planet && this.fleet.planet.civilization) {
            this.fleet.planet.c.culture *= 0.99;
            this.fleet.planet.c.prestige *= 0.99;
        }
        super.onDestroyed(destroyedBy);
    }
}
