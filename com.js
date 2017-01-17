function Board(d, x) {
    this.length = d;
    for(var i = 0; i < d; i++) {
        this[i] = [];
        for(var j=0;j<d;j++){
            this[i][j] = (x && x[i][j]) || 0;
        }
    }
}
var MAP = {};
MAP[-1] = "o";
MAP[1] = "X";
MAP[0] = " ";

function $(id) {
    return document.getElementById(id);
}

function getID(i, j) {
        return "b" + i + "_" + j;
}

Board.prototype = {
    each: function(f) {
        for (var i = 0; i < this.length; i++) {
            for (var j = 0; j < this.length; j++) {
                f.call(this, i, j, this[i][j]);
            }
        }
    },
    toHTML: function() {
        var ret = [];
        for(var i = 0; i < this.length; i++) {
            var row = [];
            for(var j = 0; j < this.length; j++) {
                row[j] = "<td id='"+getID(i,j)+"'>"+MAP[this[i][j]]+"</td>";
            }
            ret[i] = "<tr>" + row.join("") + "</tr>";
        }
        return "<table>" + ret.join("") + "</table>";
    },
    map: function(f) {
        var ret = [];
        for(var i=0;i<this.length;i++){
            ret[i] = f(this[i], i);
        }
        return ret;
    },
    draw: function() {
        document.getElementById("board").innerHTML = this.toHTML();
        var me = this;
        this.each(function(i, j, v) {
            $(getID(i,j)).onclick = function() {
                choose(i, j);
            };
        });

    },
    clone: function() {
        return new Board(this.length, this);
    },
    getScore: function() {
        var diagA = 0;
        var diagB = 0;
        var cols = [];
        var rows = [];
        for (var i = 0; i < this.length; i++) {
            var row = this[i];
            diagA += row[i];
            diagB += row[this.length - i - 1];
            for (var j = 0; j < this.length; j++) {
                cols[j] = (cols[j] || 0) + row[j];
                rows[i] = (rows[i] || 0) + row[j];
            }
        }
        var N = this.length;
        if (diagA == N || diagB == N) {
            return 1
        }
        if (diagA == -N || diagB == -N) {
            return -1;
        }
        for (var i = 0; i < N; i++) {
            if (rows[i] == N) {
                return 1;
            }
            if (cols[i] == N) {
                return 1;
            }
            if (rows[i] == -N) {
                return -1;
            }
            if (cols[i] == -N) {
                return -1;
            }
        }
        return 0;
    },
    getMoves: function() {
        var ret = [];
        if(this.getScore()) {
            return ret;
        }
        this.each(function(i, j, v) {
            if(!v) {
                ret.push({
                    row: i,
                    column: j
                })
            }
        });
        return ret;
    },
    hash: function() {
        return this.map(function(row){
            return row.map(function(v) {
                return MAP[v]; }).join("");
        }).join(":");
    }

};

function log() {
    var args = [];
    for(var i=0; i< arguments.length; i++) {
        args[i] = arguments[i] + "";
    }
    $("msg").innerHTML += args.join(", ") + "<br/>";
}
function clearLog() { $("msg").innerHTML = ""; }

function choose(i, j) {
    var move = s.board.getMoves().filter(function(v){
        return v.row == i && v.column == j;
    })[0];
    if(!move) {
        log("bad move :", i, j);
        return;
    }
    s.play(move);
    s.draw();
    //log(minimax(s));
}

function State(state) {
    if(state) {
        this.board = state.board.clone();
        this.turn = state.turn;
    } else {
        this.board = new Board(5);
        this.turn = 1;
    }
}

State.prototype = {
    clone: function() {
        return new State(this);
    },
    play: function(move) {
        this.board[move.row][move.column] = this.turn;
        this.turn = -this.turn;
        var score = this.board.getScore();
        if (score) {
            log(MAP[score] + " wins");
            return;
        }
        var moves = this.board.getMoves();
        if(!moves.length) {
            log("stalemate");
            return;
        }
        return this;
    },
    draw: function() {
        this.board.draw();
        log("go ", MAP[this.turn]);
    },
    hash: function() {
        return this.board.hash() + this.turn;
    }
};

var MAX_DEPTH = 8;

function Set(copy) {
    this.data = {};
    if(copy) {
        for (var k in copy.data) { this.data[k] = copy.data[k]; }
    }
}

Map.prototype =
Set.prototype = {
    add: function(o) {
        this.data[o.hash()] = o;
    },
    remove: function(o) {
        delete this.data[o.hash()];
    },
    get: function(o) {
        return this.data[o.hash()];
    }
}

function _minimax(state, depth, max) {
    var choices = state.board.getMoves();
    if (depth == MAX_DEPTH || choices.length == 0) {
        return {
            value: state.board.getScore(),
            path: []
        }
    }
    if (max) {
        var best = {
            value: -Infinity
        }
        for (var i = 0; i < choices.length; i++) {
            var choice = choices[i];
            var nextState = state.clone().play(choice);
            var ret = _minimax(nextState, depth + 1, false);
            if (ret.value > best.value) {
                best = {
                    value: ret.value,
                    choice: choice,
                    path: ret.path
                }
            }
        }
        return {
            path: prepend(best.choice, best.path),
            value: best.value
        };
    } else {
        var best = {
            value: +Infinity
        }
        for (var i = 0; i < choices.length; i++) {
            var choice = choices[i];
            var nextState = state.clone().play(choice);
            var ret = _minimax(nextState, depth + 1, true);
            if (ret.value < best.value) {
                best = {
                    value: ret.value,
                    choice: choice,
                    path: ret.path
                };
            }
        }
        return {
            path: prepend(best.choice, best.path),
            value: best.value
        };
    }
}

function prepend(choice, array) {
    var ret = [choice];
    for(var i=0;i<array.length;i++) {
        ret[i+1] = array[i];
    }
    return ret;
}

function minimax(state) {
    _minimax(state, 0, true);
}

Array.prototype.clone = function() {
    var ret = [];
    for(var i = 0; i < this.length; i++) {
        var v = this[i];
        if(Object(Object(v).clone) instanceof Function) {
            v = v.clone();
        }
        ret[i] = v;
    }
    return ret;
};




function MCTS(options) {
    options = options || {};
    this.states = [];
    this.maxTime = options.maxTime;
    this.maxMoves = options.maxMoves;
}

MCTS.prototype = {
    addState: function(state) {
        this.states.push(state);
        this.wins = [];
        this.plays = [];
    },
    getMove: function() {
        return new Promise(function(resolve, reject) {
            var stopTime = new Date().getTime() + this.maxTime;
            while(new Date().getTime() < stopTime) {
                this.runSimulation();
            }
            resolve("done");
        });
    },
    runSimulation: function() {
        var visited = new Set();
        var states = this.states.clone();
        var state = states[states.length - 1];
        var expand = true;
        for(var t = 0; t < this.maxMoves; t++) {
            var moves = state.board.getMoves();
            var choice = this.choose(moves);
            var nextState = state.clone().play(choice);
            states.push(choice);

            if (expand) {
            }

            if(nextState.board.getScore()) {
                break;
            }
        }
    }
};

function go() {
    s = new State();
    s.draw();
    log("hash=", s.board.hash());
}