// setup canvas and context
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = Math.min(800, window.innerWidth);
canvas.height = Math.min(600, window.innerHeight);


class ProjectivePlane {
    constructor(numElements = 7) {
        this.elements = this.gf7Elements(numElements);
        this.points = this.generatePoints();
        this.lines = this.generateLines();
    }

    gf7Elements() {
        return Array.from({length: 7}, (_, i) => i);
    }

    modInverse(a, m) {
        for (let x = 1; x < m; x++) {
            if (((a % m) * (x % m)) % m === 1) {
                return x;
            }
        }
        throw new Error('No modular multiplicative inverse exists');
    }

    generatePoints() {
        const points = [];
        const elements = this.elements;
        
        // Cartesian product of three GF(7) elements
        for (const x of elements) {
            for (const y of elements) {
                for (const z of elements) {
                    if (x === 0 && y === 0 && z === 0) continue;
                    
                    let norm;
                    if (x !== 0) {
                        const xInv = this.modInverse(x, 7);
                        norm = [1, (y * xInv) % 7, (z * xInv) % 7];
                    } else if (y !== 0) {
                        const yInv = this.modInverse(y, 7);
                        norm = [0, 1, (z * yInv) % 7];
                    } else {
                        norm = [0, 0, 1];
                    }
                    
                    // Check if point already exists
                    if (!points.some(p => p[0] === norm[0] && p[1] === norm[1] && p[2] === norm[2])) {
                        points.push(norm);
                    }
                }
            }
        }
        return points;
    }

    generateLines() {
        const lines = [];
        const elements = this.elements;
        
        for (const a of elements) {
            for (const b of elements) {
                for (const c of elements) {
                    if (a === 0 && b === 0 && c === 0) continue;
                    
                    let norm;
                    if (a !== 0) {
                        const aInv = this.modInverse(a, 7);
                        norm = [1, (b * aInv) % 7, (c * aInv) % 7];
                    } else if (b !== 0) {
                        const bInv = this.modInverse(b, 7);
                        norm = [0, 1, (c * bInv) % 7];
                    } else {
                        norm = [0, 0, 1];
                    }
                    
                    // Check if line already exists
                    if (!lines.some(l => l[0] === norm[0] && l[1] === norm[1] && l[2] === norm[2])) {
                        lines.push(norm);
                    }
                }
            }
        }
        return lines;
    }

    incidence(point, line) {
        const [x, y, z] = point;
        const [a, b, c] = line;
        return ((a * x + b * y + c * z) % 7) === 0;
    }
}

class SpotIt {
    constructor() {
        this.plane = new ProjectivePlane();
        this.deck = this.buildDeck();
        this.NUM_SYMBOLS = 57;
        this.TOTAL_SYMBOLS = 179;
        this.symbols = this.chooseSymbols();
        this.icons = this.loadIcons();
        this.cards = this.deck.map(symbols => new Card(symbols, this.icons));
        this.chooseRandomCards();

        this.button = {
            x: canvas.width / 2 - 50,  // center horizontally
            y: canvas.height - 80,     // near bottom
            width: 100,
            height: 40,
            text: "New Cards",
            lastClicked: undefined
        };

        // Bind the click handler to this instance
        this.handleClick = this.handleClick.bind(this);
        canvas.addEventListener("click", this.handleClick);
    }

    handleClick(event) {
        // Get click coordinates relative to canvas
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Check if click is within button bounds
        if (x >= this.button.x && 
            x <= this.button.x + this.button.width &&
            y >= this.button.y && 
            y <= this.button.y + this.button.height) {
            this.chooseRandomCards();
            this.button.lastClicked = performance.now();
        }
    }

    buildDeck() {
        const points = this.plane.points;
        const lines = this.plane.lines;

        // Create point indices mapping
        const pointIndices = new Map();
        points.forEach((point, idx) => {
            pointIndices.set(point.toString(), idx);
        });
        
        const deck = [];
        for (const line of lines) {
            const card = [];
            for (const point of points) {
                if (this.plane.incidence(point, line)) {
                    card.push(pointIndices.get(point.toString()));
                }
            }
            // randomize the card
            deck.push(card.sort(() => Math.random() - 0.5));
        }

        // Verify all pairs have exactly one symbol in common
        for (let idx1 = 0; idx1 < deck.length; idx1++) {
            for (let idx2 = idx1 + 1; idx2 < deck.length; idx2++) {
                const common = deck[idx1].filter(x => deck[idx2].includes(x));
                if (common.length !== 1) {
                    console.log(`Cards ${idx1 + 1} and ${idx2 + 1} have ${common.length} elements in common.`);
                    break;
                }
            }
        }

        return deck;
    }

