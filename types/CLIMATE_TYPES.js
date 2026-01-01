/**
 * @fileoverview Defines climate-related types used for planetary characteristics.
 * @module types/CLIMATE_TYPES
 */

/**
 * @class ClimateValue
 * @classdesc Represents a climate-related value.
 * @property {string} name - The name of the climate value.
 * @property {number} value - The numeric multiplier value.
 * @property {number} score - The score calculated from the value.
 * @property {string} coloredName - The name wrapped in a colored span based on the score.
 */
class ClimateValue {
    constructor(name, value) {
        this.name = name
        this.value = value
        this.score = ClimateValue.scoreClimateValue(value)
        this.coloredName = statColorSpan(this.name, this.score)
    }
    
    static scoreClimateValue(value = 1.0) {
        //at 1.0, return 4. at 0 return 0. at 4 return 0. linear in between
        if (value <= 1.0) return value * 4
        else if (value >=4.0) return 0
        return Math.max(0, 4 - ((value - 1) / 3) * 4)
    }
}


class AtmosphericPressure extends ClimateValue {}
class Temperature extends ClimateValue {}
class Gravity extends ClimateValue {}
class OceanCoverage extends ClimateValue {}
class GeologicalActivity extends ClimateValue {}
class Magnetosphere extends ClimateValue {}
class RadiationLevel extends ClimateValue {}
class AsteroidImpact extends ClimateValue {}

const ATMOSPHERIC_PRESSURES = Object.freeze({
    NONE: new AtmosphericPressure("None", 0),
    EXTREMELY_LOW: new AtmosphericPressure("Vacuum", 8/16),
    VERY_LOW: new AtmosphericPressure("Tenuous", 8/12),
    LOW: new AtmosphericPressure("Thin", 8/10),
    SLIGHTLY_LOW: new AtmosphericPressure("Light", 8/9),
    MEDIUM: new AtmosphericPressure("Breathable", 1),
    SLIGHTLY_HIGH: new AtmosphericPressure("Dense", 9/8),
    HIGH: new AtmosphericPressure("Heavy", 10/8),
    VERY_HIGH: new AtmosphericPressure("Oppressive", 12/8),
    EXTREMELY_HIGH: new AtmosphericPressure("Suffocating", 16/8),
    CRUSHING: new AtmosphericPressure("Crushing", 32/8),
})

const ATMOSPHERIC_PRESSURES_ALL = Object.values(ATMOSPHERIC_PRESSURES)

const TEMPERATURES = Object.freeze({
    NONE: new Temperature("None", 0),
    EXTREMELY_LOW: new Temperature("Frozen", 8/16),
    VERY_LOW: new Temperature("Frigid", 8/12),
    LOW: new Temperature("Cold", 8/10),
    SLIGHTLY_LOW: new Temperature("Cool", 8/9),
    MEDIUM: new Temperature("Temperate", 1),
    SLIGHTLY_HIGH: new Temperature("Warm", 9/8),
    HIGH: new Temperature("Hot", 10/8),
    VERY_HIGH: new Temperature("Scorching", 12/8),
    EXTREMELY_HIGH: new Temperature("Infernal", 16/8),
    MOLTEN: new Temperature("Molten", 32/8),
})

const TEMPERATURES_ALL = Object.values(TEMPERATURES)

const GRAVITIES = Object.freeze({
    NONE: new Gravity("None", 0),
    EXTREMELY_LOW: new Gravity("Negligible", 8/16),
    VERY_LOW: new Gravity("Featherlight", 8/12),
    LOW: new Gravity("Light", 8/10),
    SLIGHTLY_LOW: new Gravity("Gentle", 8/9),
    MEDIUM: new Gravity("Standard", 1),
    SLIGHTLY_HIGH: new Gravity("Strong", 9/8),
    HIGH: new Gravity("Heavy", 10/8),
    VERY_HIGH: new Gravity("Intense", 12/8),
    EXTREMELY_HIGH: new Gravity("Overwhelming", 16/8),
    CRUSHING: new Gravity("Crushing", 32/8),
})

const GRAVITIES_ALL = Object.values(GRAVITIES)

