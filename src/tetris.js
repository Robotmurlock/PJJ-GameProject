
const game_canvas = document.getElementById("tetris");
const game_context = game_canvas.getContext("2d");

// board constants
const NUMBER_OF_ROWS = 20;
const NUMBER_OF_COLUMNS = 20;
const BLOCK_SIZE = 30;
const BLOCK_EMPTY_COLOR = "white";

// game status values
var game_speed = 1000;
var game_board = []

const draw_square = function(row, col, color) {
    game_board[row][col] = color;
    game_context.fillStyle = color;
    game_context.fillRect(row*BLOCK_SIZE, col*BLOCK_SIZE, 
                          BLOCK_SIZE, BLOCK_SIZE);
    game_context.strokeStyle = "black";
    game_context.strokeRect(row*BLOCK_SIZE, col*BLOCK_SIZE, 
                            BLOCK_SIZE, BLOCK_SIZE);
}

const draw_board = function(board) {
    for(let row=0; row<NUMBER_OF_ROWS; row++) {
        for(let col=0; col<NUMBER_OF_COLUMNS; col++) {
            draw_square(row, col, board[row][col])
        }
    }
}

const types = [I, J, L, O, S, T, Z]
const colors = ["red", "blue", "green", "orange", "purple", "yellow"]

// generates new random piece with random color
const Piece = function() {
    this.generate();
}

Piece.prototype.generate = function() {
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.type = types[Math.floor(Math.random() * types.length)];
    this.size_x = this.type[0].length
    this.size_y = this.type[0][0].length
    this.pos_x = NUMBER_OF_COLUMNS/2;
    this.pos_y = 0;
    this.state = 0;

    this.timer = setInterval(this.falling, game_speed);
}

Piece.prototype.draw = function() {
    for(let x=0; x<this.size_x; x++) {
        for(let y=0; y<this.size_y; y++) {
            if(this.type[this.state][x][y] == 1) {
                draw_square(this.pos_x + x, this.pos_y + y, this.color);
            }
        }
    }
}

const valid_position = function(x, y) {
    if(x < 0)
        return false;
    if(y < 0)
        return false;
    if(x >= NUMBER_OF_COLUMNS)
        return false;
    if(y >= NUMBER_OF_ROWS)
        return false;
    return true;
}

Piece.prototype.check = function(x, y, state) {
    shape = this.type[state];
    for(let i=0; i<this.size_x; i++) {
        for(let j=0; j<this.size_y; j++) {
            if(shape[i][j] == 1 && !valid_position(y+j, x+i, state))
                return false;
        }
    }

    return true;
}

const max = function(a, b) {
    return (a>b) ? a : b;
}

Piece.prototype.restart = function() {
    clearInterval(this.timer);
    this.generate();
}

Piece.prototype.collision = function() {
    let shape = this.type[this.state];
    let bottoms = [];
    let max_bottom = undefined;
    for(let i=0; i<this.size_x; i++) {
        bottoms[i] = null;
        for(let j=this.size_y-1; j>=0; j--)
            if(shape[i][j] == 1) {
                bottoms[i] = j;
                max_bottom = max(max_bottom, j);
                break;
            }
    }

    if(this.pos_y + max_bottom + 1 >= NUMBER_OF_ROWS)
        return true;

    for(let i=0; i<this.size_x; i++) {
        let b = bottoms[i];
        if(this.pos_x+i < NUMBER_OF_ROWS 
            && this.pos_y + b + 1 < NUMBER_OF_COLUMNS
            && game_board[this.pos_x+i][this.pos_y + b + 1] != BLOCK_EMPTY_COLOR)
            return true;
    }

    return false;
}

Piece.prototype.update = function(x, y, state) {
    if(this.check(x, y, state)) {
        let tmp = this.color;
        this.color = BLOCK_EMPTY_COLOR;
        this.draw();
        this.pos_x = x;
        this.pos_y = y;
        this.state = state;
        this.color = tmp;
        this.draw();
    }

    if(this.collision()) {
        this.restart();
    }
}

Piece.prototype.up = function() {
    let new_y = this.pos_y-1;
    this.update(this.pos_x, new_y, this.state);
}
Piece.prototype.down = function() {
    let new_y = this.pos_y+1;
    this.update(this.pos_x, new_y, this.state);
}
Piece.prototype.left = function() {
    let new_x = this.pos_x-1;
    this.update(new_x, this.pos_y, this.state);
}
Piece.prototype.right = function() {
    let new_x = this.pos_x+1;
    this.update(new_x, this.pos_y, this.state);
}
Piece.prototype.rotate = function() {
    // There are 4 states for every piece
    let new_state = this.state+1;
    if(new_state == 4)
        new_state = 0;
    this.update(this.pos_x, this.pos_y, new_state);
}

// keyboard listener
document.addEventListener('keydown', function(event) {
    if(event.keyCode == 37) {
        piece.left();
    }
    else if(event.keyCode == 39) {
        piece.right();
    }
    else if(event.keyCode == 38) {
        //piece.up();
    } else if(event.keyCode == 40) {    
        piece.down();
    } else if(event.keyCode == 32) {
        piece.rotate();
    }
});

// timer function
Piece.prototype.falling = function() {
    piece.down();
}

const start = function() {
    // set default block colors
    for(let row=0; row<NUMBER_OF_ROWS; row++) {
        game_board[row] = []
        for(let col=0; col<NUMBER_OF_COLUMNS; col++) {
            game_board[row][col] = BLOCK_EMPTY_COLOR
        }
    }

    draw_board(game_board);
    piece = new Piece();
    console.log(piece);
    piece.draw();
}

start();

