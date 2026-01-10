// setup canvas and context
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Responsive canvas sizing
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Helper to detect portrait mode (mobile-friendly vertical layout)
function isPortrait() {
    return canvas.height > canvas.width;
}


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

// Game states
const GameState = {
    START: 'start',
    PLAYING: 'playing',
    FEEDBACK: 'feedback',
    RESULTS: 'results'
};

class SpotIt {
    constructor() {
        this.plane = new ProjectivePlane();
        this.deck = this.buildDeck();
        this.NUM_SYMBOLS = 57;
        this.TOTAL_SYMBOLS = 179;
        this.symbols = this.chooseSymbols();
        this.icons = this.loadIcons();
        this.cards = this.deck.map(symbols => new Card(symbols, this.icons));

        // Game state
        this.state = GameState.START;
        this.score = 0;
        this.totalRounds = 10;
        this.currentRound = 0;
        this.matchingSymbol = null;
        this.feedbackResult = null;  // 'correct' or 'incorrect'
        this.feedbackTime = 0;
        this.feedbackDuration = 800;  // ms to show feedback

        // 2-player mode
        this.player1Score = 0;  // Top card (portrait) or Left card (landscape)
        this.player2Score = 0;  // Bottom card (portrait) or Right card (landscape)
        this.lastScoringPlayer = null;  // Track who scored last for feedback

        // Timing
        this.roundStartTime = 0;
        this.totalTime = 0;
        this.lastRoundTime = 0;
        this.bestTime = Infinity;
        this.times = [];

        // Selected symbol tracking
        this.selectedSymbol = null;
        this.hoveredSymbol = null;

        // Buttons (positions updated dynamically in render)
        this.startButton = {
            x: 0,
            y: 0,
            width: 140,
            height: 50,
            text: "Start Game",
            lastClicked: undefined
        };

        this.playAgainButton = {
            x: 0,
            y: 0,
            width: 140,
            height: 50,
            text: "Play Again",
            lastClicked: undefined
        };

        // Bind event handlers
        this.handleClick = this.handleClick.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleTouch = this.handleTouch.bind(this);
        canvas.addEventListener("click", this.handleClick);
        canvas.addEventListener("mousemove", this.handleMouseMove);
        canvas.addEventListener("touchstart", this.handleTouch, { passive: false });
    }

    handleTouch(event) {
        event.preventDefault();  // Prevent double-firing with click
        const touch = event.touches[0];
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        // Reuse click logic
        if (this.state === GameState.START) {
            if (this.isPointInButton(x, y, this.startButton)) {
                this.startGame();
                this.startButton.lastClicked = performance.now();
            }
        } else if (this.state === GameState.PLAYING) {
            this.checkSymbolClick(x, y);
        } else if (this.state === GameState.RESULTS) {
            if (this.isPointInButton(x, y, this.playAgainButton)) {
                this.startGame();
                this.playAgainButton.lastClicked = performance.now();
            }
        }
    }

    handleMouseMove(event) {
        if (this.state !== GameState.PLAYING) {
            this.hoveredSymbol = null;
            canvas.style.cursor = 'default';
            return;
        }

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Check if hovering over any symbol on either card
        this.hoveredSymbol = null;

        const hitA = this.cardA.getSymbolAtPoint(x, y);
        if (hitA !== null) {
            this.hoveredSymbol = { card: 'A', symbolIndex: hitA };
            canvas.style.cursor = 'pointer';
            return;
        }

        const hitB = this.cardB.getSymbolAtPoint(x, y);
        if (hitB !== null) {
            this.hoveredSymbol = { card: 'B', symbolIndex: hitB };
            canvas.style.cursor = 'pointer';
            return;
        }

        canvas.style.cursor = 'default';
    }

    handleClick(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (this.state === GameState.START) {
            // Check start button
            if (this.isPointInButton(x, y, this.startButton)) {
                this.startGame();
                this.startButton.lastClicked = performance.now();
            }
        } else if (this.state === GameState.PLAYING) {
            // Check for symbol clicks
            this.checkSymbolClick(x, y);
        } else if (this.state === GameState.RESULTS) {
            // Check play again button
            if (this.isPointInButton(x, y, this.playAgainButton)) {
                this.startGame();
                this.playAgainButton.lastClicked = performance.now();
            }
        }
    }

