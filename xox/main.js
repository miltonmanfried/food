(function(main, xox, ui, ai) {
var State = xox.State;

function go() {
    window.s = new State();
    window.m = new ai.MCTS();
    ui.drawState(window.s);
    util.log("hash=", window.s.board.hash());
}

main.go = go;
})(window.main = window.main || {}, window.xox = window.xox || {}, window.ui = window.ui || {}, window.ai = window.ai || {});