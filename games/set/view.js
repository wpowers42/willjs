import { Color, Shape, Fill } from './Card.js';
export class View {
    constructor(game) {
        this.game = game;
        this.boardElement = document.getElementById('board');
        this.render();
    }
    render() {
        this.boardElement.innerHTML = '';
        this.game.board.forEach(card => {
            const cardElem = this.createCardElement(card);
            this.boardElement.appendChild(cardElem);
        });
    }
    createCardElement(card) {
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
                this.render(); // Re-render view if a card is selected
            }
            else {
                // this.showInvalidSetMessage();
            }
        });
        return cardElem;
    }
    getColor(color) {
        switch (color) {
            case Color.RED: return 'red';
            case Color.GREEN: return 'green';
            case Color.PURPLE: return 'purple';
            default: return 'black'; // Default color if something goes wrong
        }
    }
    getShapeClass(shape) {
        switch (shape) {
            case Shape.DIAMOND: return 'diamond';
            case Shape.SQUIGGLE: return 'squiggle';
            case Shape.OVAL: return 'oval';
            default: return '';
        }
    }
    getFillClass(fill) {
        switch (fill) {
            case Fill.EMPTY: return 'empty';
            case Fill.STRIPED: return 'striped';
            case Fill.SOLID: return 'solid';
            default: return '';
        }
    }
    showInvalidSetMessage() {
        alert('Invalid set. Please try again.');
    }
}
//# sourceMappingURL=view.js.map