    isPointInButton(x, y, button) {
        return x >= button.x &&
               x <= button.x + button.width &&
               y >= button.y &&
               y <= button.y + button.height;
    }

    checkSymbolClick(x, y) {
        // Check card A (Player 1 - top/left)
        const hitA = this.cardA.getSymbolAtPoint(x, y);
        if (hitA !== null) {
            this.handleSymbolSelection(this.cardA.symbols[hitA], 1);
            return;
        }

        // Check card B (Player 2 - bottom/right)
        const hitB = this.cardB.getSymbolAtPoint(x, y);
        if (hitB !== null) {
            this.handleSymbolSelection(this.cardB.symbols[hitB], 2);
            return;
        }
    }

    handleSymbolSelection(symbolIndex, player) {
        this.selectedSymbol = symbolIndex;

        if (symbolIndex === this.matchingSymbol) {
            // Correct!
            this.score++;
            if (player === 1) {
                this.player1Score++;
            } else {
                this.player2Score++;
            }
            this.lastScoringPlayer = player;
            this.feedbackResult = 'correct';
            this.lastRoundTime = performance.now() - this.roundStartTime;
            this.totalTime += this.lastRoundTime;
            this.times.push(this.lastRoundTime);
            if (this.lastRoundTime < this.bestTime) {
                this.bestTime = this.lastRoundTime;
            }
        } else {
            // Incorrect
            this.feedbackResult = 'incorrect';
            this.lastScoringPlayer = null;
        }

        this.feedbackTime = performance.now();
        this.state = GameState.FEEDBACK;
    }

    startGame() {
        this.state = GameState.PLAYING;
        this.score = 0;
        this.player1Score = 0;
        this.player2Score = 0;
        this.currentRound = 0;
        this.totalTime = 0;
        this.bestTime = Infinity;
        this.times = [];
        this.nextRound();
    }

    nextRound() {
        this.currentRound++;
        if (this.currentRound > this.totalRounds) {
            this.state = GameState.RESULTS;
            return;
        }

        this.chooseRandomCards();
        this.findMatchingSymbol();
        this.roundStartTime = performance.now();
        this.selectedSymbol = null;
        this.state = GameState.PLAYING;
    }

