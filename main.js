var mainState;

(function(util) {

var $ = util.$;

function drawState(state) {
	drawBoard(state.board);
	drawTray(state.tray, $("tray"));
	drawPlayer(state.players[0], $("player1"));
	drawPlayer(state.players[1], $("player2"));
	drawBank(state.bank, $("bank"));
	var currentPlayer = state.getActivePlayer();
	if (currentPlayer == state.players[0]) {
		$("player1").style.border = "1px solid gold";
		$("player2").style.border = "none";
	} else {
		$("player2").style.border = "1px solid gold";
		$("player1").style.border = "none";
	}
}

function go() {
	mainState = new State().newGame(2);
	drawState(mainState);
}

function turn() {
	mainState.run().then(function(newState) {
		window.oldState = window.mainState;
		window.mainState = newState;
		drawState(mainState);
		turn();
	}).catch(function(err){
		console.error("bad", err);
	})
}

window.turn = turn;
window.go = go;
window.drawState = drawState;
})(window.util);
