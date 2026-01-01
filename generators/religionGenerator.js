/**
 * Available symbols for religions. Will be assigned to religions as they are generated.
 */
const RELIGION_SYMBOLS = [
    '✦', '☨', '✡', '☪', '☸', '☯', '✚', '⛤', '⛧', '☥',
    '♰', '☩', '♱', '✟', '⚛', '☬', '🕉', '⛏', '⚕', '☀',
    '🌙', '⭐', '✶', '✴', '✵', '✷', '✸', '❂', '✹', '❋',
    '✺', '✻', '✼', '❃', '❊', '❉', '🔱', '⚜', '☄', '💫'
];

/**
 * Tracks which symbols have been used for religions.
 */
let usedReligionSymbols = [];

/**
 * Gets an unused religion symbol from the available list.
 * @returns {string} An unused symbol, or a random one if all are used.
 */
function getUnusedReligionSymbol() {
    const available = RELIGION_SYMBOLS.filter(s => !usedReligionSymbols.includes(s));
    if (available.length === 0) {
        // All symbols used, just return a random one
        return rndMember(RELIGION_SYMBOLS);
    }
    const symbol = rndMember(available);
    usedReligionSymbols.push(symbol);
    return symbol;
}

/**
 * Generates a procedural name for a religion.
 * @returns {string} The generated religion name.
 */
function generateReligionName() {
    const prefixes = [
        'Church of', 'Order of', 'Temple of', 'Followers of', 'Brotherhood of',
        'Sisterhood of', 'Covenant of', 'Path of', 'Way of', 'Cult of',
        'Faith of', 'Disciples of', 'Children of', 'Seekers of', 'Keepers of'
    ];
    
    const concepts = [
        'the Eternal Light', 'the Void', 'the Cosmos', 'the Stars', 'Divine Unity',
        'the Sacred Flame', 'Universal Truth', 'the Infinite', 'Celestial Harmony',
        'the Ancient Ones', 'the Singularity', 'Transcendence', 'the Nexus',
        'the Great Cycle', 'Divine Reason', 'the Cosmic Dance', 'the Solar Winds',
        'the Quantum Mind', 'Stellar Ascension', 'the Void Between', 'Perfect Balance',
        'the Crystal Spheres', 'Universal Consciousness', 'the Deep Time', 'Eternal Return',
        'the Architects', 'the First Cause', 'the Prime Mover', 'Sacred Geometry',
        'the Luminous Path', 'the Dark Mother', 'the Stellar Forge', 'Pure Mathematics'
    ];
    
    // 30% chance to use prefix + concept, otherwise just concept
    if (Math.random() < 0.3) {
        return `${rndMember(prefixes)} ${rndMember(concepts)}`;
    } else {
        return rndMember(concepts);
    }
}

/**
 * Generates a religion with random traits and color.
 * @returns {Religion} The generated religion.
 */
function generateReligion() {
    const name = generateReligionName();
    
    // Generate 1-3 random traits
    const numTraits = rng(3, 1);
    const availableTraits = [...RELIGION_TRAITS_ALL];
    const traits = [];
    
    for (let i = 0; i < numTraits && availableTraits.length > 0; i++) {
        const traitIndex = rng(availableTraits.length - 1, 0);
        traits.push(availableTraits[traitIndex]);
        availableTraits.splice(traitIndex, 1); // Remove to avoid duplicates
    }
    
    // Generate a color (prefer brighter colors for religions)
    const colorChoices = [
        COLORS.White, COLORS.Yellow, COLORS.Cyan, COLORS.Magenta,
        COLORS.LightGreen, COLORS.LightBlue, COLORS.Orange, COLORS.Purple,
        COLORS.Pink, COLORS.LightOrange, hexToRgba('#gold'), hexToRgba('#silver')
    ];
    
    const color = rndMember(colorChoices);
    const icon = getUnusedReligionSymbol();
    
    return new Religion(name, traits, color, icon);
}

/**
 * Generates multiple religions for the star system.
 * @param {number} count - Number of religions to generate (default 1-3).
 * @returns {Religion[]} Array of generated religions.
 */
function generateReligions(count = rng(3, 1)) {
    // Reset used symbols for new system generation
    usedReligionSymbols = [];
    
    const religions = [];
    for (let i = 0; i < count; i++) {
        religions.push(generateReligion());
    }
    return religions;
}
