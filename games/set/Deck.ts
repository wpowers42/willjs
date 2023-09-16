import { Card, Color, Shape, Fill, CardNumber } from './Card.js';

export class Deck {
    private cards: Card[] = [];

    constructor() {
        for (const color in Color) {
            for (const shape in Shape) {
                for (const fill in Fill) {
                    for (const number in CardNumber) {
                        if (isNaN(Number(color)) && isNaN(Number(shape)) && isNaN(Number(fill)) && isNaN(Number(number))) {
                            this.cards.push(new Card(Color[color as keyof typeof Color], Shape[shape as keyof typeof Shape], Fill[fill as keyof typeof Fill], CardNumber[number as keyof typeof CardNumber]));
                        }
                    }
                }
            }
        }

        this.shuffle();
    }

    shuffle(): void {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    drawCard(): Card | null {
        return this.cards.pop() || null;
    }

    get remainingCards(): number {
        return this.cards.length;
    }
}
