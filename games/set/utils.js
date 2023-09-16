export function isValidSet(cards) {
    if (cards.length !== 3)
        return false;
    // Explicitly type 'property' to ensure it's a key of Card
    for (let property in cards[0]) {
        if (cards[0].hasOwnProperty(property)) { // Ensure we're only considering direct properties of the object
            // Use type assertion to treat 'property' as keyof Card
            if (!(allSame(property) || allDifferent(property))) {
                return false;
            }
        }
    }
    return true;
    function allSame(property) {
        return cards.every(card => card[property] === cards[0][property]);
    }
    function allDifferent(property) {
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
//# sourceMappingURL=utils.js.map