    findMatchingSymbol() {
        // Find the symbol that appears in both cards
        const symbolsA = new Set(this.cardA.symbols);
        for (const symbol of this.cardB.symbols) {
            if (symbolsA.has(symbol)) {
                this.matchingSymbol = symbol;
                return;
            }
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

    update() {
        // Handle feedback state transition
        if (this.state === GameState.FEEDBACK) {
            if (performance.now() - this.feedbackTime > this.feedbackDuration) {
                this.nextRound();
            }
        }
    }

    render() {
        // Clear canvas
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (this.state === GameState.START) {
            this.renderStartScreen();
        } else if (this.state === GameState.PLAYING || this.state === GameState.FEEDBACK) {
            this.renderGame();
        } else if (this.state === GameState.RESULTS) {
            this.renderResults();
        }
    }

    renderStartScreen() {
        ctx.save();

        // Responsive font sizes
        const titleSize = Math.min(48, canvas.width / 8);
        const textSize = Math.min(20, canvas.width / 20);

        // Title
        ctx.fillStyle = 'white';
        ctx.font = `bold ${titleSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Spot It!', canvas.width / 2, canvas.height / 3);

        // Instructions - word wrap for narrow screens
        ctx.font = `${textSize}px Arial`;
        ctx.fillStyle = '#aaa';

        const instructions = [
            'Find the matching symbol',
            'between the two cards!',
            'Tap it as fast as you can.'
        ];

        const lineHeight = textSize * 1.4;
        const startY = canvas.height / 2 - lineHeight;
        instructions.forEach((line, i) => {
            ctx.fillText(line, canvas.width / 2, startY + i * lineHeight);
        });

        // Update button position dynamically
        this.startButton.x = canvas.width / 2 - this.startButton.width / 2;
        this.startButton.y = canvas.height / 2 + lineHeight * 2;

        // Start button
        this.renderButton(this.startButton);

        ctx.restore();
    }

    renderGame() {
        // Render cards with highlights
        const highlightA = this.getCardHighlight('A');
        const highlightB = this.getCardHighlight('B');

        // Pass portrait mode flag for vertical stacking
        const portrait = isPortrait();
        this.cardA.render(0, highlightA, portrait);
        this.cardB.render(1, highlightB, portrait);

        // Render HUD
        this.renderHUD();

        // Render feedback overlay
        if (this.state === GameState.FEEDBACK) {
            this.renderFeedback();
        }
    }

    getCardHighlight(cardId) {
        const card = cardId === 'A' ? this.cardA : this.cardB;
        const highlights = {};

        // Hover highlight
        if (this.hoveredSymbol && this.hoveredSymbol.card === cardId && this.state === GameState.PLAYING) {
            highlights[this.hoveredSymbol.symbolIndex] = 'hover';
        }

        // Selected/feedback highlights
        if (this.state === GameState.FEEDBACK && this.selectedSymbol !== null) {
            for (let i = 0; i < card.symbols.length; i++) {
                if (card.symbols[i] === this.selectedSymbol) {
                    highlights[i] = this.feedbackResult;
                }
                // Also highlight the correct answer if they got it wrong
                if (this.feedbackResult === 'incorrect' && card.symbols[i] === this.matchingSymbol) {
                    highlights[i] = 'correct';
                }
            }
        }

        return highlights;
    }

    renderHUD() {
        ctx.save();

        const portrait = isPortrait();
        const fontSize = Math.min(20, canvas.width / 18);
        const smallFontSize = Math.min(16, canvas.width / 22);

        ctx.fillStyle = 'white';
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textBaseline = 'top';

        if (portrait) {
            // Vertical layout for portrait mode - scores on sides, round/time stacked in center
            // Player 1 score (top card)
            ctx.textAlign = 'left';
            ctx.fillStyle = '#4fc3f7';
            ctx.fillText(`P1: ${this.player1Score}`, 10, 10);

            // Player 2 score (bottom card)
            ctx.textAlign = 'right';
            ctx.fillStyle = '#ffb74d';
            ctx.fillText(`P2: ${this.player2Score}`, canvas.width - 10, 10);

            // Round in center
            ctx.textAlign = 'center';
            ctx.fillStyle = 'white';
            ctx.font = `${smallFontSize}px Arial`;
            ctx.fillText(`Round ${this.currentRound}/${this.totalRounds}`, canvas.width / 2, 10);

            // Timer below round
            if (this.state === GameState.PLAYING) {
                const elapsed = (performance.now() - this.roundStartTime) / 1000;
                ctx.fillStyle = '#aaa';
                ctx.fillText(`${elapsed.toFixed(1)}s`, canvas.width / 2, 10 + smallFontSize + 4);
            }
        } else {
            // Horizontal layout for landscape - player scores flanking, center info
            ctx.textAlign = 'left';
            ctx.fillStyle = '#4fc3f7';
            ctx.fillText(`P1: ${this.player1Score}`, 20, 20);

            ctx.textAlign = 'right';
            ctx.fillStyle = '#ffb74d';
            ctx.fillText(`P2: ${this.player2Score}`, canvas.width - 20, 20);

            // Round and timer in center
            ctx.textAlign = 'center';
            ctx.fillStyle = 'white';
            ctx.fillText(`Round ${this.currentRound}/${this.totalRounds}`, canvas.width / 2, 20);

            if (this.state === GameState.PLAYING) {
                const elapsed = (performance.now() - this.roundStartTime) / 1000;
                ctx.font = `${smallFontSize}px Arial`;
                ctx.fillStyle = '#aaa';
                ctx.fillText(`${elapsed.toFixed(1)}s`, canvas.width / 2, 20 + fontSize + 4);
            }
        }

        ctx.restore();
    }

    renderFeedback() {
        ctx.save();

        let message;
        let color;
        if (this.feedbackResult === 'correct') {
            const playerLabel = this.lastScoringPlayer === 1 ? 'P1' : 'P2';
            const playerColor = this.lastScoringPlayer === 1 ? '#4fc3f7' : '#ffb74d';
            message = `${playerLabel} scores!`;
            color = playerColor;
        } else {
            message = 'Wrong!';
            color = '#f44336';
        }

        const fontSize = Math.min(28, canvas.width / 14);

        // Semi-transparent overlay at bottom
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.9;
        ctx.fillRect(0, canvas.height - 60, canvas.width, 60);

        ctx.globalAlpha = 1;
        ctx.fillStyle = 'white';
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        let feedbackText = message;
        if (this.feedbackResult === 'correct') {
            feedbackText += ` (${(this.lastRoundTime / 1000).toFixed(2)}s)`;
        }
        ctx.fillText(feedbackText, canvas.width / 2, canvas.height - 30);

        ctx.restore();
    }

    renderResults() {
        ctx.save();

        const titleSize = Math.min(42, canvas.width / 9);
        const scoreSize = Math.min(28, canvas.width / 14);
        const textSize = Math.min(18, canvas.width / 20);

        // Title
        ctx.fillStyle = 'white';
        ctx.font = `bold ${titleSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height * 0.12);

        // Winner announcement
        let winner;
        if (this.player1Score > this.player2Score) {
            winner = 'P1 Wins!';
            ctx.fillStyle = '#4fc3f7';
        } else if (this.player2Score > this.player1Score) {
            winner = 'P2 Wins!';
            ctx.fillStyle = '#ffb74d';
        } else {
            winner = "It's a Tie!";
            ctx.fillStyle = '#4CAF50';
        }
        ctx.font = `bold ${scoreSize}px Arial`;
        ctx.fillText(winner, canvas.width / 2, canvas.height * 0.22);

        // Player scores
        ctx.font = `${textSize}px Arial`;
        ctx.fillStyle = '#4fc3f7';
        ctx.fillText(`Player 1: ${this.player1Score}`, canvas.width / 2, canvas.height * 0.32);
        ctx.fillStyle = '#ffb74d';
        ctx.fillText(`Player 2: ${this.player2Score}`, canvas.width / 2, canvas.height * 0.38);

        // Stats
        ctx.fillStyle = '#aaa';
        ctx.font = `${textSize}px Arial`;

        if (this.times.length > 0) {
            const avgTime = this.totalTime / this.times.length / 1000;
            ctx.fillText(`Average Time: ${avgTime.toFixed(2)}s`, canvas.width / 2, canvas.height * 0.48);
            ctx.fillText(`Best Time: ${(this.bestTime / 1000).toFixed(2)}s`, canvas.width / 2, canvas.height * 0.54);
        }

        // Accuracy
        const accuracy = this.totalRounds > 0 ? (this.score / this.totalRounds * 100).toFixed(0) : 0;
        ctx.fillStyle = this.score === this.totalRounds ? '#4CAF50' : '#ff9800';
        ctx.fillText(`Accuracy: ${accuracy}%`, canvas.width / 2, canvas.height * 0.60);

        // Update play again button position
        this.playAgainButton.x = canvas.width / 2 - this.playAgainButton.width / 2;
        this.playAgainButton.y = canvas.height * 0.70;

        // Play again button
        this.renderButton(this.playAgainButton);

        ctx.restore();
    }

    renderButton(button) {
        ctx.save();

        // Button background
        if (performance.now() - button.lastClicked < 200) {
            ctx.fillStyle = '#333';
            ctx.strokeStyle = '#666';
        } else {
            ctx.fillStyle = '#4CAF50';
            ctx.strokeStyle = '#45a049';
        }
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(
            button.x,
            button.y,
            button.width,
            button.height,
            10
        );
        ctx.fill();
        ctx.stroke();
        ctx.closePath();

        // Button text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
            button.text,
            button.x + button.width/2,
            button.y + button.height/2
        );

        ctx.restore();
    }
}

class Card {
    constructor(symbols, icons) {
        this.symbols = symbols;
        this.icons = icons;
        this.padding = 5;
        this.symbolPositions = [];  // Store positions for hit detection
        this.cardX = 0;
        this.cardY = 0;
        this.cardSize = 0;
        this.symbolSize = 0;
    }

