const board = document.getElementById('board');
const squares = [];

const pieces = [
    '♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜',
    '♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙',
    '♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖'
];

function createBoard() {
    for (let i = 0; i < 64; i++) {
        const square = document.createElement('div');
        square.classList.add('square');
        const row = Math.floor(i / 8);
        const col = i % 8;
        if ((row + col) % 2 === 0) {
            square.classList.add('white');
        } else {
            square.classList.add('black');
        }
        square.dataset.index = i;
        square.textContent = pieces[i];
        board.appendChild(square);
        squares.push(square);
    }
}

createBoard();
