
var TYPE_EMPTY = 0;
var TYPE_ROAD = 1;
var TYPE_HOUSE = 2;
var TYPE_BEER = 3;
var TYPE_SODA = 4;
var TYPE_LEMONADE = 5;

Array.prototype.clone = function() {
	var ret = [];
	for(var i = 0; i < this.length; i++) {
		var v = this[i];
		if (Object(Object(v).clone) instanceof Function) {
			v = v.clone();
		}
		ret[i] = v;
	}
	return ret;
}

function Square(type) {
	this.type = type;
}

Square.prototype = {
	draw: function(elt) {
		var colorMap = {};
		colorMap[TYPE_EMPTY] = "white";
		colorMap[TYPE_ROAD] = "gray";
		colorMap[TYPE_HOUSE] = "red";
		colorMap[TYPE_BEER] = "brown";
		colorMap[TYPE_SODA] = "green";
		colorMap[TYPE_LEMONADE] = "yellow";
		elt.style.background = colorMap[this.type];
		if (this.blockNumber) {
			elt.innerHTML = this.blockNumber+"";
		}
	},
	clone: function() {
		return new Square(this.type);
	}
};

function Empty() {
}

Empty.prototype = new Square(TYPE_EMPTY);

function Road(map) {
	this.map = map.map(function(exit) {
		var ret = {};
		for (var k in exit) {
			if (exit.hasOwnProperty(k)) {
				ret[k] = exit[k];
			}
		}
		return ret;
	});
	this.type = TYPE_ROAD;
}

Road.prototype = new Square(TYPE_ROAD);

Road.prototype.clone = function() {
	var ret = new Road(this.map);
	ret.id = this.id;
	if(this.overpass) {
		ret.overpass = this.overpass;
	}
	return ret;
};

Road.prototype.draw = function(el) {
	Square.prototype.draw.call(this, el);
	el.innerHTML = this.id;
};

Road.prototype.rotate =function() {
	return this;
};

function V() {
	return new Road([{
		N: "S",
		S: "N"
	}]);
}

function H() {
	return new Road([{
		E: "W",
		W: "E"
	}]);
}

function T() {
	return new Road([{
		S: "EW",
		E: "SW",
		W: "SE"
	}]);
}

function X() {
	return new Road([{
		N: "SEW",
		S: "NEW",
		E: "NSW",
		W: "NSE"
	}]);
}

function NE() {
	return new Road([{
		N: "E",
		W: "S"
	}]);
}

function SE() {
	return new Road([{
		S: "E",
		E: "S"
	}]);
}

function NW() {
	return new Road([{
		N: "W",
		W: "N"
	}]);
}

function SW() {
	return new Road([{
		S: "W",
		W: "S"
	}]);
}
function Overpass() {
	var ret = new Road([{
		N: "S",
		S: "N"
	}, {
		E: "W",
		W: "E"
	}]);
	ret.overpass = true;
	return ret;
}


function HouseSquare(id, square) {
	this.id = id;
	this.square = square;
}

HouseSquare.prototype = new Square(TYPE_HOUSE);
HouseSquare.prototype.clone = function() {
	return new HouseSquare(this.id, this.square);
};

function House(id, square) { return new HouseSquare(id, square); }

function _() { return new Empty() }

function Drink(drinkType) {
	this.type = drinkType;
}

Drink.prototype = new Square();

function Beer() { return new Drink(TYPE_BEER); }
function Lemonade() { return new Drink(TYPE_LEMONADE); }
function Soda() { return new Drink(TYPE_SODA); }

var tile00 = [
	[_(), _(), V(), House(12, 0), House(12, 1)],
	[_(), _(), V(), House(12, 2), House(12, 3)],
	[H(), H(), Overpass(), H(), H()],
	[_(), _(), V(), _(), _()],
	[_(), _(), V(), _(), _()]
];

