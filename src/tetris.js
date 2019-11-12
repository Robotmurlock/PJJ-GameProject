
const game_canvas = document.getElementById("tetris");
const game_context = game_canvas.getContext("2d");

const NUMBER_OF_ROWS = 20;
const NUMBER_OF_COLUMNS = 20
const BLOCK_SIZE = 30
const BLOCK_EMPTY_COLOR = "WHITE";

const draw_square = function(row, col, color) {
    game_context.fillStyle = color;
    game_context.fillRect(row*BLOCK_SIZE, col*BLOCK_SIZE, 
                          (row+1)*BLOCK_SIZE, (col+1)*BLOCK_SIZE);
    game_context.strokeStyle = "BLACK";
    game_context.strokeRect(row*BLOCK_SIZE, col*BLOCK_SIZE, 
                            (row+1)*BLOCK_SIZE, (col+1)*BLOCK_SIZE);
}

const draw_board = function(board) {
    for(let row=0; row<NUMBER_OF_ROWS; row++) {
        for(let col=0; col<NUMBER_OF_COLUMNS; col++) {
            draw_square(row, col, board[row][col])
        }
    }
}

let game_board = []
for(let row=0; row<NUMBER_OF_ROWS; row++) {
    game_board[row] = []
    for(let col=0; col<NUMBER_OF_COLUMNS; col++) {
        game_board[row][col] = BLOCK_EMPTY_COLOR
    }
}

draw_board(game_board)