    getSymbolAtPoint(x, y) {
        for (let i = 0; i < this.symbolPositions.length; i++) {
            const pos = this.symbolPositions[i];
            if (x >= pos.x && x <= pos.x + this.symbolSize &&
                y >= pos.y && y <= pos.y + this.symbolSize) {
                return i;
            }
        }
        return null;
    }

    renderIcon(iconIndex, x, y, size, highlight = null) {
        const icon = this.icons[iconIndex];

        // Draw highlight background if needed
        if (highlight) {
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(x - 4, y - 4, size + 8, size + 8, 8);

            if (highlight === 'hover') {
                ctx.fillStyle = 'rgba(100, 180, 255, 0.3)';
                ctx.strokeStyle = 'rgba(100, 180, 255, 0.8)';
            } else if (highlight === 'correct') {
                ctx.fillStyle = 'rgba(76, 175, 80, 0.4)';
                ctx.strokeStyle = '#4CAF50';
            } else if (highlight === 'incorrect') {
                ctx.fillStyle = 'rgba(244, 67, 54, 0.4)';
                ctx.strokeStyle = '#f44336';
            }

            ctx.lineWidth = 3;
            ctx.fill();
            ctx.stroke();
            ctx.closePath();
            ctx.restore();
        }

        ctx.drawImage(icon, x, y, size, size);
    }

