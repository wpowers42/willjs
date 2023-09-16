import { Game } from './Game.js';
import { View } from './view.js';
import { Card } from './Card.js';

export class Controller {
    private game: Game;
    private view: View;

    constructor() {
        this.game = new Game();
        this.view = new View(this.game);

        this.attachEventListeners();
    }

    attachEventListeners(): void {
        this.boardClickEventListener();
        this.resetGameEventListener();
        // Add other listeners as needed, e.g., for game settings, pausing, etc.
    }

    private boardClickEventListener(): void {
        const boardElement = document.getElementById('board');
        boardElement!.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;

            if (target.classList.contains('card')) {
                const cardElements = Array.from(boardElement!.getElementsByClassName('card'));
                const cardIndex = cardElements.indexOf(target);

                if (cardIndex !== -1) {
                    const selectedCard = this.game.board[cardIndex];
                    this.handleCardSelection(selectedCard);
                }
            }
        });
    }

    private handleCardSelection(card: Card): void {
        if (this.game.selectCard(card)) {
            this.view.render();
            this.checkForEndOfGame();
        } else {
            this.view.showInvalidSetMessage();
            this.view.render();
        }
    }

    private checkForEndOfGame(): void {
        if (this.game.board.length === 0) {
            alert('Game Over! You\'ve found all the sets!');
            this.resetGame();
        }
    }

    private resetGameEventListener(): void {
        const resetButton = document.getElementById('reset-button');
        resetButton!.addEventListener('click', () => {
            this.resetGame();
        });
    }

    private resetGame(): void {
        this.game = new Game();
        this.view = new View(this.game);
        this.attachEventListeners();
    }
}
