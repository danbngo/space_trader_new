/**
 * Generates a random contract for the guild.
 * @param {Planet | DwarfPlanet | SpaceStation} planet - The planet where the contract originates.
 * @returns {Contract} The generated contract.
 */
function generateContract(planet = new Planet()) {
    const civilization = planet.civilization;
    
    // Weight contract types based on civilization attributes
    /*const weights = {
        [CONTRACT_TYPES.LETTER_OF_MARQUE]: civilization.security * 2,
        [CONTRACT_TYPES.MERCHANT_LICENSE]: civilization.economy * 2,
        [CONTRACT_TYPES.MINING_PERMIT]: civilization.industry * 2,
        [CONTRACT_TYPES.DIPLOMATIC_PASS]: c.prestige,
        [CONTRACT_TYPES.CARGO_DELIVERY]: civilization.economy * 3,
        [CONTRACT_TYPES.URGENT_DELIVERY]: civilization.economy * 2,
        [CONTRACT_TYPES.DELIVER_MISSIVE]: civilization.culture,
        [CONTRACT_TYPES.PASSENGER_TRANSPORT]: civilization.culture * 2,
        [CONTRACT_TYPES.DESTROY_PIRATES]: civilization.security * 3,
        [CONTRACT_TYPES.BOUNTY_HUNT]: civilization.security * 2,
        [CONTRACT_TYPES.ESCORT_CONVOY]: civilization.navy * 2,
        [CONTRACT_TYPES.PATROL_SECTOR]: civilization.security,
        [CONTRACT_TYPES.SURVEY_MISSION]: civilization.technology,
        [CONTRACT_TYPES.RESCUE_OPERATION]: civilization.security,
        [CONTRACT_TYPES.TRADE_ROUTE]: civilization.economy,
        [CONTRACT_TYPES.SMUGGLING_RUN]: civilization.crime * 2,
    };
    
    // Select contract type based on weights
    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;*/
    let selectedType = CONTRACT_TYPES.CARGO_DELIVERY; // default
    
    /*for (const [type, weight] of Object.entries(weights)) {
        random -= weight;
        if (random <= 0) {
            selectedType = type;
            break;
        }
    }*/
    
    // Generate contract parameters based on type
    const otherPlanets = gs.system.planets.filter(p => p !== planet);
    const targetPlanet = otherPlanets.length > 0 ? rndMember(otherPlanets) : null;
    const expirationDate = 0; // TODO: implement when game time system exists
    
    let cargoType = null;
    let amount = 0;
    let reward = 0;
    
    // Set parameters based on contract type
    switch (selectedType) {
        case CONTRACT_TYPES.CARGO_DELIVERY:
        case CONTRACT_TYPES.URGENT_DELIVERY:
            cargoType = rndMember(CARGO_TYPES_ALL);
            amount = rng(50, 10);
            reward = Math.round(cargoType.value * amount * rng(2, 1.2, false));
            break;
            
        case CONTRACT_TYPES.DELIVER_MISSIVE:
            reward = rng(5000, 1000);
            break;
            
        case CONTRACT_TYPES.PASSENGER_TRANSPORT:
            amount = rng(5, 1); // number of passengers
            reward = rng(3000, 500) * amount;
            break;
            
        case CONTRACT_TYPES.DESTROY_PIRATES:
        case CONTRACT_TYPES.BOUNTY_HUNT:
            amount = rng(5, 1); // number of ships to destroy
            reward = rng(10000, 2000) * amount;
            break;
            
        case CONTRACT_TYPES.ESCORT_CONVOY:
        case CONTRACT_TYPES.PATROL_SECTOR:
            reward = rng(8000, 2000);
            break;
            
        case CONTRACT_TYPES.SURVEY_MISSION:
        case CONTRACT_TYPES.RESCUE_OPERATION:
            reward = rng(6000, 1500);
            break;
            
        case CONTRACT_TYPES.TRADE_ROUTE:
            cargoType = rndMember(CARGO_TYPES_ALL);
            amount = rng(100, 30);
            reward = Math.round(cargoType.value * amount * rng(1.5, 1.1, false));
            break;
            
        case CONTRACT_TYPES.SMUGGLING_RUN:
            cargoType = rndMember(CARGO_TYPES_ALL.filter(ct => ct.illegal));
            if (!cargoType) cargoType = rndMember(CARGO_TYPES_ALL); // fallback
            amount = rng(30, 10);
            reward = Math.round(cargoType.value * amount * rng(3, 2, false));
            break;
            
        case CONTRACT_TYPES.LETTER_OF_MARQUE:
        case CONTRACT_TYPES.MERCHANT_LICENSE:
        case CONTRACT_TYPES.MINING_PERMIT:
        case CONTRACT_TYPES.DIPLOMATIC_PASS:
            // Licenses have higher flat rewards
            reward = rng(15000, 5000);
            break;
    }
    
    // Apply civilization modifiers to reward
    reward = Math.round(reward * civilization.wealth * (1 + civilization.inflation));
    
    // Generate description based on contract type
    let description = '';
    switch (selectedType) {
        case CONTRACT_TYPES.CARGO_DELIVERY:
            description = `Deliver ${amount} units of ${cargoType.name} to ${targetPlanet.name}.`;
            break;
        case CONTRACT_TYPES.URGENT_DELIVERY:
            description = `Urgent! Deliver ${amount} units of ${cargoType.name} to ${targetPlanet.name} immediately.`;
            break;
        case CONTRACT_TYPES.DELIVER_MISSIVE:
            description = `Transport an important message to ${targetPlanet.name}.`;
            break;
        case CONTRACT_TYPES.PASSENGER_TRANSPORT:
            description = `Transport ${amount} passenger${amount > 1 ? 's' : ''} to ${targetPlanet.name}.`;
            break;
        case CONTRACT_TYPES.DESTROY_PIRATES:
            description = `Destroy ${amount} pirate ship${amount > 1 ? 's' : ''} threatening ${planet.name}.`;
            break;
        case CONTRACT_TYPES.BOUNTY_HUNT:
            description = `Hunt down and destroy ${amount} wanted criminal${amount > 1 ? 's' : ''}.`;
            break;
        case CONTRACT_TYPES.ESCORT_CONVOY:
            description = `Escort a convoy from ${planet.name} to ${targetPlanet.name}.`;
            break;
        case CONTRACT_TYPES.PATROL_SECTOR:
            description = `Patrol the sector around ${planet.name} and report any threats.`;
            break;
        case CONTRACT_TYPES.SURVEY_MISSION:
            description = `Survey the area near ${targetPlanet.name} and report findings.`;
            break;
        case CONTRACT_TYPES.RESCUE_OPERATION:
            description = `Rescue stranded personnel near ${targetPlanet.name}.`;
            break;
        case CONTRACT_TYPES.TRADE_ROUTE:
            description = `Establish a trade route by delivering ${amount} units of ${cargoType.name} to ${targetPlanet.name}.`;
            break;
        case CONTRACT_TYPES.SMUGGLING_RUN:
            description = `Discreetly transport ${amount} units of ${cargoType.name} to ${targetPlanet.name}.`;
            break;
        case CONTRACT_TYPES.LETTER_OF_MARQUE:
            description = `Obtain authorization to engage hostile ships on behalf of ${planet.name}.`;
            break;
        case CONTRACT_TYPES.MERCHANT_LICENSE:
            description = `Secure a license to trade freely in ${planet.name} territory.`;
            break;
        case CONTRACT_TYPES.MINING_PERMIT:
            description = `Obtain permission to mine resources in ${planet.name} territory.`;
            break;
        case CONTRACT_TYPES.DIPLOMATIC_PASS:
            description = `Secure diplomatic clearance for travel to ${targetPlanet.name}.`;
            break;
    }
    
    return new Contract(
        selectedType,
        planet,
        targetPlanet,
        expirationDate,
        cargoType,
        amount,
        reward,
        description
    );
}
