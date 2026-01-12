/**
 * Space Shooter Game - Main Entry Point
 * Initializes the game and handles UI interactions
 */

import Game from './src/Game.js';

class SpaceShooterApp {
    constructor() {
        this.game = null;
        this.canvas = null;

        // Bind methods
        this.init = this.init.bind(this);
        this.setupUI = this.setupUI.bind(this);
        this.handleResize = this.handleResize.bind(this);

        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', this.init);
        } else {
            this.init();
        }
    }

    /**
     * Initialize the application
     */
    init() {
        console.log('Initializing Space Shooter...');

        // Get canvas element
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error('Canvas element not found!');
            return;
        }

        // Set up canvas
        this.setupCanvas();

        // Set up UI event handlers
        this.setupUI();

        // Set up window event handlers
        this.setupWindowEvents();

        // Create and start the game
        this.createGame();

        console.log('Space Shooter initialized successfully');
    }

    /**
     * Set up canvas properties
     */
    setupCanvas() {
        const ctx = this.canvas.getContext('2d');

        // Disable image smoothing for pixel-perfect rendering
        ctx.imageSmoothingEnabled = false;

        // Use simple canvas setup to avoid coordinate issues
        // Set canvas internal size to match CSS size
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;

        // Ensure canvas style matches actual size
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }

    /**
     * Set up UI event handlers
     */
    setupUI() {
        // Resume button
        const resumeBtn = document.getElementById('resume-btn');
        if (resumeBtn) {
            resumeBtn.addEventListener('click', () => {
                if (this.game) {
                    this.game.togglePause();
                }
            });
        }


        // Restart button
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                if (this.game) {
                    this.game.restart();
                }
            });
        }

        // Handle clicks outside of modals to close them
        this.setupModalHandlers();
    }

    /**
     * Set up modal click handlers
     */
    setupModalHandlers() {
        const pauseScreen = document.getElementById('pause-screen');

        // Close pause screen when clicking outside content
        if (pauseScreen) {
            pauseScreen.addEventListener('click', (e) => {
                if (e.target === pauseScreen && this.game) {
                    this.game.togglePause();
                }
            });
        }


        // Prevent pause screen from closing when clicking content
        const pauseContent = document.querySelector('.pause-content');
        if (pauseContent) {
            pauseContent.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    }

    /**
     * Set up window event handlers
     */
    setupWindowEvents() {
        // Handle window resize
        window.addEventListener('resize', this.handleResize);

        // Handle visibility change (pause when tab is hidden)
        document.addEventListener('visibilitychange', () => {
            if (this.game && !this.game.isPaused && document.hidden) {
                this.game.togglePause();
            }
        });

        // Prevent spacebar from scrolling the page
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && e.target === document.body) {
                e.preventDefault();
            }
        });
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Debounce resize events
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.setupCanvas();
            // Update game dimensions if game exists
            if (this.game && this.game.updateDimensions) {
                this.game.updateDimensions();
            }
        }, 100);
    }

    /**
     * Create and start the game
     */
    createGame() {
        if (this.game) {
            this.game.destroy();
        }

        this.game = new Game(this.canvas);
        this.game.start();

        // Set up game event handlers
        this.setupGameEvents();
    }

    /**
     * Set up game-specific event handlers
     */
    setupGameEvents() {
        // This can be extended to handle custom game events
        // For example, when the game wants to show/hide UI elements
    }



    /**
     * Handle application errors
     */
    handleError(error) {
        console.error('Space Shooter Error:', error);

        // Show user-friendly error message
        const errorMessage = document.createElement('div');
        errorMessage.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #ff4444;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 1000;
            font-family: Arial, sans-serif;
        `;
        errorMessage.textContent = 'An error occurred. Please refresh the page.';

        document.body.appendChild(errorMessage);

        // Remove error message after 5 seconds
        setTimeout(() => {
            if (errorMessage.parentNode) {
                errorMessage.parentNode.removeChild(errorMessage);
            }
        }, 5000);
    }

    /**
     * Clean up resources
     */
    destroy() {
        if (this.game) {
            this.game.destroy();
            this.game = null;
        }

        window.removeEventListener('resize', this.handleResize);

        clearTimeout(this.resizeTimeout);
    }
}

// Global error handling
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

// Initialize the application
const app = new SpaceShooterApp();

// Export for debugging purposes
window.spaceShooterApp = app;
