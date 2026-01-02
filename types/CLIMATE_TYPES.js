/**
 * @fileoverview Defines climate-related types used for planetary characteristics.
 * @module types/CLIMATE_TYPES
 */

/**
 * @class ClimateValue
 * @classdesc Represents a climate-related value.
 * @property {string} name - The name of the climate value.
 * @property {number} value - The numeric multiplier value.
 * @property {number} earthValue - Earth's value for this climate type
 * @property {number} score - The score calculated from the value.
 * @property {string} coloredName - The name wrapped in a colored span based on the score.
 */
class ClimateValue {
    constructor(name, value, earthValue) {
        this.name = name
        this.value = value
        this.earthValue = earthValue
        this.score = ClimateValue.scoreClimateValue(value/earthValue)
        this.coloredName = statColorSpan(this.name, this.score)
    }
    
    static scoreClimateValue(value = 1.0) {
        // Very punishing logarithmic scoring - deviations from 1.0 are heavily penalized
        // 1.0 = perfect (Earth-like) score of 4.0
        // 0.75x and 1.3333x (4/3) both return 0.25
        if (value <= 0) return 0
        
        // Use logarithmic distance from 1.0
        const logDistance = Math.abs(Math.log2(value))
        
        // Use 10th power for very steep punishment curve
        // score = 2^(-10*logDistance) * 4
        const score = Math.pow(2, -4*logDistance) * 4
        
        return score
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
class Pollution extends ClimateValue {}

const ATMOSPHERIC_PRESSURES = Object.freeze({
    NONE: new AtmosphericPressure("None", 0, 1),
    EXTREMELY_LOW: new AtmosphericPressure("Vacuum", 8/16, 1),
    VERY_LOW: new AtmosphericPressure("Tenuous", 8/12, 1),
    LOW: new AtmosphericPressure("Thin", 8/10, 1),
    SLIGHTLY_LOW: new AtmosphericPressure("Light", 8/9, 1),
    MEDIUM: new AtmosphericPressure("Breathable", 1, 1),
    SLIGHTLY_HIGH: new AtmosphericPressure("Dense", 9/8, 1),
    HIGH: new AtmosphericPressure("Heavy", 10/8, 1),
    VERY_HIGH: new AtmosphericPressure("Oppressive", 12/8, 1),
    EXTREMELY_HIGH: new AtmosphericPressure("Suffocating", 16/8, 1),
    CRUSHING: new AtmosphericPressure("Crushing", 32/8, 1),
})

const ATMOSPHERIC_PRESSURES_ALL = Object.values(ATMOSPHERIC_PRESSURES)

const TEMPERATURES = Object.freeze({
    NONE: new Temperature("None", 0, 1),
    EXTREMELY_LOW: new Temperature("Frozen", 8/16, 1),
    VERY_LOW: new Temperature("Frigid", 8/12, 1),
    LOW: new Temperature("Cold", 8/10, 1),
    SLIGHTLY_LOW: new Temperature("Cool", 8/9, 1),
    MEDIUM: new Temperature("Temperate", 1, 1),
    SLIGHTLY_HIGH: new Temperature("Warm", 9/8, 1),
    HIGH: new Temperature("Hot", 10/8, 1),
    VERY_HIGH: new Temperature("Scorching", 12/8, 1),
    EXTREMELY_HIGH: new Temperature("Infernal", 16/8, 1),
    MOLTEN: new Temperature("Molten", 32/8, 1),
})

const TEMPERATURES_ALL = Object.values(TEMPERATURES)

const GRAVITIES = Object.freeze({
    NONE: new Gravity("None", 0, 1),
    EXTREMELY_LOW: new Gravity("Negligible", 8/16, 1),
    VERY_LOW: new Gravity("Featherlight", 8/12, 1),
    LOW: new Gravity("Light", 8/10, 1),
    SLIGHTLY_LOW: new Gravity("Gentle", 8/9, 1),
    MEDIUM: new Gravity("Standard", 1, 1),
    SLIGHTLY_HIGH: new Gravity("Strong", 9/8, 1),
    HIGH: new Gravity("Heavy", 10/8, 1),
    VERY_HIGH: new Gravity("Intense", 12/8, 1),
    EXTREMELY_HIGH: new Gravity("Overwhelming", 16/8, 1),
    CRUSHING: new Gravity("Crushing", 32/8, 1),
})

const GRAVITIES_ALL = Object.values(GRAVITIES)

const OCEAN_COVERAGES = Object.freeze({
    NONE: new OceanCoverage("None", 0, 12/8),
    EXTREMELY_LOW: new OceanCoverage("Trace", 8/16, 12/8),
    VERY_LOW: new OceanCoverage("Scattered", 8/12, 12/8),
    LOW: new OceanCoverage("Sparse", 8/10, 12/8),
    SLIGHTLY_LOW: new OceanCoverage("Moderate", 8/9, 12/8),
    MEDIUM: new OceanCoverage("Balanced", 1, 12/8),
    SLIGHTLY_HIGH: new OceanCoverage("Extensive", 9/8, 12/8),
    HIGH: new OceanCoverage("Dominant", 10/8, 12/8),
    VERY_HIGH: new OceanCoverage("Oceanic", 12/8, 12/8),
    EXTREMELY_HIGH: new OceanCoverage("Global Ocean", 16/8, 12/8),
    SUBMERGED: new OceanCoverage("Submerged", 32/8, 12/8),
})

const OCEAN_COVERAGES_ALL = Object.values(OCEAN_COVERAGES)

const GEOLOGICAL_ACTIVITIES = Object.freeze({
    NONE: new GeologicalActivity("None", 0, 9/8),
    EXTREMELY_LOW: new GeologicalActivity("Dormant", 8/16, 9/8),
    VERY_LOW: new GeologicalActivity("Sleepy", 8/12, 9/8),
    LOW: new GeologicalActivity("Quiet", 8/10, 9/8),
    SLIGHTLY_LOW: new GeologicalActivity("Slight", 8/9, 9/8),
    MEDIUM: new GeologicalActivity("Moderate", 1, 9/8),
    SLIGHTLY_HIGH: new GeologicalActivity("Active", 9/8, 9/8),
    HIGH: new GeologicalActivity("Restless", 10/8, 9/8),
    VERY_HIGH: new GeologicalActivity("Volcanic", 12/8, 9/8),
    EXTREMELY_HIGH: new GeologicalActivity("Cataclysmic", 16/8, 9/8),
    HELLSCAPE: new GeologicalActivity("Hellscape", 32/8, 9/8),
})

const GEOLOGICAL_ACTIVITIES_ALL = Object.values(GEOLOGICAL_ACTIVITIES)

const MAGNETOSPHERES = Object.freeze({
    NONE: new Magnetosphere("None", 0, 1),
    EXTREMELY_LOW: new Magnetosphere("Negligible", 8/16, 1),
    VERY_LOW: new Magnetosphere("Weak", 8/12, 1),
    LOW: new Magnetosphere("Low", 8/10, 1),
    SLIGHTLY_LOW: new Magnetosphere("Moderate", 8/9, 1),
    MEDIUM: new Magnetosphere("Standard", 1, 1),
    SLIGHTLY_HIGH: new Magnetosphere("Strong", 9/8, 1),
    HIGH: new Magnetosphere("Very Strong", 10/8, 1),
    VERY_HIGH: new Magnetosphere("Powerful", 12/8, 1),
    EXTREMELY_HIGH: new Magnetosphere("Extreme", 16/8, 1),
    IMPENETRABLE: new Magnetosphere("Impenetrable", 32/8, 1),
})

const MAGNETOSPHERES_ALL = Object.values(MAGNETOSPHERES)

const RADIATION_LEVELS = Object.freeze({
    NONE: new RadiationLevel("None", 0, 8/12),
    EXTREMELY_LOW: new RadiationLevel("Minimal", 8/16, 8/12),
    VERY_LOW: new RadiationLevel("Safe", 8/12, 8/12),
    LOW: new RadiationLevel("Slight", 8/10, 8/12),
    SLIGHTLY_LOW: new RadiationLevel("Low", 8/9, 8/12),
    MEDIUM: new RadiationLevel("Moderate", 1, 8/12),
    SLIGHTLY_HIGH: new RadiationLevel("Elevated", 9/8, 8/12),
    HIGH: new RadiationLevel("Dangerous", 10/8, 8/12),
    VERY_HIGH: new RadiationLevel("Extreme", 12/8, 8/12),
    EXTREMELY_HIGH: new RadiationLevel("Lethal", 16/8, 8/12),
    APOCALYPTIC: new RadiationLevel("Apocalyptic", 32/8, 8/12),
})

const RADIATION_LEVELS_ALL = Object.values(RADIATION_LEVELS)

const ASTEROID_IMPACTS = Object.freeze({
    NONE: new AsteroidImpact("None", 0, 8/12),
    EXTREMELY_LOW: new AsteroidImpact("Pristine", 8/16, 8/12),
    VERY_LOW: new AsteroidImpact("Rare", 8/12, 8/12),
    LOW: new AsteroidImpact("Occasional", 8/10, 8/12),
    SLIGHTLY_LOW: new AsteroidImpact("Infrequent", 8/9, 8/12),
    MEDIUM: new AsteroidImpact("Regular", 1, 8/12),
    SLIGHTLY_HIGH: new AsteroidImpact("Frequent", 9/8, 8/12),
    HIGH: new AsteroidImpact("Common", 10/8, 8/12),
    VERY_HIGH: new AsteroidImpact("Constant", 12/8, 8/12),
    EXTREMELY_HIGH: new AsteroidImpact("Unrelenting", 16/8, 8/12),
    DEVASTATING: new AsteroidImpact("Devastating", 32/8, 8/12),
})

const ASTEROID_IMPACTS_ALL = Object.values(ASTEROID_IMPACTS)

const POLLUTION_LEVELS = Object.freeze({
    NONE: new Pollution("Pristine", 0, 8/12),
    EXTREMELY_LOW: new Pollution("Clean", 8/16, 8/12),
    VERY_LOW: new Pollution("Trace", 8/12, 8/12),
    LOW: new Pollution("Minor", 8/10, 8/12),
    SLIGHTLY_LOW: new Pollution("Average", 8/9, 8/12),
    MEDIUM: new Pollution("Unclean", 1, 8/12),
    SLIGHTLY_HIGH: new Pollution("Smoggy", 9/8, 8/12),
    HIGH: new Pollution("Polluted", 10/8, 8/12),
    VERY_HIGH: new Pollution("Toxic", 12/8, 8/12),
    EXTREMELY_HIGH: new Pollution("Hazardous", 16/8, 8/12),
    CHOKING: new Pollution("Uninhabitable", 32/8, 8/12),
})

const POLLUTION_LEVELS_ALL = Object.values(POLLUTION_LEVELS)
