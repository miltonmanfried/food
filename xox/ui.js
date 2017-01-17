(function(ui, util, xox) {

var log = util.log;
var $ = util.$;
var Board = xox.Board;

function choose(i, j) {
    var move = window.s.board.getMoves().filter(function(v){
        return v.row == i && v.column == j;
    })[0];
    if(!move) {
        log("bad move :", i, j);
        return;
    }
    window.s.play(move);
    drawState(window.s);
    //log(minimax(s));
}

function getID(i, j) {
	return "b" + i + "_" + j;
}

function getBoardHTML(board) {
	var ret = [];
	for(var i = 0; i < board.length; i++) {
		var row = [];
		for(var j = 0; j < board.length; j++) {
			row[j] = "<td id='"+getID(i,j)+"' class='boardCell'>"+Board.getSquareString(board[i][j])+"</td>";
		}
		ret[i] = "<tr>" + row.join("") + "</tr>";
	}
	return "<table>" + ret.join("") + "</table>";
}

function drawBoard(board, dest) {
	dest = dest || $("board");
	dest.innerHTML = getBoardHTML(board);
	board.each(function(i, j, v) {
		$(getID(i,j)).onclick = function() {
			choose(i, j);
		};
	});
}

function drawStateRaw(state, dest) {
	dest = dest || $("board");
	dest.innerHTML = getBoardHTML(state.board);
}

function drawState(state, dest) {
	dest = dest || $("board");
	drawBoard(state.board, dest);
	log("go ", Board.getSquareString(state.turn));
}

function getStats(state) {
	var total = state.x + state.o + state.draw;
	var winPercent = Math.floor(state.wins / total * 1000) / 10;
	var losePercent = Math.floor(state.lose / total * 1000) / 10;
	var drawPercent = Math.floor(state.draw / total * 1000) / 10;
	var ratio = Math.floor(state.ratio * 1000) / 10;
	return "<table class='stats'><tr><td>Win - lose:</td><td>" + state.diff + " (" + ratio + "%)</td></tr>" +
		"<tr><td>Wins:</td><td>" + state.wins + " (" + winPercent + "%)</td></tr>" + 
		"<tr><td>Lose:</td><td>" + state.lose + "(" + losePercent + "%)</td></tr>" + 
		"<tr><td>Draw:</td><td>" + state.draw + " (" + drawPercent + "%)</td></tr></table>";
}

function drawMove(state) {
	var div = "<div id='prevMove'></div><div id='thisMove'></div><div><table><tr id='nextMoves'></tr></table></div>";
	$("board").innerHTML = div;
	if(state.parent) {
		drawStateRaw(state.parent, $("prevMove"));
		$("prevMove").onclick = function() {
			console.debug("parent click");
			drawMove(state.parent);
		};
	}
	drawStateRaw(state, $("thisMove"));
	$("thisMove").innerHTML += getStats(state);
	var best = 0;
	state.children.map(function(child, i) {
		var id = "move_" + i;
		var newColumn = document.createElement("td");
		newColumn.id = id;
		$("nextMoves").appendChild(newColumn);
		//$("nextMoves").innerHTML += "<td id='" + id + "'></td>";
		drawStateRaw(child, $(id));
		$(id).innerHTML += getStats(child);
		$(id).onclick = function() {
			console.debug("child click " + id);
			drawMove(child);
		};
		if (child.ratio > state.children[best].ratio) {
			best = i;
		}
	});
	$("move_" + best).className += "best";
}

ui.drawState = drawState;
ui.choose = choose;
ui.drawMove = drawMove;
})(window.ui = window.ui || {}, window.util = window.util || {}, window.xox = window.xox || {});
