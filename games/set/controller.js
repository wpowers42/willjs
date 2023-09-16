import { Game } from './Game.js';
import { View } from './view.js';
export class Controller {
    constructor() {
        this.game = new Game();
        this.view = new View(this.game);
        this.attachEventListeners();
    }
    attachEventListeners() {
        this.boardClickEventListener();
        this.resetGameEventListener();
        // Add other listeners as needed, e.g., for game settings, pausing, etc.
    }
    boardClickEventListener() {
        const boardElement = document.getElementById('board');
        boardElement.addEventListener('click', (e) => {
            const target = e.target;
            if (target.classList.contains('card')) {
                const cardElements = Array.from(boardElement.getElementsByClassName('card'));
                const cardIndex = cardElements.indexOf(target);
                if (cardIndex !== -1) {
                    const selectedCard = this.game.board[cardIndex];
                    this.handleCardSelection(selectedCard);
                }
            }
        });
    }
    handleCardSelection(card) {
        if (this.game.selectCard(card)) {
            this.view.render();
            this.checkForEndOfGame();
        }
        else {
            this.view.showInvalidSetMessage();
            this.view.render();
        }
    }
    checkForEndOfGame() {
        if (this.game.board.length === 0) {
            alert('Game Over! You\'ve found all the sets!');
            this.resetGame();
        }
    }
    resetGameEventListener() {
        const resetButton = document.getElementById('reset-button');
        resetButton.addEventListener('click', () => {
            this.resetGame();
        });
    }
    resetGame() {
        this.game = new Game();
        this.view = new View(this.game);
        this.attachEventListeners();
    }
}
//# sourceMappingURL=controller.js.map