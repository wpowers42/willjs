import { Card } from './Card.js';

export function isValidSet(cards: Card[]): boolean {
    if (cards.length !== 3) return false;

    // Explicitly type 'property' to ensure it's a key of Card
    for (let property in cards[0]) {
        if (cards[0].hasOwnProperty(property)) { // Ensure we're only considering direct properties of the object
            // Use type assertion to treat 'property' as keyof Card
            if (!(allSame(property as keyof Card) || allDifferent(property as keyof Card))) {
                return false;
            }
        }
    }

    return true;

    function allSame(property: keyof Card): boolean {
        return cards.every(card => card[property] === cards[0][property]);
    }

    function allDifferent(property: keyof Card): boolean {
        for (let i = 0; i < cards.length; i++) {
            for (let j = i + 1; j < cards.length; j++) {
                if (cards[i][property] === cards[j][property]) {
                    return false;
                }
            }
        }
        return true;
    }
}
