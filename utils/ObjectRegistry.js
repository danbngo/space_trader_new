/**
 * Central registry for looking up game objects by UUID during deserialization
 */
class ObjectRegistry {
    constructor() {
        this.clear()
    }
    
    clear() {
        this.ships = new Map()
        this.fleets = new Map()
        this.planets = new Map()
        this.stars = new Map()
        this.asteroids = new Map()
        this.anomalies = new Map()
        this.ruins = new Map()
        this.officers = new Map()
        this.missions = new Map()
        this.settlements = new Map()
        this.civilizations = new Map()
        this.news = new Map()
        this.newsEffects = new Map()
        this.routes = new Map()
        this.encounters = new Map()
        this.buildings = new Map()
    }
    
    register(type, object) {
        // Handle pluralization - most types add 's', but some are irregular
        let pluralType = type + 's';
        if (type === 'news') pluralType = 'news'; // news is already plural
        if (type === 'newsEffect') pluralType = 'newsEffects'; // special case
        
        const map = this[pluralType];
        if (!map) {
            console.warn(`Unknown registry type: ${type}`);
            return;
        }
        map.set(object.uuid, object);
    }
    
    get(type, uuid) {
        // Handle pluralization - most types add 's', but some are irregular
        let pluralType = type + 's';
        if (type === 'news') pluralType = 'news'; // news is already plural
        if (type === 'newsEffect') pluralType = 'newsEffects'; // special case
        
        const map = this[pluralType];
        if (!map) return null;
        return map.get(uuid);
    }
    
    // Convenience methods
    registerShip(ship) { this.register('ship', ship) }
    registerFleet(fleet) { this.register('fleet', fleet) }
    registerPlanet(planet) { this.register('planet', planet) }
    registerStar(star) { this.register('star', star) }
    registerAsteroid(asteroid) { this.register('asteroid', asteroid) }
    registerAnomaly(anomaly) { this.register('anomaly', anomaly) }
    registerRuin(ruins) { this.register('ruin', ruins) }
    registerOfficer(officer) { this.register('officer', officer) }
    registerMission(mission) { this.register('mission', mission) }
    registerSettlement(settlement) { this.register('settlement', settlement) }
    registerCivilization(civ) { this.register('civilization', civ) }
    registerNews(news) { this.register('news', news) }
    registerNewsEffect(effect) { this.register('newsEffect', effect) }
    registerRoute(route) { this.register('route', route) }
    // REMOVED: Encounter system deleted
    // registerEncounter(encounter) { this.register('encounter', encounter) }
    registerBuilding(building) { this.register('building', building) }
}

// Global singleton
const gameRegistry = new ObjectRegistry()
