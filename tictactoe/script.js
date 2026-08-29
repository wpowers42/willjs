const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
const difficultySelect = document.getElementById('difficulty');
let board = Array(9).fill(null);
let currentPlayer = 'X'; // Human is X, AI is O
let gameOver = false;

function renderBoard() {
    boardElement.innerHTML = '';
    board.forEach((cell, idx) => {
        const cellDiv = document.createElement('div');
        cellDiv.className = 'cell';
        cellDiv.dataset.index = idx;
        cellDiv.textContent = cell ? cell : '';
        cellDiv.addEventListener('click', onCellClick);
        boardElement.appendChild(cellDiv);
    });
}

function onCellClick(e) {
    const idx = parseInt(e.target.dataset.index);
    if (gameOver || board[idx]) return;
    makeMove(idx, currentPlayer);
    if (!gameOver) {
        statusElement.textContent = "AI is thinking...";
        setTimeout(() => {
            const aiMove = bestMove(board, difficultySelect.value);
            if (aiMove !== null) makeMove(aiMove, 'O');
        }, 200);
    }
}

function makeMove(idx, player) {
    board[idx] = player;
    renderBoard();
    const winner = checkWinner(board);
    if (winner) {
        gameOver = true;
        statusElement.textContent = winner === 'draw' ? 'Draw!' : `${winner} wins!`;
    } else {
        currentPlayer = player === 'X' ? 'O' : 'X';
        statusElement.textContent = `${currentPlayer}'s turn`;
    }
}

function checkWinner(b) {
    const lines = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];
    for (const [a,bIdx,c] of lines) {
        if (b[a] && b[a] === b[bIdx] && b[a] === b[c]) return b[a];
    }
    if (b.every(v => v)) return 'draw';
    return null;
}

function bestMove(b, depthStr) {
    const depth = parseInt(depthStr);
    const ai = 'O';
    const human = 'X';
    let bestScore = -Infinity;
    let move = null;
    b.forEach((cell, idx) => {
        if (!cell) {
            b[idx] = ai;
            const score = minimax(b, depth, false, ai, human, -Infinity, Infinity);
            b[idx] = null;
            if (score > bestScore) {
                bestScore = score;
                move = idx;
            }
        }
    });
    return move;
}

function minimax(b, depth, isMaximizing, ai, human, alpha, beta) {
    const result = checkWinner(b);
    if (result === ai) return 10;
    if (result === human) return -10;
    if (result === 'draw') return 0;
    if (depth === 0) return 0;
    // allow full search for tic‑tac‑toe – no heuristic needed

    if (isMaximizing) {
        let maxEval = -Infinity;
        for (let idx=0; idx<b.length; idx++) {
        const cell = b[idx];
        if (!cell) {
            b[idx] = ai;
            const eval = minimax(b, depth-1, false, ai, human, alpha, beta);
            b[idx] = null;
            maxEval = Math.max(maxEval, eval);
            alpha = Math.max(alpha, eval);
            if (beta <= alpha) break;
        }
    }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (let idx=0; idx<b.length; idx++) {
        const cell = b[idx];
        if (!cell) {
            b[idx] = human;
            const eval = minimax(b, depth-1, true, ai, human, alpha, beta);
            b[idx] = null;
            minEval = Math.min(minEval, eval);
            beta = Math.min(beta, eval);
            if (beta <= alpha) break;
        }
    }
        return minEval;
    }
}

// Initialize
renderBoard();
statusElement.textContent = "Your turn (X)";
