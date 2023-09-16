import { Deck } from './Deck.js';
import { isValidSet } from './utils.js';
export class Game {
    constructor() {
        this.board = [];
        this.selectedCards = [];
        this.deck = new Deck();
        this.resetBoard();
    }
    selectCard(card) {
        if (this.selectedCards.length < 3 && !this.selectedCards.includes(card)) {
            this.selectedCards.push(card);
            if (this.selectedCards.length === 3) {
                if (isValidSet(this.selectedCards)) {
                    this.removeSelectedCardsFromBoard();
                    this.selectedCards = [];
                    return true;
                }
                else {
                    this.selectedCards = [];
                    return false;
                }
            }
        }
        return false;
    }
    removeSelectedCardsFromBoard() {
        this.selectedCards.forEach(card => {
            const index = this.board.indexOf(card);
            if (index !== -1) {
                this.board.splice(index, 1);
            }
        });
        this.fillBoard();
    }
    resetBoard() {
        this.board = [];
        for (let i = 0; i < 12; i++) {
            const card = this.deck.drawCard();
            if (card) {
                this.board.push(card);
            }
        }
    }
    fillBoard() {
        while (this.board.length < 12 && this.deck.remainingCards > 0) {
            const card = this.deck.drawCard();
            if (card) {
                this.board.push(card);
            }
        }
    }
}
//# sourceMappingURL=Game.js.map