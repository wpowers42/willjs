/**
 * Store class - Manages upgrades and purchases for the space defense system
 * Includes city repair and defense upgrades
 */

export default class Store {
    constructor(game) {
        this.game = game;
        
        // Store items with costs and descriptions
        this.items = {
            repair: {
                name: "Repair City",
                description: "Restore 3 health points to the city",
                baseCost: 50,
                costMultiplier: 1.2,
                purchaseCount: 0,
                maxPurchases: -1, // Unlimited
                category: "city"
            },
            fireRate: {
                name: "Faster Firing",
                description: "Increase defense fire rate by 15%",
                baseCost: 100,
                costMultiplier: 1.5,
                purchaseCount: 0,
                maxPurchases: 10,
                category: "defense"
            },
            damage: {
                name: "More Damage",
                description: "Increase projectile damage by 1",
                baseCost: 150,
                costMultiplier: 1.6,
                purchaseCount: 0,
                maxPurchases: -1, // Unlimited
                category: "defense"
            },
            multiShot: {
                name: "Multi-Shot",
                description: "Fire additional projectiles",
                baseCost: 200,
                costMultiplier: 2.0,
                purchaseCount: 0,
                maxPurchases: 5,
                category: "defense"
            },
            cityShield: {
                name: "Shield Upgrade",
                description: "Increase city shield capacity",
                baseCost: 300,
                costMultiplier: 1.8,
                purchaseCount: 0,
                maxPurchases: 3,
                category: "city"
            }
        };
        
        this.isOpen = false;
    }

    /**
     * Get current cost of an item
     * @param {string} itemId - Item identifier
     * @returns {number} Current cost
     */
    getItemCost(itemId) {
        const item = this.items[itemId];
        if (!item) return 0;
        
        return Math.floor(item.baseCost * Math.pow(item.costMultiplier, item.purchaseCount));
    }

    /**
     * Check if player can afford an item
     * @param {string} itemId - Item identifier
     * @returns {boolean} True if affordable
     */
    canAfford(itemId) {
        return this.game.score >= this.getItemCost(itemId);
    }

    /**
     * Check if item is available for purchase
     * @param {string} itemId - Item identifier
     * @returns {boolean} True if available
     */
    isAvailable(itemId) {
        const item = this.items[itemId];
        if (!item) return false;
        
        if (item.maxPurchases === -1) return true; // Unlimited
        return item.purchaseCount < item.maxPurchases;
    }

    /**
     * Purchase an item
     * @param {string} itemId - Item identifier
     * @returns {boolean} True if purchase successful
     */
    purchase(itemId) {
        if (!this.canAfford(itemId) || !this.isAvailable(itemId)) {
            return false;
        }

        const item = this.items[itemId];
        const cost = this.getItemCost(itemId);

        // Deduct cost
        this.game.score -= cost;
        item.purchaseCount++;

        // Apply the upgrade
        return this.applyUpgrade(itemId);
    }

    /**
     * Apply the upgrade effect
     * @param {string} itemId - Item identifier
     * @returns {boolean} True if upgrade applied successfully
     */
    applyUpgrade(itemId) {
        const item = this.items[itemId];
        
        switch (itemId) {
            case 'repair':
                return this.game.city.repairCity(3);
                
            case 'fireRate':
            case 'damage':
            case 'multiShot':
                return this.game.city.applyDefenseUpgrade(itemId);
                
            case 'cityShield':
                // Upgrade city shield
                this.game.city.maxShieldHealth += 3;
                this.game.city.shieldHealth = this.game.city.maxShieldHealth;
                return true;
                
            default:
                return false;
        }
    }

    /**
     * Get all available items with their status
     * @returns {Array} Array of item objects with purchase info
     */
    getAvailableItems() {
        const items = [];
        
        for (const [itemId, item] of Object.entries(this.items)) {
            if (this.isAvailable(itemId)) {
                items.push({
                    id: itemId,
                    name: item.name,
                    description: item.description,
                    cost: this.getItemCost(itemId),
                    affordable: this.canAfford(itemId),
                    category: item.category,
                    purchaseCount: item.purchaseCount,
                    maxPurchases: item.maxPurchases
                });
            }
        }
        
        return items.sort((a, b) => a.cost - b.cost); // Sort by cost
    }

    /**
     * Open the store
     */
    open() {
        this.isOpen = true;
        this.game.isPaused = true;
        
        // Show store UI (this would integrate with existing pause screen)
        this.showStoreUI();
    }

    /**
     * Close the store
     */
    close() {
        this.isOpen = false;
        this.game.isPaused = false;
        
        // Hide store UI
        this.hideStoreUI();
    }

    /**
     * Show store UI (placeholder - would integrate with existing UI system)
     */
    showStoreUI() {
        // This would be implemented with the existing UI system
        // For now, just log available items
        console.log('=== SPACE DEFENSE STORE ===');
        console.log('Current Score:', this.game.score);
        console.log('Available Items:');
        
        const items = this.getAvailableItems();
        items.forEach(item => {
            const status = item.affordable ? '[AFFORDABLE]' : '[TOO EXPENSIVE]';
            const purchases = item.maxPurchases === -1 ? 
                `(${item.purchaseCount} purchased)` : 
                `(${item.purchaseCount}/${item.maxPurchases})`;
            
            console.log(`${item.name} - ${item.cost} points ${status} ${purchases}`);
            console.log(`  ${item.description}`);
        });
        console.log('Press S to close store');
        console.log('==========================');
    }

    /**
     * Hide store UI
     */
    hideStoreUI() {
        console.log('Store closed');
    }

    /**
     * Handle key press for store navigation
     * @param {string} keyCode - Key code pressed
     */
    handleKeyPress(keyCode) {
        if (!this.isOpen) return false;
        
        switch (keyCode) {
            case 'KeyS':
                this.close();
                return true;
                
            case 'Digit1':
                this.quickPurchase(0);
                return true;
                
            case 'Digit2':
                this.quickPurchase(1);
                return true;
                
            case 'Digit3':
                this.quickPurchase(2);
                return true;
                
            case 'Digit4':
                this.quickPurchase(3);
                return true;
                
            case 'Digit5':
                this.quickPurchase(4);
                return true;
                
            default:
                return false;
        }
    }

    /**
     * Quick purchase by item index
     * @param {number} index - Index in available items list
     */
    quickPurchase(index) {
        const items = this.getAvailableItems();
        if (index >= 0 && index < items.length) {
            const item = items[index];
            if (this.purchase(item.id)) {
                console.log(`Purchased: ${item.name} for ${item.cost} points`);
                this.showStoreUI(); // Refresh display
            } else {
                console.log(`Cannot purchase: ${item.name}`);
            }
        }
    }

    /**
     * Get store statistics
     * @returns {Object} Store stats
     */
    getStats() {
        const totalPurchases = Object.values(this.items)
            .reduce((sum, item) => sum + item.purchaseCount, 0);
        
        const totalSpent = Object.entries(this.items)
            .reduce((sum, [itemId, item]) => {
                let itemTotal = 0;
                for (let i = 0; i < item.purchaseCount; i++) {
                    itemTotal += Math.floor(item.baseCost * Math.pow(item.costMultiplier, i));
                }
                return sum + itemTotal;
            }, 0);
        
        return {
            totalPurchases,
            totalSpent,
            isOpen: this.isOpen,
            availableItems: this.getAvailableItems().length
        };
    }
}