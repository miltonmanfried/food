(function(xox) {
var BOARD_SIZE = xox.boardSize || 3;

var SQUARE_TO_STRING = {};
SQUARE_TO_STRING[-1] = "O";
SQUARE_TO_STRING[0] = "_";
SQUARE_TO_STRING[1] = "X";

function Board(d, x) {
    this.length = d;
    for(var i = 0; i < d; i++) {
        this[i] = [];
        for(var j=0;j<d;j++){
            this[i][j] = (x && x[i][j]) || 0;
        }
    }
}

Board.getSquareString = function(v) {
	return SQUARE_TO_STRING[v];
}

function Move(row, column) {
	this.row = row;
	this.column = column;
}

Move.prototype = {
	toString: function() {
		return "(" + this.row + ", " + this.column + ")";
	}
};

Board.prototype = {
    each: function(f) {
        for (var i = 0; i < this.length; i++) {
            for (var j = 0; j < this.length; j++) {
                f.call(this, i, j, this[i][j]);
            }
        }
    },
    map: function(f) {
        var ret = [];
        for(var i=0;i<this.length;i++){
            ret[i] = f(this[i], i);
        }
        return ret;
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
                ret.push(new Move(i, j));
            }
        });
        return ret;
    },
    hash: function() {
        return this.map(function(row){
            return row.map(Board.getSquareString).join("");
        }).join(":");
    },
    toString: function() {
		return this.hash();
    }
    
};

function State(state) {
    if(state) {
        this.board = state.board.clone();
        this.turn = state.turn;
    } else {
        this.board = new Board(BOARD_SIZE);
        this.turn = 1;
    }
}

var count = 0;
var slog_last = new Date().getTime();
var slog_first = slog_last;

function slog(msg) {
	count++;
	var now = new Date().getTime();
	if ((now - slog_last) < 2000) return;
	slog_last = now;
	console.debug(count, count / slog_first, msg);
}
window.slog=slog;
State.prototype = {
    clone: function() {
        return new State(this);
    },
    undo: function(move) {
		this.board[move.row][move.column] = 0;
		this.turn = -this.turn;
		return this;
    },
    play: function(move) {
        this.board[move.row][move.column] = this.turn;
        this.turn = -this.turn;
        var score = this.board.getScore();
        if (score) {
//            util.log(Board.getSquareString(score) + " wins");
            return this;
        }
        var moves = this.board.getMoves();
        if(!moves.length) {
//            util.log("stalemate");
            return this;
        }
        return this;
    },
    hash: function() {
        return this.board.hash() + this.turn;
    },
    toString: function() {
		return this.hash();
    },
    spaces: function() {
		var count = 0;
		this.board.each(function(i, j, v) {
			if(v) count++;
		});
		return count;
    },
    buildTree: function() {
		var me = this;
		var temp = me;
		var ret = [];
		while(temp) {
			ret.push("" + temp);
			temp = temp.parent;
		}
		slog("buildTree:" + ret.join(" -> "));
		var moves = me.board.getMoves();
		var score = me.board.getScore();
		if (score == 1) {
			me.x = 1;
			me.o = 0;
			me.draw = 0;
			return me;
		} else if (score == -1) {
			me.o = 1;
			me.x = 0;
			me.draw = 0;
			return me;
		} else if (moves.length == 0) {
			me.x = 0;
			me.o = 0;
			me.draw = 1;
			return me;
		}
		var x = 0;
		var o = 0;
		var draw = 0;
		var xo = {};
		xo[-1] = "o";
		xo[1] = "x";
		me.children = moves.map(function(move) {
			var child = me.clone().play(move);
			child.parent = me;
			child.buildTree();
			x += child.x;
			o += child.o;
			draw += child.draw;
			return child;
		});
		var total = x + o + draw;
		me.total = total;
		me.x = x;
		me.o = o;
		me.draw = draw;
		me.wins = me[xo[-me.turn]];
		me.lose = me[xo[me.turn]];
		me.diff = me.wins - me.lose;
		me.ratio = me.diff / total;
		return me;
    }
};

xox.Board = Board; // TODO: remove

xox.State = State;


})(window.xox = window.xox || {});
