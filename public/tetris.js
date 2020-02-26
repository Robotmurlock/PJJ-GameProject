const game_canvas = document.getElementById("tetris");
const game_context = game_canvas.getContext("2d");

// Board constants
const SIZE = 20;
const BLOCK_SIZE = 30;
const BLOCK_EMPTY_COLOR = "white";
const BLOCK_DEAD_COLOR = "gray";

// Tetrominoes constants
const TYPES = [I, J, L, O, S, T, Z]
const COLORS = ["red", "blue", "green", "orange", "purple", "yellow"]

// Game status values
var game_speed = 1000;
var game_row_block_count = []
var game_board = []
var game_layer_to_destroy_index = 0;
var game_score = 0;
var pause = false;
var game_over = false;

const draw_square = function(row, col, color) {
    game_board[row][col] = color;
    game_context.fillStyle = color;
    game_context.fillRect(row*BLOCK_SIZE, col*BLOCK_SIZE, 
                        BLOCK_SIZE, BLOCK_SIZE);
    game_context.strokeStyle = "black";
    game_context.strokeRect(row*BLOCK_SIZE, col*BLOCK_SIZE, 
                            BLOCK_SIZE, BLOCK_SIZE);
}

const draw_board = function() {
    for(let row=0; row<SIZE; row++) {
        for(let col=0; col<SIZE; col++) {
            draw_square(row, col, game_board[row][col])
        }
    }
}

const layer_blackout = function() {
    let index = game_layer_to_destroy_index;
    for(let col=0; col<SIZE; col++) {
        game_board[col][index] = BLOCK_DEAD_COLOR;
        draw_square(col, index, BLOCK_DEAD_COLOR);
    }
}

const destroy_board_layer = function() {
    let index = game_layer_to_destroy_index;
    for(let layer=index; layer>0; layer--) {
        for(let col=0; col<SIZE; col++) {
            game_board[col][layer] = game_board[col][layer-1];
            game_row_block_count[layer] = game_row_block_count[layer-1];
        }
    }

    draw_board();
    pause = false;
}

// Support functions
const valid_position = function(x, y) {
    if(x < 0)
        return false;
    if(y < 0)
        return false;
    if(x >= SIZE)
        return false;
    if(y >= SIZE)
        return false;
    return true;
}

const max = function(a, b) {
    return (a>b) ? a : b;
}

const fall = function(game) {
    setInterval(function() { game.down(); }, game_speed);
}

class Game {
    generate = function() {
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.type = TYPES[Math.floor(Math.random() * TYPES.length)];
        this.size_x = this.type[0].length
        this.size_y = this.type[0][0].length
        this.pos_x = Math.floor(Math.random() * (SIZE-this.size_x));
        this.pos_y = 0;
        this.state = 0; 
    }

    constructor() {
        this.generate();
    }

    draw = function() {
        for(let x=0; x<this.size_x; x++) {
            for(let y=0; y<this.size_y; y++) {
                if(this.type[this.state][x][y] == 1) {
                    draw_square(this.pos_x + x, this.pos_y + y, this.color);
                }
            }
        }
    }

    check = function(x, y, state) {
        var shape = this.type[state];
        for(let i=0; i<this.size_x; i++) {
            for(let j=0; j<this.size_y; j++) {
                if(shape[i][j] == 1 && !valid_position(y+j, x+i, state))
                    return false;
            }
        }
    
        return true;
    }

    check_height = function() {
        for(let x=0; x<SIZE; x++) {
            for(let y=0; y<SIZE; y++) {
                if(game_board[y][x] != BLOCK_EMPTY_COLOR) {
                    return (SIZE - x);
                }
            }
        }
    }

    restart = function() {
        clearInterval(this.timer);
    
        let height = this.check_height();
        if(height >= SIZE-1) {
            game_over = true;
            console.log("Game Over!");
    
            var request = new XMLHttpRequest();
            var path = "http://localhost:8000/api/results";
            var player = prompt("Please enter your name:", "");
            if(player != "") {
                request.open("POST", path, true);
                request.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
                request.send('{"name": "' + player + '", "score": ' + game_score + '}'); 
            }
    
            clearInterval(this.timer);
            start();
            location.reload();
            return;
        }
    
        for(let x=0; x<this.size_x; x++) {
            for(let y=0; y<this.size_y; y++) {
                if(this.type[this.state][x][y] == 1) {
                    game_row_block_count[this.pos_y+y]++;
                    if(game_row_block_count[this.pos_y+y] >= SIZE) {
                        game_layer_to_destroy_index = this.pos_y+y;
    
                        game_score++;
                        const score = document.getElementById("scorevalue");
                        score.textContent = ("Score: " + game_score);
                        game_speed = game_speed * 0.9;
    
                        setTimeout(layer_blackout, 100);
                        setTimeout(destroy_board_layer, 1000);
                        pause = true;
                    }
                }
            }
        }
    
        this.generate();
    }

    collision = function() {
        let shape = this.type[this.state];
        let bottoms = [];
        let max_bottom = undefined;
        for(let i=0; i<this.size_x; i++) {
            bottoms[i] = undefined;
            for(let j=this.size_y-1; j>=0; j--)
                if(shape[i][j] == 1) {
                    bottoms[i] = j;
                    max_bottom = max(max_bottom, j);
                    break;
                }
        }
    
        if(this.pos_y + max_bottom + 1 >= SIZE)
            return true;
    
        for(let i=0; i<this.size_x; i++) {
            let b = bottoms[i];
            if(b == undefined)
                continue;
            if(this.pos_x+i >= 0
                && this.pos_y + b + 1 >= 0
                && this.pos_x+i < SIZE 
                && this.pos_y + b + 1 < SIZE
                && game_board[this.pos_x+i][this.pos_y + b + 1] != BLOCK_EMPTY_COLOR)
                return true;
        }
    
        return false;
    }

    update = function(x, y, state) {
        if(pause)
            return;
    
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

    up = function() {
        let new_y = this.pos_y-1;
        this.update(this.pos_x, new_y, this.state);
    }

    down = function() {
        let new_y = this.pos_y+1;
        this.update(this.pos_x, new_y, this.state);
    }

    left = function() {
        let new_x = this.pos_x-1;
        this.update(new_x, this.pos_y, this.state);
    }

    right = function() {
        let new_x = this.pos_x+1;
        this.update(new_x, this.pos_y, this.state);
    }

    rotate = function() {
        // There are 4 states for every piece
        let new_state = this.state+1;
        if(new_state == 4)
            new_state = 0;
        this.update(this.pos_x, this.pos_y, new_state);
    }
}

game = new Game();

// keyboard listener
document.addEventListener('keydown', function(event) {
    if(game_over)
        return;

    if(event.keyCode == 37) {
        game.left();
    }
    else if(event.keyCode == 39) {
        game.right();
    }
    else if(event.keyCode == 38) {
        //game.up();
    } else if(event.keyCode == 40) {    
        game.down();
    } else if(event.keyCode == 32) {
        game.rotate();
    }
});

const start = function() {
    // set default block colors and row block count to zero
    game_over = false;
    for(let row=0; row<SIZE; row++) {
        game_board[row] = [];
        game_row_block_count[row] = 0;
        for(let col=0; col<SIZE; col++) {
            game_board[row][col] = BLOCK_EMPTY_COLOR;
        }
    }

    draw_board();
    game_score = 0;
    const score = document.getElementById("scorevalue");
    score.textContent = ("Score: " + game_score);
    game.draw();
    fall(game);
}

start()