var tile01 = [
	[_(), _(), V(), _(), _()],
	[_(), _(), V(), _(), _()],
	[H(), H(), T().rotate(), _(), _()],
	[_(), _(), V(), Beer(), _()],
	[_(), _(), V(), _(), _()]
	
];

var tile02 = [
	[SE(), H(), NW(), _(), _()],
	[V(), House(13, 0), House(13, 1), _(), _()],
	[V(), House(13, 2), House(13, 3), _(), _()],
	[V(), _(), _(), _(), _()],
	[NE(), H(), SW(), _(), _()]
];

var tile10 = [
	[_(), _(), V(), _(), _()],
	[_(), _(), V(), _(), _()],
	[H(), H(), X(), H(), H()],
	[_(), _(), V(), _(), _()],
	[_(), _(), V(), Soda(), _()]
];

var tile11 = [
	[_(), _(), V(), _(), _()],
	[_(), Soda(), V(), _(), _()],
	[H(), H(), T().rotate().rotate(), H(), H()],
	[_(), _(), _(), _(), _()],
	[_(), _(), _(), _(), _()],
];

var tile12 = [
	[_(), _(), NE(), H(), SW()],
	[_(), _(), _(), Lemonade(), V()],
	[SW(), _(), _(), _(), NE()],
	[V(), Beer(), _(), _(), _()],
	[NE(), H(), SW(), _(), _()]
];

var tile20 = [
	[SE(), H(), NW(), _(), _()],
	[V(), Soda(), _(), _(), _()],
	[NW(), _(), House(3, 0), House(3, 1), SE()],
	[_(), _(), House(3, 2), House(3, 3), V()],
	[_(), _(), SE(), H(), NW()]
];

var tile21 = [
	[_(), _(), V(), House(4, 0), House(4, 1)],
	[_(), _(), V(), House(4, 2), House(4, 3)],
	[H(), H(), X(), H(), H()],
	[_(), _(), V(), _(), _()],
	[_(), _(), V(), _(), _()]
];

var tile22 = [
	[_(), _(), V(), _(), _()],
	[_(), _(), V(), _(), _()],
	[H(), H(), X(), H(), H()],
	[_(), _(), V(), Beer(), _()],
	[_(), _(), V(), _(), _()]
];

function makeMap(tiles) {
	var ret = [];
	for(var i = 0; i < tiles.length; i++) {
		var tileRow = tiles[i];
		for(var j = 0; j < tileRow.length; j++) {
			var tile = tiles[i][j];
			var tileRowOffset = i * 5;
			var tileColumnOffset = j * 5;
			for (var ii = 0; ii < tile.length; ii++) {
				if (!ret[ii + tileRowOffset]) {
					ret[ii + tileRowOffset] = [];
				}
				for(var jj = 0; jj < tile[ii].length; jj++) {
					var square = tile[ii][jj];
					ret[ii + tileRowOffset][jj + tileColumnOffset] = square.clone();
				}
			}
		}
	}
	return ret;
}

function el(tag) {
	return document.createElement(tag);
}

function getMapTable(map) {
	var tbl = el("table");
	el.className = "map";
	for (var i = 0; i < map.length; i++) {
		var row = el("tr");
		row.className = "mapRow";
		row.id = "row" + i;
		for(var j = 0; j < map[i].length; j++) {
			var cell = el("td");
			cell.className = "mapCell";
			cell.id = "cell" + i + "_" + j;
			var square = map[i][j];
			square.draw(cell);
			row.appendChild(cell);
		}
		tbl.appendChild(row);
	}
	return tbl;
}


function getDX(dir) {
	var map = {
		N: 0,
		S: 0,
		E: 1,
		W: -1
	};
	return map[dir];
}

function getDY(dir) {
	var map = {
		N: -1,
		S: 1,
		E: 0,
		W: 0
	};
	return map[dir];
}

