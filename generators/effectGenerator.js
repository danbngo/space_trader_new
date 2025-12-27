/**
 * Generates environmental effects for an encounter map.
 * @param {EncounterType} encounterType - The type of encounter.
 * @param {EffectType[]} effectTypes - Array of effect types to generate from.
 * @returns {Effect[]} Array of generated effects.
 */
function generateEffects(encounterType, effectTypes = EFFECT_TYPES_ALL) {
    const mapRadius = encounterType.mapRadius
    const effects = []
    //now that effectTypes is an array and not a list, we want to generate only a few per effect
    const numToGenerate = effectTypes.length*2//rng(15, 5, false)

    function isTooCloseToExistingEffect(newEffect, minDistance = -15) {
        for (const effect of effects) {
            const dist = calcDistance(newEffect.x, newEffect.y, effect.x, effect.y)
            if (dist < effect.radius + newEffect.radius + minDistance) return true
        }
        return false
    }

    for (let i = 0; i < numToGenerate; i++) {
        const effectType = rndMember(effectTypes)
        const dist = mapRadius * (0.5 + rng(0.5, 0, false)) //bias away from center
        let effect;

        if (effectType.shape === SHAPES.FilledOval) {
            let [x,y] = rotatePoint(dist, 0, 0, 0, rng(Math.PI*2, -Math.PI*2, false))
            const dist2 = mapRadius * (0.5 + rng(0.5, 0, false)) //bias away from center
            let [toX,toY] = rotatePoint(dist2, 0, 0, 0, rng(Math.PI*2, -Math.PI*2, false))
            //beams are cooler when they go REALLY far
            //if effect would overlap with existing, skip it
            effect = generateEffect(effectType, x, y, toX, toY)
            if (isTooCloseToExistingEffect(effect)) continue
        }
        else if (effectType.shape == SHAPES.FilledRectangle) {
            //make beams very long - extend 4x map radius in both directions from center point
            let [cx,cy] = rotatePoint(dist, 0, 0, 0, rng(Math.PI*2, -Math.PI*2, false))
            const angle = rng(Math.PI*2, -Math.PI*2, false)
            const beamExtent = mapRadius * 4 // Extend 4x map radius from center
            // Calculate start and end points that extend far in both directions through cx,cy
            const x = cx - Math.cos(angle) * beamExtent
            const y = cy - Math.sin(angle) * beamExtent
            const toX = cx + Math.cos(angle) * beamExtent
            const toY = cy + Math.sin(angle) * beamExtent
            effect = generateEffect(effectType, x, y, toX, toY)
        }

        //effects should be permanent
        effect.remainingTurns = null
        effect.duration = null
        effect.angle = normalizeAngle(Math.random()*Math.PI*2)
        effects.push(effect)
    }
    return effects
}

function generateEffect(effectType = rndMember(EFFECT_TYPES_ALL), x = 0, y = 0, toX = null, toY = null) {
    let effect;
    if (effectType === EFFECT_TYPES.ION_CLOUD) {
        effect = new IonCloudEffect(x, y)
    }
    else if (effectType === EFFECT_TYPES.DEBRIS_CLOUD) {
        effect = new DebrisCloudEffect(x, y)
    }
    else if (effectType === EFFECT_TYPES.ICE_CLOUD) {
        effect = new IceCloudEffect(x, y)
    }
    else if (effectType === EFFECT_TYPES.PLASMA_TRAIL) {
        effect = new PlasmaTrailEffect(x, y, toX, toY)
    }
    effect.radius *= rng(AMBIENT_EFFECT_MAX_RADIUS_MODIFIER, AMBIENT_EFFECT_MIN_RADIUS_MODIFIER)
    return effect
}