    render(cardNumber, highlights = {}, portrait = false) {
        // Calculate card size based on orientation
        const hudHeight = 60;  // Space for HUD at top
        const feedbackHeight = 70;  // Space for feedback at bottom

        let x, y, cardSize;

        if (portrait) {
            // Vertical stacking - cards fill width, stack top/bottom
            const availableHeight = canvas.height - hudHeight - feedbackHeight;
            const maxCardSize = Math.min(
                canvas.width - this.padding * 2,
                (availableHeight - this.padding * 3) / 2
            );
            cardSize = Math.min(maxCardSize, 400);

            x = (canvas.width - cardSize) / 2;
            const totalCardsHeight = cardSize * 2 + this.padding * 2;
            const startY = hudHeight + (availableHeight - totalCardsHeight) / 2;
            y = startY + cardNumber * (cardSize + this.padding * 2);
        } else {
            // Horizontal layout - side by side
            cardSize = Math.min(300, (canvas.width - this.padding * 3) / 2);
            const deltaX = (canvas.width - cardSize * 2) / 3;
            x = deltaX + cardNumber * (cardSize + deltaX);
            y = (canvas.height - cardSize) / 2;
        }

        this.cardX = x;
        this.cardY = y;
        this.cardSize = cardSize;
        this.symbolSize = (cardSize - this.padding * 4) / 3;

        // create a 3x3 grid of positions
        this.symbolPositions = [];
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                let posX = x + this.padding + col * (this.symbolSize + this.padding);
                let posY = y + this.padding + row * (this.symbolSize + this.padding);
                if (row === 2) {
                    posX += this.symbolSize * 0.5;
                }
                this.symbolPositions.push({ x: posX, y: posY });
            }
        }

        // draw card border with rounded corners using roundRect
        ctx.strokeStyle = 'black';
        ctx.fillStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x, y, cardSize, cardSize, 10);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();

        // Draw each symbol at calculated positions
        this.symbols.forEach((symbolIndex, idx) => {
            if (idx < this.symbolPositions.length) {
                const pos = this.symbolPositions[idx];
                const highlight = highlights[idx] || null;
                this.renderIcon(symbolIndex, pos.x, pos.y, this.symbolSize, highlight);
            }
        });
    }
}


function animate(spotIt) {
    spotIt.update();
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
