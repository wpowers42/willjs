import { Card } from './Card.js';
import { Deck } from './Deck.js';
import { isValidSet } from './utils.js';

export class Game {
    private deck: Deck;
    public board: Card[] = [];
    public selectedCards: Card[] = [];

    constructor() {
        this.deck = new Deck();
        this.resetBoard();
    }

    selectCard(card: Card): boolean {
        if (this.selectedCards.length < 3 && !this.selectedCards.includes(card)) {
            this.selectedCards.push(card);
            if (this.selectedCards.length === 3) {
                if (isValidSet(this.selectedCards)) {
                    this.removeSelectedCardsFromBoard();
                    this.selectedCards = [];
                    return true;
                } else {
                    this.selectedCards = [];
                    return false;
                }
            }
        }
        return false;
    }

    removeSelectedCardsFromBoard(): void {
        this.selectedCards.forEach(card => {
            const index = this.board.indexOf(card);
            if (index !== -1) {
                this.board.splice(index, 1);
            }
        });
        this.fillBoard();
    }

    resetBoard(): void {
        this.board = [];
        for (let i = 0; i < 12; i++) {
            const card = this.deck.drawCard();
            if (card) {
                this.board.push(card);
            }
        }
    }

    fillBoard(): void {
        while (this.board.length < 12 && this.deck.remainingCards > 0) {
            const card = this.deck.drawCard();
            if (card) {
                this.board.push(card);
            }
        }
    }
}
