/**
 * @fileoverview Shape generators for different ship types.
 * Each function returns a Polygon instance with normalized vertices.
 */

class ShipShape {
    constructor(positiveAreas = [], negativeAreas = []) {
        this.positiveAreas = positiveAreas;
        this.negativeAreas = negativeAreas;
    }

    /**
     * Creates polygon canvas objects from this ship shape
     * @param {Array<number>} color - RGBA color array for positive areas [r, g, b, a]
     * @param {number} size - Scale factor to multiply vertices by
     * @returns {Array<CanvasObject>} Array of CanvasObject instances with SHAPES.Polygon
     */
    toPolygons(color, size) {
        if (!color || !size) throw new Error('ShipShape.toPolygons requires color and size parameters')
        const polygons = []
        
        // Add positive areas with lower z-index (rendered first, behind)
        this.positiveAreas.forEach((area, index) => {
            polygons.push(new CanvasObject({
                id: `positive-${index}`,
                shape: SHAPES.Polygon,
                x: 0,
                y: 0,
                size: 1, // Size is already baked into vertices
                vertices: area, // Use original vertices, CanvasObject will scale them
                fillColor: [...color],
                strokeColor: null,
                zIndex: 0
            }))
        })
        
        // Add negative areas with higher z-index (rendered on top) in black
        this.negativeAreas.forEach((area, index) => {
            polygons.push(new CanvasObject({
                id: `negative-${index}`,
                shape: SHAPES.Polygon,
                x: 0,
                y: 0,
                size: 1, // Size is already baked into vertices
                vertices: area, // Use original vertices, CanvasObject will scale them
                fillColor: [0, 0, 0, 255], // Black
                strokeColor: null,
                zIndex: 1
            }))
        })
        
        return polygons
    }
}

const SHIP_SHAPES = {
    COURIER: new ShipShape(
        [
            [
                [ 0.95,  0.00],   // Nose
                [ 0.80,  0.18],
                [ 0.40,  0.30],
                [-0.30,  0.30],
                [-0.65,  0.20],
                [-0.85,  0.10],
                [-0.95,  0.00],   // Engine end (top)
                [-0.85, -0.10],
                [-0.65, -0.20],
                [-0.30, -0.30],
                [ 0.40, -0.30],
                [ 0.80, -0.18],
                [ 0.95,  0.00]
            ],
            [
                [ 0.20,  0.30],
                [-0.10,  0.45],
                [-0.35,  0.42],
                [-0.15,  0.30],
                [ 0.20,  0.30]
            ],
            [
                [ 0.15, -0.30],
                [-0.05, -0.42],
                [-0.28, -0.38],
                [-0.10, -0.30],
                [ 0.15, -0.30],
            ],
            [
                [-0.80,  0.15],
                [-1.00,  0.08],
                [-1.00, -0.08],
                [-0.80, -0.15],
                [-0.80,  0.15]
            ]
        ],
        [
            [
                [ 0.65,  0.10],
                [ 0.50,  0.15],
                [ 0.45,  0.05],
                [ 0.50, -0.05],
                [ 0.65, -0.02],
                [ 0.65,  0.10]
            ],
            [
                [ 0.10,  0.12],
                [-0.10,  0.12],
                [-0.10, -0.12],
                [ 0.10, -0.12],
                [ 0.10,  0.12]
            ],
            [
                [-0.85,  0.05],
                [-0.93,  0.02],
                [-0.93, -0.02],
                [-0.85, -0.05],
                [-0.85,  0.05]
            ],
            [
                [-0.05,  0.36],
                [-0.20,  0.40],
                [-0.18,  0.34],
                [-0.05,  0.30],
                [-0.05,  0.36]
            ]
        ]
    )
}

