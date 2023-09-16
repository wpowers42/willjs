import { Game } from './Game.js';
import { Card, Color, Shape, Fill, CardNumber } from './Card.js';

export class View {
    private game: Game;
    private boardElement: HTMLElement;

    constructor(game: Game) {
        this.game = game;
        this.boardElement = document.getElementById('board')!;
        this.render();
    }

    render(): void {
        this.boardElement.innerHTML = '';

        this.game.board.forEach(card => {
            const cardElem = this.createCardElement(card);
            this.boardElement.appendChild(cardElem);
        });
    }

    private createCardElement(card: Card): HTMLElement {
        const cardElem = document.createElement('div');
        cardElem.className = 'card';

        // Add color, shape, fill, and number styles
        cardElem.style.color = this.getColor(card.color);
        cardElem.classList.add(this.getShapeClass(card.shape));
        cardElem.classList.add(this.getFillClass(card.fill));

        for (let i = 0; i < card.cardNumber; i++) {
            const shapeElem = document.createElement('div');
            shapeElem.classList.add('shape');
            cardElem.appendChild(shapeElem);
        }

        // Highlight selected cards
        if (this.game.selectedCards.includes(card)) {
            cardElem.classList.add('selected');
        }

        cardElem.addEventListener('click', () => {
            if (this.game.selectCard(card)) {
                this.render();  // Re-render view if a card is selected
            } else {
                this.showInvalidSetMessage();
            }
        });

        return cardElem;
    }

    private getColor(color: Color): string {
        switch (color) {
            case Color.RED: return 'red';
            case Color.GREEN: return 'green';
            case Color.PURPLE: return 'purple';
            default: return 'black';  // Default color if something goes wrong
        }
    }

    private getShapeClass(shape: Shape): string {
        switch (shape) {
            case Shape.DIAMOND: return 'diamond';
            case Shape.SQUIGGLE: return 'squiggle';
            case Shape.OVAL: return 'oval';
            default: return '';
        }
    }

    private getFillClass(fill: Fill): string {
        switch (fill) {
            case Fill.EMPTY: return 'empty';
            case Fill.STRIPED: return 'striped';
            case Fill.SOLID: return 'solid';
            default: return '';
        }
    }

    showInvalidSetMessage(): void {
        alert('Invalid set. Please try again.');
    }
}
