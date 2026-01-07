/**
 * InterceptionRoute extends Route to calculate an interception path for a moving target.
 * Instead of just moving to where the target currently is, it predicts where the target
 * will be when we arrive, iteratively refining until convergence.
 */
class InterceptionRoute extends Route {
    /**
     * @param {Fleet} fleet - The pursuing fleet
     * @param {Fleet} targetFleet - The fleet to intercept
     * @param {number} startYear - The year when pursuit begins
     * @param {number} maxIterations - Maximum number of refinement iterations (default: 10)
     * @param {number} convergenceThreshold - Distance threshold for convergence in AU (default: 0.01)
     */
    constructor(fleet, targetFleet, startYear = gs.year, maxIterations = 10, convergenceThreshold = 0.01) {
        // Don't call super yet - we need to calculate interception point first
        // Store initial parameters
        const pursuingFleet = fleet
        const target = targetFleet
        
        // Calculate interception point
        const interceptionResult = InterceptionRoute.calculateInterceptionPoint(
            pursuingFleet, 
            target, 
            startYear, 
            maxIterations, 
            convergenceThreshold
        )
        
        if (!interceptionResult) {
            // Fallback: just create a normal route to target's current position
            console.warn('Failed to calculate interception, falling back to direct route')
            super(fleet, targetFleet, startYear)
            return
        }
        
        // Create a waypoint at the predicted interception point
        // //redicted interception point
        const interceptionWaypoint = {
            x: interceptionResult.x,
            y: interceptionResult.y,
            color: COLORS.Selection,
            isWaypoint: true,
            name: `Interception Point (${Math.round(interceptionResult.x * 100) / 100}, ${Math.round(interceptionResult.y * 100) / 100})`
        }
        
        // Now call super with the interception waypoint
        super(fleet, interceptionWaypoint, startYear, true) // Pass true for isInterception flag
        
        // Override with specific interception route UUID
        /** @type {string} */
        this.uuid = generateUUID('interception_')
        
        // Store additional information about the interception
        this.isInterception = true
        this.targetFleet = target
        this.targetRouteAtCreation = target.route // Store target's route at time of creation
        this.interceptionPoint = interceptionResult
        this.iterations = interceptionResult.iterations
        
        // Register this route in the gameRegistry
        gameRegistry.registerRoute(this)
    }
    
    /**
     * Calculates where a moving target will be, accounting for our travel time.
     * Uses iterative refinement to converge on an interception point.
     * 
     * @param {Fleet} pursuingFleet - The fleet doing the pursuing
     * @param {Fleet} targetFleet - The target fleet to intercept
     * @param {number} startYear - The starting year
     * @param {number} maxIterations - Maximum refinement iterations
     * @param {number} convergenceThreshold - Distance change threshold for convergence (AU)
     * @returns {{x: number, y: number, eta: number, iterations: number}|null} Interception point or null if impossible
     */
    static calculateInterceptionPoint(pursuingFleet, targetFleet, startYear, maxIterations, convergenceThreshold) {
        // If target has no route (docked or stationary), just return current position
        if (!targetFleet.route) {
            return {
                x: targetFleet.x,
                y: targetFleet.y,
                eta: 0,
                iterations: 0
            }
        }
        
        const pursuerSpeed = pursuingFleet.speed
        let currentPrediction = { x: targetFleet.x, y: targetFleet.y }
        let previousDistance = Infinity
        
        for (let iteration = 0; iteration < maxIterations; iteration++) {
            // Calculate distance to predicted position
            const dx = currentPrediction.x - pursuingFleet.x
            const dy = currentPrediction.y - pursuingFleet.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            
            // Calculate ETA based on distance and our speed
            const eta = distance / pursuerSpeed
            const arrivalYear = startYear + eta
            
            // Check if target's route will still be active at arrival
            if (targetFleet.route.endYear < arrivalYear) {
                // Target will have arrived at their destination before we can intercept
                // Intercept them at their destination instead
                return {
                    x: targetFleet.route.destination.x,
                    y: targetFleet.route.destination.y,
                    eta: arrivalYear - startYear,
                    iterations: iteration + 1
                }
            }
            
            // Predict where target will be at our ETA
            const targetPosition = targetFleet.route.positionAtYear(arrivalYear)
            const newPrediction = { x: targetPosition[0], y: targetPosition[1] }
            
            // Check for convergence
            const predictionChange = Math.sqrt(
                Math.pow(newPrediction.x - currentPrediction.x, 2) +
                Math.pow(newPrediction.y - currentPrediction.y, 2)
            )
            
            // If prediction isn't changing much, we've converged
            if (predictionChange < convergenceThreshold) {
                return {
                    x: newPrediction.x,
                    y: newPrediction.y,
                    eta: eta,
                    iterations: iteration + 1
                }
            }
            
            // Check if we're getting further away (might indicate impossible interception)
            if (distance > previousDistance * 1.5) {
                console.warn('Interception distance increasing - target may be too fast')
                // Still continue, but this might indicate the target is faster than us
            }
            
            previousDistance = distance
            currentPrediction = newPrediction
        }
        
        // Reached max iterations without convergence
        console.warn(`Interception calculation didn't converge after ${maxIterations} iterations`)
        
        // Return best guess
        return {
            x: currentPrediction.x,
            y: currentPrediction.y,
            eta: previousDistance / pursuerSpeed,
            iterations: maxIterations
        }
    }
}
