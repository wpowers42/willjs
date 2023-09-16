import { Card, Color, Shape, Fill, CardNumber } from './Card.js';
export class Deck {
    constructor() {
        this.cards = [];
        for (const color in Color) {
            for (const shape in Shape) {
                for (const fill in Fill) {
                    for (const number in CardNumber) {
                        if (isNaN(Number(color)) && isNaN(Number(shape)) && isNaN(Number(fill)) && isNaN(Number(number))) {
                            this.cards.push(new Card(Color[color], Shape[shape], Fill[fill], CardNumber[number]));
                        }
                    }
                }
            }
        }
        this.shuffle();
    }
    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }
    drawCard() {
        return this.cards.pop() || null;
    }
    get remainingCards() {
        return this.cards.length;
    }
}
//# sourceMappingURL=Deck.js.map