function tagRoads(map) {
    var numRoads = 0;
    for(var i = 0; i < map.length; i++) {
        for(var j= 0; j < map[i].length; j++) {
			var cell = map[i][j];
			if (cell.type != TYPE_ROAD) continue;
			if (cell.id) continue;
			if (cell.overpass) continue;
			console.debug("tagging new road:", i, j, numRoads+1, cell);
			followRoad(cell, map, i, j, ++numRoads);
        }
    }
}

function followRoad(cell, map, i, j, id, pdi, pdj) {
	if(cell.overpass) {
		console.error("OVERPASS tagging ", i, j, " -> ", id);
		cell.id = "";
	} else {
		cell.id = id;
		console.debug("tagging ", i, j, " -> ", id);
    }
    for(var di = -1; di <= 1; di++) {
        for(var dj = -1; dj <= 1; dj++) {
            if(di && dj || di == dj) continue;
            var ii=i+di;
            var jj=j+dj;
            if(ii<0||ii>=map.length) continue;
            var row = map[ii];
            if(jj<0||jj>=row.length) continue;
            if (cell.overpass) {
				// can only exit an overpass the way you came in
				if (di != pdi || dj != pdj) {
					console.error("Skipping ", di, dj, " for overpass because ", pdi, pdj);
					continue;
				}
            }
            var next = row[jj];
            if (next.type != TYPE_ROAD) continue;
            if (next.id) continue;
            
            followRoad(next, map, ii, jj, id, di, dj);
        }
    }
}

function tagBlocks(map) {
    var numBlocks = 0;
    for(var i = 0; i < map.length; i++) {
        for(var j= 0; j < map[i].length; j++) {
			var cell = map[i][j];
			if (cell.type == TYPE_ROAD) continue;
			if (cell.blockNumber) continue;
			console.debug("tagging new block:", i, j, numBlocks+1, cell);
			followBlock(cell, map, i, j, ++numBlocks);
        }
    }
}

function followBlock(cell, map, i, j, blockNumber) {
	cell.blockNumber = blockNumber;
	console.debug("tagging ", i, j, " -> ", blockNumber);
    for(var di = -1; di <= 1; di++) {
        for(var dj = -1; dj <= 1; dj++) {
            if(di && dj || di == dj) continue;
            var ii=i+di;
            var jj=j+dj;
            if(ii<0||ii>=map.length) continue;
            var row = map[ii];
            if(jj<0||jj>=row.length) continue;
            var next = row[jj];
            if (next.type == TYPE_ROAD) continue;
            if (next.blockNumber) continue;
            
            followBlock(next, map, ii, jj, blockNumber);
        }
    }
}

/*
function tagRoads(map) {
`	var numRoads = 0;
	for (var i = 0; i < map.length; i++) {
		for (var j = 0; j < map[i].length; j++) {
			console.debug("tagRoads", i, j);
			var cell = map[i][j];
			if (cell.type != TYPE_ROAD || cell.id) {
				continue;
			}
			var toSearch = {};
			cell.exits.forEach(function(exit) {
				var newID = ++numRoads;
				console.debug("new road:", i, j, inDir);
				"NSEW".split("").forEach(function(inDir) {
					if (!exit[inDir]) return;
					followRoad(map, cell, i, j, inDir, newID);
				});
			});
		}
	}
}

function followRoad(map, cell, i, j, inDir, id) {
	console.debug("followRoad(", i, j, inDir, id, ")");
	cell.id = id;
	var outDirs = cell.map[inDir].split("").forEach(function(outDir) {
		var dx = getDX(outDir);
		var dy = getDY(outDir);
		var ii = i + dx;
		var jj = j + dy;
		if (ii < 0 || ii >= map.length) return;
		if (jj < 0 || jj >= map[ii].length) return;
		var nextCell = map[ii][jj];
		if (nextCell.type != TYPE_ROAD) return;
		console.debug("following road " + outDir + " to ", i, j);
		followRoad(map, nextCell, ii, jj, outDir, id);
	});
}
*/

function $(id) { return document.getElementById(id); }

function drawMap(map) {
	$("map").appendChild(getMapTable(map));
}