    chooseSymbols() {
        const symbols = [];
        while (symbols.length < this.NUM_SYMBOLS) {
            const idx = Math.floor(Math.random() * this.TOTAL_SYMBOLS);
            // skip the two symbols that are not available
            if (idx === 43 || idx === 154) {
                continue;
            }
            if (!symbols.includes(idx)) {
                symbols.push(idx);
            }
        }
        return symbols;
    }

    loadIcons() {
        const icons = [];
        for (let i = 0; i < this.symbols.length; i++) {
            const emoji = new Image();
            emoji.crossOrigin = "anonymous";
            emoji.src = `https://dojoicons.classdojo.com/beyond_school/100/${this.symbols[i] + 1}.png`;
            icons.push(emoji);
        }
        return icons;
    }

    chooseRandomCards() {
        // choose two mutually exclusive cards from this.deck.length
        const card1Index = Math.floor(Math.random() * this.deck.length);
        let card2Index = Math.floor(Math.random() * this.deck.length);

        while (card1Index === card2Index) {
            card2Index = Math.floor(Math.random() * this.deck.length);
        }
    
        this.cardA = this.cards[card1Index];
        this.cardB = this.cards[card2Index];
    }

    render() {
        this.cardA.render(0);
        this.cardB.render(1);

        // Draw button
        ctx.save();
        
        // Button background, do something if last clicked was less than 200ms ago
        if (performance.now() - this.button.lastClicked < 200) {
            ctx.fillStyle = '#333';
            ctx.strokeStyle = '#666';
        } else {
            ctx.fillStyle = '#666';
            ctx.strokeStyle = '#333';
        }
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(
            this.button.x, 
            this.button.y, 
            this.button.width, 
            this.button.height,
            10  // rounded corners
        );
        ctx.fill();
        ctx.stroke();
        ctx.closePath();

        // Button text
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
            this.button.text,
            this.button.x + this.button.width/2,
            this.button.y + this.button.height/2
        );

        ctx.restore();
    }

}

class Card {
    constructor(symbols, icons) {
        this.symbols = symbols;
        this.icons = icons;
        this.padding = 5;
        this.cardSize = Math.min(300 + this.padding * 4, (canvas.width - this.padding * 3) / 2);
        this.symbolSize = (this.cardSize - this.padding * 4) / 3;
    }

    renderIcon(iconIndex, x, y) {
        const icon = this.icons[iconIndex];
        const size = this.symbolSize;
        ctx.drawImage(icon, x, y, size, size);
    }

    render(cardNumber) {
        const deltaX = (canvas.width - this.cardSize * 2) / 3;
        const x = deltaX + cardNumber * (this.cardSize + deltaX);
        const y = (canvas.height - this.cardSize) / 2;

        // create a 3x3 grid of positions
        const positions = [];
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                positions.push([x + this.padding + col * (this.symbolSize + this.padding), y + this.padding + row * (this.symbolSize + this.padding)]);
                if (row === 2) {
                    positions[positions.length - 1][0] += this.symbolSize * 0.5;
                }
            }
        }
        // draw card border with rounded corners using roundRect
        ctx.strokeStyle = 'black';
        ctx.fillStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x, y, this.cardSize, this.cardSize, 10);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
        
        // Draw each symbol at calculated positions, adjusting for the card outline
        this.symbols.forEach((symbolIndex, idx) => {
            if (idx < positions.length) {
                let [posX, posY] = positions[idx];
                this.renderIcon(symbolIndex, posX, posY);
            }
        });
    }


}


function animate(spotIt) {
    spotIt.render();
    requestAnimationFrame(() => animate(spotIt));
}

// Main function
function main() {
    const spotIt = new SpotIt();
    animate(spotIt);
}

// Run the program after all images are loaded
window.addEventListener("load", main);