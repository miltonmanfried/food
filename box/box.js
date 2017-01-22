bai = require("./bai.js")

function State() { }
State.prototype.init = function(w, h) {
/*
 * ._._._._.    ..00..01..02..03..
 * | | | | |    10  11  12  13  14
 * .-.-.-.-. =  ..20..21..22..23..
 * | | | | |    30  31  32  33  34
 */
    if (!(h & 1)) {
        throw new Error("bad rows");
    }
    this.rows = [];
    for (var i = 0; i < h; i++) {
        this.rows[i] = [];
        for (var j = 0; j < w + (i & 1); j++) {
            this.rows[i][j] = false;
        }
        console.log(i, this.rows[i].length);
    }
    this.prev = {};
    this.index = 0;
    this.N = 2;
    return this;
};

function getOption(i, j) {
    return "(" + i + "," + j + ")";
}

function getIndices(option) {
    var ret = option.match(/\((\d+),(\d+)\)/);
    if (!ret) throw new Error("Bad option " + option);
    return [ ret[1], ret[2] ];
}

State.prototype.getOptions = function() {
    var ret = [];
    for (var i = 0; i < this.rows.length; i++) {
        for (var j = 0; j < this.rows[i].length; j++) {
            if (!this.rows[i][j]) {
                ret.push(getOption(i, j));
            }
        }
    }
    return ret;
};

State.prototype.getCell = function(i, j) {
    if (!(i & 1)) return null;
    if (j == this.rows[i].length - 1) return null;
    var I = Math.floor(i / 2);
    var J = j;
    return [ I, J ];
}

State.prototype.countClosed = function() {
    var count = 0;
    var me = this;
    var ret = {};
    for (var i = 0; i < (this.rows.length - 1) / 2; i++) {
        for (var j = 0; j < this.rows[0].length; j++) {
            var offset = i & 1;
            var neighbors = [
                [ i + offset, j ],
                [ i + offset + 1, j ],
                [ i + offset + 2, j ],
                [ i + offset + 1, j + 1]
            ];
            var allClosed = true;
            neighbors.forEach(function(neighbor) {
                var I = neighbor[0];
                var J = neighbor[1];
                if (I > me.rows.length) return;
                if (J > me.rows[I].length) return;
                if (!me.rows[I][J]) {
                    allClosed = false;
                    return;
                }
            });
            if (allClosed) {
                ret[getOption(i, j)] = true;
                count++;
            }
        }
    }
    this.count = count;
    return ret;
};

State.prototype.getFilledCells = function() {
    var ret = [];
    for (var i = 0; i < this.rows.length; i++) {
        ret[i] = [];
        for (var j = 0; j < this.rows.length; j++) {
            var opt = getOption(i, j);
            if (opt in this.prev) {
                ret[i][j] = (this.prev[opt] + 1) + "";
            } else {
                ret[i][j] = " ";
            }
        }
    }
    return ret;
};

function diff(prev, cur) {
    var ret = [];
    for (var k in cur) {
        if (!(k in prev)) {
            ret.push(k);
        }
    }
    return ret;
}

State.prototype.clone = function() {
    var ret = new State();
    ret.rows = this.rows.map(function(row) {
        return Array.apply([], row);
    });
    ret.count = this.count;
    ret.prev = JSON.parse(JSON.stringify(this.prev));
    ret.index = this.index;
    ret.N = this.N;
    return ret;
};

State.prototype.applyOption = function(option) {
    var me = this;
    var indices = getIndices(option);
    this.rows[indices[0]][indices[1]] = true;
    var changed = this.countClosed()
    var diffs = diff(this.prev, changed);
    if (diffs.length > 0) {
        diffs.forEach(function(elt) {
            me.prev[elt] = me.index;
        });
    } else {
        this.index = (this.index + 1) % this.N;
    }
    return this;
};

State.prototype.getScore = function(n) {
    var counts = [];
    for (var i = 0; i < this.N; i++) { counts[i] = 0; }
    for (var k in this.prev) {
        var index = this.prev[k];
        counts[index]++;
    }
    return counts;
}

State.prototype.isFinished = function() {
    return this.getOptions().length == 0;
}

State.prototype.getWinner = function() {
    var counts = this.getScore();
    var max = -1;
    var maxi;
    for (var i = 0; i < counts.length; i++) {
        if (counts[i] > max) {
            max = counts[i];
            maxi = i;
        }
    }
    return maxi;
}

State.prototype.draw = function() {
    var cells = this.getFilledCells();
    var me = this;
    return this.rows.map(function(row, i) {
        var w = "-";
        var x = "."
        if (i & 1) {
            w = "|";
            x = " ";
        }
        var ret = row.map(function(v, j) {
            var cellIndex = me.getCell(i, j);
            
            var next = x;
            if (cellIndex) {
                next = cells[cellIndex[0]][cellIndex[1]];
            }
            if (v) return w + next;
            return " " + next;
        }).join("");
        if (!(i & 1)) {
            return i + ":" + x + ret + x;
        } else {
            return i + ":" + ret;
        }
    }).join("\n");
}

function pick(list) {
    //return list[0];
    var i = Math.floor(Math.random() * list.length);
    return list[i];
}
/*
for(var count = 0; count < 17; count++) {
    var options = s.getOptions();
    s.applyOption(pick(options));
    console.log(s.draw());
    console.log("***", s.countClosed(), options.length);
}
*/
s = new State().init(5, 5);

var readline = require("readline");
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

ai = new bai.MCTS(s);

function pickAction() {
    if (s.index == 5) {
        return new Promise(function(resolve, reject) {
            rl.question("?", function(ret) {
                var indices;
                try {
                  indices = getIndices(ret);
               } catch(e) {
                    console.error(e);
                    return go();
                }
                 var options = s.getOptions();
                if (options.indexOf(ret) == -1) {
                   console.error("nope");
                    return pickAction().then(resolve).catch(reject);
               }
                return resolve(ret);
            });
        });
    } else {
         return ai.selectOption();
     }
}

function go() {
    console.log(s.draw());
    pickAction().then(function(ret) {
            console.log(s.index + " picked " + ret);
            ai.apply(ret);
            s.applyOption(ret);
            go();
    }).catch(function(err) {
           console.error("UNEXPECTED ERROR", err, err.stack);
            throw err;
    });
}

go();