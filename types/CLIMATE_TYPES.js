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
        this.coloredName = statColorSpan(this.name, this.score, true)
    }
    
    static scoreClimateValue(value = 1.0) {
        //at 1.0, return 4. at 0 return 0. at 4 return 0. linear in between
        if (value <= 1.0) return value * 4
        else if (value >=4.0) return 0
        else return (4.0 - value) * (4.0 / 3.0)
    }
}


class AtmosphericPressure extends ClimateValue {}
class Temperature extends ClimateValue {}
class Gravity extends ClimateValue {}
class OceanCoverage extends ClimateValue {}
class GeologicalActivity extends ClimateValue {}
class Magnetosphere extends ClimateValue {}
class RadiationLevel extends ClimateValue {}

const ATMOSPHERIC_PRESSURES = Object.freeze({
    NONE: new AtmosphericPressure("None", 0),
    EXTREMELY_LOW: new AtmosphericPressure("Extremely Low", 8/16),
    VERY_LOW: new AtmosphericPressure("Very Low", 8/12),
    LOW: new AtmosphericPressure("Low", 8/10),
    SLIGHTLY_LOW: new AtmosphericPressure("Slightly Low", 8/9),
    MEDIUM: new AtmosphericPressure("Medium", 1),
    SLIGHTLY_HIGH: new AtmosphericPressure("Slightly High", 9/8),
    HIGH: new AtmosphericPressure("High", 10/8),
    VERY_HIGH: new AtmosphericPressure("Very High", 12/8),
    EXTREMELY_HIGH: new AtmosphericPressure("Extremely High", 16/8),
    CRUSHING: new AtmosphericPressure("Crushing", 32/8),
})

const ATMOSPHERIC_PRESSURES_ALL = Object.values(ATMOSPHERIC_PRESSURES)

const TEMPERATURES = Object.freeze({
    NONE: new Temperature("None", 0),
    FROZEN: new Temperature("Frozen", 8/16),
    FRIGID: new Temperature("Frigid", 8/12),
    COLD: new Temperature("Cold", 8/10),
    COOL: new Temperature("Cool", 8/9),
    TEMPERATE: new Temperature("Temperate", 1),
    WARM: new Temperature("Warm", 9/8),
    HOT: new Temperature("Hot", 10/8),
    SCORCHING: new Temperature("Scorching", 12/8),
    INFERNAL: new Temperature("Infernal", 16/8),
    MOLTEN: new Temperature("Molten", 32/8),
})

const TEMPERATURES_ALL = Object.values(TEMPERATURES)

const GRAVITIES = Object.freeze({
    NONE: new Gravity("None", 0),
    EXTREMELY_LOW: new Gravity("Extremely Low", 8/16),
    VERY_LOW: new Gravity("Very Low", 8/12),
    LOW: new Gravity("Low", 8/10),
    SLIGHTLY_LOW: new Gravity("Slightly Low", 8/9),
    STANDARD: new Gravity("Standard", 1),
    SLIGHTLY_HIGH: new Gravity("Slightly High", 9/8),
    HIGH: new Gravity("High", 10/8),
    VERY_HIGH: new Gravity("Very High", 12/8),
    EXTREMELY_HIGH: new Gravity("Extremely High", 16/8),
    CRUSHING: new Gravity("Crushing", 32/8),
})

const GRAVITIES_ALL = Object.values(GRAVITIES)

const OCEAN_COVERAGES = Object.freeze({
    NONE: new OceanCoverage("None", 0),
    TRACE: new OceanCoverage("Trace", 8/16),
    MINIMAL: new OceanCoverage("Minimal", 8/12),
    LOW: new OceanCoverage("Low", 8/10),
    MODERATE: new OceanCoverage("Moderate", 8/9),
    MEDIUM: new OceanCoverage("Medium", 1),
    EXTENSIVE: new OceanCoverage("Extensive", 9/8),
    VAST: new OceanCoverage("Vast", 10/8),
    OCEANIC: new OceanCoverage("Oceanic", 12/8),
    GLOBAL_OCEAN: new OceanCoverage("Global Ocean", 16/8),
    SUBMERGED: new OceanCoverage("Submerged", 32/8),
})

const OCEAN_COVERAGES_ALL = Object.values(OCEAN_COVERAGES)

const GEOLOGICAL_ACTIVITIES = Object.freeze({
    NONE: new GeologicalActivity("None", 0),
    DORMANT: new GeologicalActivity("Dormant", 8/16),
    MINIMAL: new GeologicalActivity("Minimal", 8/12),
    LOW: new GeologicalActivity("Low", 8/10),
    SLIGHT: new GeologicalActivity("Slight", 8/9),
    MODERATE: new GeologicalActivity("Moderate", 1),
    ACTIVE: new GeologicalActivity("Active", 9/8),
    HIGHLY_ACTIVE: new GeologicalActivity("Highly Active", 10/8),
    VOLCANIC: new GeologicalActivity("Volcanic", 12/8),
    CATACLYSMIC: new GeologicalActivity("Cataclysmic", 16/8),
    HELLSCAPE: new GeologicalActivity("Hellscape", 32/8),
})

const GEOLOGICAL_ACTIVITIES_ALL = Object.values(GEOLOGICAL_ACTIVITIES)

const MAGNETOSPHERES = Object.freeze({
    NONE: new Magnetosphere("None", 0),
    NEGLIGIBLE: new Magnetosphere("Negligible", 8/16),
    WEAK: new Magnetosphere("Weak", 8/12),
    LOW: new Magnetosphere("Low", 8/10),
    MODERATE: new Magnetosphere("Moderate", 8/9),
    STANDARD: new Magnetosphere("Standard", 1),
    STRONG: new Magnetosphere("Strong", 9/8),
    VERY_STRONG: new Magnetosphere("Very Strong", 10/8),
    POWERFUL: new Magnetosphere("Powerful", 12/8),
    EXTREME: new Magnetosphere("Extreme", 16/8),
    IMPENETRABLE: new Magnetosphere("Impenetrable", 32/8),
})

const MAGNETOSPHERES_ALL = Object.values(MAGNETOSPHERES)

const RADIATION_LEVELS = Object.freeze({
    NONE: new RadiationLevel("None", 0),
    MINIMAL: new RadiationLevel("Minimal", 8/16),
    LOW: new RadiationLevel("Low", 8/12),
    MODERATE: new RadiationLevel("Moderate", 8/10),
    ELEVATED: new RadiationLevel("Elevated", 8/9),
    STANDARD: new RadiationLevel("Standard", 1),
    HIGH: new RadiationLevel("High", 9/8),
    VERY_HIGH: new RadiationLevel("Very High", 10/8),
    EXTREME: new RadiationLevel("Extreme", 12/8),
    LETHAL: new RadiationLevel("Lethal", 16/8),
    APOCALYPTIC: new RadiationLevel("Apocalyptic", 32/8),
})

const RADIATION_LEVELS_ALL = Object.values(RADIATION_LEVELS)