const OCEAN_COVERAGES = Object.freeze({
    NONE: new OceanCoverage("None", 0),
    EXTREMELY_LOW: new OceanCoverage("Trace", 8/16),
    VERY_LOW: new OceanCoverage("Scattered", 8/12),
    LOW: new OceanCoverage("Sparse", 8/10),
    SLIGHTLY_LOW: new OceanCoverage("Moderate", 8/9),
    MEDIUM: new OceanCoverage("Balanced", 1),
    SLIGHTLY_HIGH: new OceanCoverage("Extensive", 9/8),
    HIGH: new OceanCoverage("Dominant", 10/8),
    VERY_HIGH: new OceanCoverage("Oceanic", 12/8),
    EXTREMELY_HIGH: new OceanCoverage("Global Ocean", 16/8),
    SUBMERGED: new OceanCoverage("Submerged", 32/8),
})

const OCEAN_COVERAGES_ALL = Object.values(OCEAN_COVERAGES)

const GEOLOGICAL_ACTIVITIES = Object.freeze({
    NONE: new GeologicalActivity("None", 0),
    EXTREMELY_LOW: new GeologicalActivity("Dormant", 8/16),
    VERY_LOW: new GeologicalActivity("Sleepy", 8/12),
    LOW: new GeologicalActivity("Quiet", 8/10),
    SLIGHTLY_LOW: new GeologicalActivity("Slight", 8/9),
    MEDIUM: new GeologicalActivity("Moderate", 1),
    SLIGHTLY_HIGH: new GeologicalActivity("Active", 9/8),
    HIGH: new GeologicalActivity("Restless", 10/8),
    VERY_HIGH: new GeologicalActivity("Volcanic", 12/8),
    EXTREMELY_HIGH: new GeologicalActivity("Cataclysmic", 16/8),
    HELLSCAPE: new GeologicalActivity("Hellscape", 32/8),
})

const GEOLOGICAL_ACTIVITIES_ALL = Object.values(GEOLOGICAL_ACTIVITIES)

const MAGNETOSPHERES = Object.freeze({
    NONE: new Magnetosphere("None", 0),
    EXTREMELY_LOW: new Magnetosphere("Negligible", 8/16),
    VERY_LOW: new Magnetosphere("Weak", 8/12),
    LOW: new Magnetosphere("Low", 8/10),
    SLIGHTLY_LOW: new Magnetosphere("Moderate", 8/9),
    MEDIUM: new Magnetosphere("Standard", 1),
    SLIGHTLY_HIGH: new Magnetosphere("Strong", 9/8),
    HIGH: new Magnetosphere("Very Strong", 10/8),
    VERY_HIGH: new Magnetosphere("Powerful", 12/8),
    EXTREMELY_HIGH: new Magnetosphere("Extreme", 16/8),
    IMPENETRABLE: new Magnetosphere("Impenetrable", 32/8),
})

const MAGNETOSPHERES_ALL = Object.values(MAGNETOSPHERES)

const RADIATION_LEVELS = Object.freeze({
    NONE: new RadiationLevel("None", 0),
    EXTREMELY_LOW: new RadiationLevel("Minimal", 8/16),
    VERY_LOW: new RadiationLevel("Safe", 8/12),
    LOW: new RadiationLevel("Slight", 8/10),
    SLIGHTLY_LOW: new RadiationLevel("Low", 8/9),
    MEDIUM: new RadiationLevel("Moderate", 1),
    SLIGHTLY_HIGH: new RadiationLevel("Elevated", 9/8),
    HIGH: new RadiationLevel("Dangerous", 10/8),
    VERY_HIGH: new RadiationLevel("Extreme", 12/8),
    EXTREMELY_HIGH: new RadiationLevel("Lethal", 16/8),
    APOCALYPTIC: new RadiationLevel("Apocalyptic", 32/8),
})

const RADIATION_LEVELS_ALL = Object.values(RADIATION_LEVELS)

const ASTEROID_IMPACTS = Object.freeze({
    NONE: new AsteroidImpact("None", 0),
    EXTREMELY_LOW: new AsteroidImpact("Pristine", 8/16),
    VERY_LOW: new AsteroidImpact("Rare", 8/12),
    LOW: new AsteroidImpact("Occasional", 8/10),
    SLIGHTLY_LOW: new AsteroidImpact("Infrequent", 8/9),
    MEDIUM: new AsteroidImpact("Regular", 1),
    SLIGHTLY_HIGH: new AsteroidImpact("Frequent", 9/8),
    HIGH: new AsteroidImpact("Common", 10/8),
    VERY_HIGH: new AsteroidImpact("Constant", 12/8),
    EXTREMELY_HIGH: new AsteroidImpact("Unrelenting", 16/8),
    DEVASTATING: new AsteroidImpact("Devastating", 32/8),
})

const ASTEROID_IMPACTS_ALL = Object.values(ASTEROID_IMPACTS)
