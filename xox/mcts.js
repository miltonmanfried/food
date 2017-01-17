(function(ai) {

var Map = util.Map;
var log = util.log;

function MCTS(options) {
    options = options || {};
    var defaults = {
		maxDepth: 0,
		maxTime: 5000,
		maxMoves: 100000,
		C: 1.4
    };
    for (var k in defaults) {
		if (!(k in options)) {
			options[k] = defaults[k];
		}
    }
    this.states = [];
    this.maxDepth = options.maxDepth;
    this.maxTime = options.maxTime;
    this.maxMoves = options.maxMoves;
    this.C = options.C;
    this.wins = [];
    this.wins[-1] = new Map();
    this.wins[1] = new Map();
    this.plays = [];
    this.plays[-1] = new Map();
    this.plays[1] = new Map();
}

MCTS.prototype = {
    addState: function(state) {
        this.states.push(state);
    },
    choose: function(choices) {
		var n = Math.floor(Math.random() * choices.length);
		return choices[n];
    },
    getMove: function() {
        var me = this;
        return new Promise(function(resolve, reject) {
			console.debug("getMove()?  me.states=", me.states);
            var stopTime = new Date().getTime() + me.maxTime;
			// me.maxDepth = 0?
			var state = me.states[me.states.length - 1];
			var player = state.turn;
			var moves = state.board.getMoves();
			
            if (!moves || moves.length == 0) {
				return null;
            }
            if (moves.length == 1) {
				return moves[0];
            }
            
            var games = 0;

            while(new Date().getTime() < stopTime) {
				console.debug("runSimulation #" + games + "; " + (stopTime - new Date().getTime()) + "ms left");
                me.runSimulation();
                games++;
            }
            
            var best = {percent: -1};
            
            var sortedMoves = moves.map(function(move) {
				var moveState = state.clone().play(move);
				
				var numWins = me.wins[state.turn].get(moveState);
				var numPlays = me.plays[state.turn].get(moveState);
				var percent = 100.0 * (numWins || 0) / (numPlays || 1);
				var ret = {
					percent: percent,
					move: move,
					state: moveState,
					plays: numPlays
				};
				if (percent > best.percent) {
					best = ret;
				}
				return ret
            });
            
            sortedMoves.sort(function(a, b) {
				var diff = a.percent - b.percent;
				if (diff > 0) {
					return -1;
				} else if (diff < 0) {
					return 1;
				} else {
					var d2 = a.plays - b.plays;
					if (d2 > 0) {
						return -1;
					} else {
						return 1;
					}
					return 0;
				}
            });
            sortedMoves.forEach(function(v, i) {
				console.debug(i, Math.floor(v.percent) + "%", v.move, v.state.hash());
            });
            resolve(best);
        });
    },
    mySimulate: function(startState) {
		var me = this;
		var result = "stalemate";
		var nextState = startState;
		var path = [];
		for (var i = 0; i < me.maxMoves; i++) {
			var moves = nextState.board.getMoves();
			if (moves.length == 0) {
				console.error("no moves from " + nextState);
				break;
			}
			var movesAndStates = [];
			var nextMove = me.choose(moves);
			nextState = nextState.clone().play(nextMove);
			path.push({
				move: nextMove,
				state: nextState
			});
			var score = nextState.board.getScore();
			if (score) {
				result = score;
				break;
			}
		}
		console.debug("path:" + startState);
		for (var i = 0; i < path.length; i++) {
			var p = path[i];
			var state = p.state;
			console.debug("-> (" + p.move + ") ->" + p.state);
			this.plays[startState.turn].increment(state);
			if (result != "stalemate") {
				this.wins[result].increment(state);
			}
		}
    },
    findBestForState: function(state) {
		var legalMoves = state.board.getMoves();
		var me = this;
		var ratios = legalMoves.map(function(move) {
			var nextState = state.clone().play(move);
			var plays = me.plays[state.turn].get(nextState);
			var wins = me.wins[state.turn].get(nextState) || 0;
			var losses = me.wins[-state.turn].get(nextState) || 0;
			var diff = wins - losses;
			var ratio;
			if (!plays || !diff) {
				ratio = 0;
			} else {
				ratio = diff / plays;
			}
			return {
				ratio: ratio,
				wins: wins,
				losses: losses,
				plays: plays,
				move: move,
				state: nextState
			};
		});
		ratios.sort(function(a, b) {
			if (a.ratio < b.ratio) {
				return 1;
			} else if (a.ratio > b.ratio) {
				return -1;
			} else {
				if (a.plays < b.plays) {
					return 1;
				} else {
					return -1;
				}
			}
		});
		ratios.forEach(function(v, i) {
			console.debug(i, Math.floor(v.ratio * 100) + "% (" + v.wins + "/" + v.plays + ")", v.move + " -> " + v.state);
		});
		return ratios[0].move;
    },
    runSimulation: function() {
		var me = this;
		var visited = new Map();
        var states = me.states.clone();
        var nextState = states[states.length - 1];
        var player = nextState.turn;
        var winner;
        var expand = true;
        var choice;
        
        for(var t = 0; t < me.maxMoves; t++) {
            var moves = nextState.board.getMoves();
            if (moves.length == 0) {
				break;
            }
            var movesAndStates = [];
            var states = moves.map(function(move) {
				var state = nextState.clone().play(move);
				var wins = me.wins[player].get(state) || 0;
				var plays = me.plays[player].get(state) || 1;
				var ratio = wins / plays;
				movesAndStates.push({
					move: move,
					state: state,
					plays: plays,
					wins: wins,
					ratio: ratio
				});
				return state;
			});
			if (me.plays[player].containsAll(states)) {
				var total = 0;
				me.plays[player].forMatches(states, function(state, num) {
					total += num;
				});
				var logTotal = total == 0 ? 0 : Math.log(total);
				var best = { value: -1 };
				movesAndStates.forEach(function(v) {
					var value = v.ratio + me.C * Math.sqrt(logTotal / v.plays);
					v.value = value;
					if (value > best.value) {
						best = v;
					}
				});
				choice = best.move;
				nextState = best.state;
			} else {
				choice = me.choose(moves);
				nextState = nextState.clone().play(choice);
			}
			
            states.push(choice);

            if (expand && !me.plays[player].contains(nextState)) {
				expand = false;
				me.plays[player].put(nextState, 0);
				me.wins[player].put(nextState, 0);
            }
            
            visited.put(nextState, player);

			player = nextState.turn;
			
			winner = nextState.board.getScore();
			if(winner) {
				break;
			}
        }
        visited.pairs(function(state, player) {
			if (!me.plays[player].contains(state)) {
				return;
			}
			var count = me.plays[player].get(state);
			me.plays[player].put(state, count + 1);
			if (winner && player == winner) {
				var winCount = me.wins[player].get(state) + 1;
				me.wins[player].put(state, winCount);
			}
        });
    },
    getStats: function(player) {
		var wins = this.wins[player];
		var plays = this.plays[player];
		var out = [];
		plays.pairs(function(state, playCount) {
			var winCount = wins.get(state);
			console.debug("state=" + state + "; playCount=" + playCount + "; winCount=" + winCount);
			var ratio = (winCount || 0) / (playCount || 1);
			out.push({
				state: state,
				plays: playCount || 0,
				wins: winCount || 0,
				ratio: ratio
			});
		});
		out.sort(function(a, b) {
			if (a.ratio < b.ratio) {
				return -1;
			} else if (a.ratio > b.ratio) {
				return 1;
			} else {
				return 0;
			}
		});
		out.forEach(function(v) {
			console.debug(Math.floor(v.ratio * 100) + "%", v.wins, v.plays, v.state+"");
		});
    }
};

ai.MCTS = MCTS;

})(window.ai = window.ai || {});