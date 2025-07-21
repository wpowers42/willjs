/**
 * Collision detection utilities for the game
 */

import Vector2 from './Vector2.js';

/**
 * Check if a point is inside a circle
 * @param {number} px - Point x coordinate
 * @param {number} py - Point y coordinate
 * @param {number} cx - Circle center x
 * @param {number} cy - Circle center y
 * @param {number} radius - Circle radius
 * @returns {boolean} True if point is inside circle
 */
export function pointInCircle(px, py, cx, cy, radius) {
    const dx = px - cx;
    const dy = py - cy;
    return (dx * dx + dy * dy) <= (radius * radius);
}

/**
 * Check collision between two circles
 * @param {number} x1 - First circle x
 * @param {number} y1 - First circle y
 * @param {number} r1 - First circle radius
 * @param {number} x2 - Second circle x
 * @param {number} y2 - Second circle y
 * @param {number} r2 - Second circle radius
 * @returns {boolean} True if circles collide
 */
export function circleCircle(x1, y1, r1, x2, y2, r2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= (r1 + r2);
}

/**
 * Check collision between two circles using squared distance (more efficient)
 * @param {number} x1 - First circle x
 * @param {number} y1 - First circle y
 * @param {number} r1 - First circle radius
 * @param {number} x2 - Second circle x
 * @param {number} y2 - Second circle y
 * @param {number} r2 - Second circle radius
 * @returns {boolean} True if circles collide
 */
export function circleCircleFast(x1, y1, r1, x2, y2, r2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distanceSquared = dx * dx + dy * dy;
    const radiusSum = r1 + r2;
    return distanceSquared <= (radiusSum * radiusSum);
}

/**
 * Check if a point is inside a rectangle
 * @param {number} px - Point x coordinate
 * @param {number} py - Point y coordinate
 * @param {number} rx - Rectangle x coordinate
 * @param {number} ry - Rectangle y coordinate
 * @param {number} rw - Rectangle width
 * @param {number} rh - Rectangle height
 * @returns {boolean} True if point is inside rectangle
 */
export function pointInRect(px, py, rx, ry, rw, rh) {
    return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}

/**
 * Check collision between two rectangles
 * @param {number} x1 - First rectangle x
 * @param {number} y1 - First rectangle y
 * @param {number} w1 - First rectangle width
 * @param {number} h1 - First rectangle height
 * @param {number} x2 - Second rectangle x
 * @param {number} y2 - Second rectangle y
 * @param {number} w2 - Second rectangle width
 * @param {number} h2 - Second rectangle height
 * @returns {boolean} True if rectangles collide
 */
export function rectRect(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
}

/**
 * Check collision between a circle and a rectangle
 * @param {number} cx - Circle center x
 * @param {number} cy - Circle center y
 * @param {number} cr - Circle radius
 * @param {number} rx - Rectangle x
 * @param {number} ry - Rectangle y
 * @param {number} rw - Rectangle width
 * @param {number} rh - Rectangle height
 * @returns {boolean} True if circle and rectangle collide
 */
export function circleRect(cx, cy, cr, rx, ry, rw, rh) {
    // Find the closest point on the rectangle to the circle center
    const closestX = Math.max(rx, Math.min(cx, rx + rw));
    const closestY = Math.max(ry, Math.min(cy, ry + rh));
    
    // Calculate distance from circle center to closest point
    const dx = cx - closestX;
    const dy = cy - closestY;
    
    return (dx * dx + dy * dy) <= (cr * cr);
}

/**
 * Check if a point is inside a line segment with thickness
 * @param {number} px - Point x
 * @param {number} py - Point y
 * @param {number} x1 - Line start x
 * @param {number} y1 - Line start y
 * @param {number} x2 - Line end x
 * @param {number} y2 - Line end y
 * @param {number} thickness - Line thickness
 * @returns {boolean} True if point is on line
 */
export function pointOnLine(px, py, x1, y1, x2, y2, thickness = 1) {
    const distance = distanceToLine(px, py, x1, y1, x2, y2);
    return distance <= thickness / 2;
}

/**
 * Calculate distance from a point to a line segment
 * @param {number} px - Point x
 * @param {number} py - Point y
 * @param {number} x1 - Line start x
 * @param {number} y1 - Line start y
 * @param {number} x2 - Line end x
 * @param {number} y2 - Line end y
 * @returns {number} Distance to line
 */
export function distanceToLine(px, py, x1, y1, x2, y2) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    
    if (lenSq === 0) {
        // Line is actually a point
        return Math.sqrt(A * A + B * B);
    }
    
    let param = dot / lenSq;
    
    let xx, yy;
    
    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }
    
    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check line intersection
 * @param {number} x1 - First line start x
 * @param {number} y1 - First line start y
 * @param {number} x2 - First line end x
 * @param {number} y2 - First line end y
 * @param {number} x3 - Second line start x
 * @param {number} y3 - Second line start y
 * @param {number} x4 - Second line end x
 * @param {number} y4 - Second line end y
 * @returns {Object|null} Intersection point or null
 */
export function lineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    
    if (Math.abs(denom) < 0.0001) {
        return null; // Lines are parallel
    }
    
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
    
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        return {
            x: x1 + t * (x2 - x1),
            y: y1 + t * (y2 - y1)
        };
    }
    
    return null;
}

/**
 * Collision detection using bounding boxes for quick elimination
 * @param {Object} obj1 - First object with position and size
 * @param {Object} obj2 - Second object with position and size
 * @returns {boolean} True if bounding boxes overlap
 */
export function boundingBoxCheck(obj1, obj2) {
    const margin = 10; // Small margin for safety
    
    return obj1.position.x - obj1.size - margin < obj2.position.x + obj2.size + margin &&
           obj1.position.x + obj1.size + margin > obj2.position.x - obj2.size - margin &&
           obj1.position.y - obj1.size - margin < obj2.position.y + obj2.size + margin &&
           obj1.position.y + obj1.size + margin > obj2.position.y - obj2.size - margin;
}

/**
 * Spatial hash grid for efficient collision detection
 */
export class SpatialGrid {
    constructor(cellSize = 50) {
        this.cellSize = cellSize;
        this.grid = new Map();
    }

    /**
     * Clear the grid
     */
    clear() {
        this.grid.clear();
    }

    /**
     * Get grid cell key for position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {string} Cell key
     */
    getCellKey(x, y) {
        const cellX = Math.floor(x / this.cellSize);
        const cellY = Math.floor(y / this.cellSize);
        return `${cellX},${cellY}`;
    }

    /**
     * Insert object into grid
     * @param {Object} obj - Object with position property
     */
    insert(obj) {
        const key = this.getCellKey(obj.position.x, obj.position.y);
        if (!this.grid.has(key)) {
            this.grid.set(key, []);
        }
        this.grid.get(key).push(obj);
    }

    /**
     * Get nearby objects
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} radius - Search radius
     * @returns {Array} Array of nearby objects
     */
    getNearby(x, y, radius = this.cellSize) {
        const nearby = [];
        const cellRadius = Math.ceil(radius / this.cellSize);
        const centerX = Math.floor(x / this.cellSize);
        const centerY = Math.floor(y / this.cellSize);

        for (let dx = -cellRadius; dx <= cellRadius; dx++) {
            for (let dy = -cellRadius; dy <= cellRadius; dy++) {
                const key = `${centerX + dx},${centerY + dy}`;
                if (this.grid.has(key)) {
                    nearby.push(...this.grid.get(key));
                }
            }
        }

        return nearby;
    }
}