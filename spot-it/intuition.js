const symbolsPerCard = 2;
const symbols = [];
for (i = 0; i < symbolsPerCard; i++) {
    for (j = 0; j < symbolsPerCard; j++) {
        symbols.push(i);
    }
}

const deck = [];

let counter = 0;

while (counter < 100) {
    const newCard = [];
    deck.forEach((card, i) => 
        card.forEach((symbol, j) => 
        )
        symbols.findIndex
        console.log(`Card ${i + 1}:`, card));
}


// // Configuration
// const symbolsPerCard = 8; // Number of symbols per card

// /**
//  * Counts how many times a symbol appears in the deck
//  * @param {number} symbol - Symbol to count
//  * @param {number[][]} deck - Current deck
//  * @param {number[]} currentCard - Current card being built
//  * @returns {number} - Number of occurrences
//  */
// function countSymbolOccurrences(symbol, deck, currentCard) {
//     const inDeck = deck.reduce((count, card) => 
//         count + (card.includes(symbol) ? 1 : 0), 0);
//     const inCurrent = currentCard.includes(symbol) ? 1 : 0;
//     return inDeck + inCurrent;
// }

// /**
//  * Checks if a new card is valid against the existing deck
//  * @param {number[]} newCard - Card to validate
//  * @param {number[][]} deck - Existing deck of cards
//  * @returns {boolean} - True if card is valid
//  */
// function isValidCard(newCard, deck) {
//     // Card must have correct number of symbols
//     if (newCard.length !== symbolsPerCard) return false;
    
//     // Check against every other card in the deck
//     for (const existingCard of deck) {
//         const commonSymbols = newCard.filter(symbol => existingCard.includes(symbol));
//         if (commonSymbols.length !== 1) return false;
//     }
//     return true;
// }

// /**
//  * Gets the highest symbol used in the deck plus one
//  * @param {number[][]} deck - Current deck
//  * @param {number[]} currentCard - Current card being built
//  * @returns {number} - Next available symbol
//  */
// function getNextSymbol(deck, currentCard) {
//     const allSymbols = [...new Set([
//         ...deck.flat(),
//         ...currentCard
//     ])];
//     return allSymbols.length > 0 ? Math.max(...allSymbols) + 1 : 0;
// }

// /**
//  * Checks if adding a symbol would exceed the maximum allowed occurrences
//  * @param {number} symbol - Symbol to check
//  * @param {number[][]} deck - Current deck
//  * @param {number[]} currentCard - Current card being built
//  * @returns {boolean} - True if symbol can be added
//  */
// function canAddSymbol(symbol, deck, currentCard) {
//     return countSymbolOccurrences(symbol, deck, currentCard) < symbolsPerCard;
// }

// /**
//  * Recursively generates a valid Spot It deck
//  * @param {number[][]} deck - Current deck being built
//  * @param {number[]} currentCard - Current card being built
//  * @param {number} startSymbol - Starting symbol to try
//  * @param {number} maxCards - Maximum number of cards to generate
//  * @returns {number[][] | null} - Valid deck or null if impossible
//  */
// function generateDeck(deck = [], currentCard = [], startSymbol = 0, maxCards = 7) {
//     // If current card is complete, validate and add it
//     if (currentCard.length === symbolsPerCard) {
//         if (isValidCard(currentCard, deck)) {
//             deck.push([...currentCard]);
//             if (deck.length === maxCards) return deck;
//             return generateDeck(deck, [], 0, maxCards);
//         }
//         return null;
//     }

//     // Calculate how many symbols we might need
//     const nextNewSymbol = getNextSymbol(deck, currentCard);
//     // Allow for some extra symbols beyond what we've used so far
//     const maxSymbolToTry = nextNewSymbol + symbolsPerCard;

//     // Try adding each possible symbol
//     for (let i = startSymbol; i <= maxSymbolToTry; i++) {
//         // Skip if symbol is already in current card
//         if (currentCard.includes(i)) continue;
        
//         // Skip if symbol would appear too many times
//         if (!canAddSymbol(i, deck, currentCard)) continue;
        
//         // Try this symbol
//         currentCard.push(i);
//         const result = generateDeck(deck, currentCard, i + 1, maxCards);
//         if (result) return result;
//         currentCard.pop();
//     }

//     return null;
// }

// /**
//  * Validates that the entire deck follows the symbol occurrence rule
//  * @param {number[][]} deck - Deck to validate
//  * @returns {boolean} - True if deck is valid
//  */
// function validateDeckSymbolCounts(deck) {
//     const symbolCounts = new Map();
    
//     // Count occurrences of each symbol
//     for (const card of deck) {
//         for (const symbol of card) {
//             symbolCounts.set(symbol, (symbolCounts.get(symbol) || 0) + 1);
//         }
//     }
    
//     // Check that each symbol appears exactly symbolsPerCard times
//     return Array.from(symbolCounts.values()).every(count => count === symbolsPerCard);
// }

// /**
//  * Generates the largest possible valid deck for given symbolsPerCard
//  * @returns {number[][]} - The generated deck
//  */
// function findMaximalDeck() {
//     let maxCards = 57; // Start with a small number
//     let lastValidDeck = null;
    
//     // Keep trying larger deck sizes until we fail
//     while (true && maxCards < 100) {
//         console.log(`Attempting to generate deck with ${maxCards} cards...`);
//         const deck = generateDeck([], [], 0, maxCards);
        
//         if (!deck || !validateDeckSymbolCounts(deck)) {
//             console.log(`Failed to generate deck with ${maxCards} cards.`);
//         } else {
//             console.log(`Generated deck with ${maxCards} cards.`);
//             lastValidDeck = deck;
//         }
        
//         maxCards++;
//     }
    
//     return lastValidDeck;
// }

// // Test the generator
// console.log("Generating maximal deck...");
// const deck = findMaximalDeck();
// if (deck) {
//     console.log("\nValid deck generated:");
//     deck.forEach((card, i) => console.log(`Card ${i + 1}:`, card));
//     console.log(`\nTotal cards: ${deck.length}`);
//     console.log(`Symbols used: ${[...new Set(deck.flat())].sort((a,b) => a-b)}`);
    
//     // Print symbol frequency analysis
//     const symbolCounts = new Map();
//     deck.flat().forEach(symbol => 
//         symbolCounts.set(symbol, (symbolCounts.get(symbol) || 0) + 1));
//     console.log("\nSymbol frequencies:");
//     for (const [symbol, count] of symbolCounts) {
//         console.log(`Symbol ${symbol}: ${count} times`);
//     }
// } else {
//     console.log("Could not generate a valid deck");
// }