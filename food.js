
var TYPE_EMPTY = 0;
var TYPE_ROAD = 1;
var TYPE_HOUSE = 2;
var TYPE_BEER = 3;
var TYPE_SODA = 4;
var TYPE_LEMONADE = 5;

var ROAD_IMAGE = {
	NS: "road-ns.png",
	EW: "road-ew.png",
	NE: "road-ne.png",
	SE: "road-se.png",
	SW: "road-sw.png",
	NW: "road-nw.png",
	ESW: "road-esw.png",
	NSW: "road-nsw.png",
	ENW: "road-enw.png",
	ENS: "road-ens.png",
	ENSW: "road-ensw.png"
};

var ROTATED_IMAGE = {};
ROTATED_IMAGE[ROAD_IMAGE.NS] = ROAD_IMAGE.EW;
ROTATED_IMAGE[ROAD_IMAGE.EW] = ROAD_IMAGE.NS;

ROTATED_IMAGE[ROAD_IMAGE.NE] = ROAD_IMAGE.SE;
ROTATED_IMAGE[ROAD_IMAGE.SE] = ROAD_IMAGE.SW;
ROTATED_IMAGE[ROAD_IMAGE.SW] = ROAD_IMAGE.NW;
ROTATED_IMAGE[ROAD_IMAGE.NW] = ROAD_IMAGE.NE;

ROTATED_IMAGE[ROAD_IMAGE.ENSW] = ROAD_IMAGE.ENSW;

ROTATED_IMAGE[ROAD_IMAGE.ESW] = ROAD_IMAGE.NSW;
ROTATED_IMAGE[ROAD_IMAGE.NSW] = ROAD_IMAGE.ENW;
ROTATED_IMAGE[ROAD_IMAGE.ENW] = ROAD_IMAGE.ENS;
ROTATED_IMAGE[ROAD_IMAGE.ENS] = ROAD_IMAGE.ESW;

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

function Road(image) {
	this.image = image;
//	this.img = el("img");
//	this.img.src = image;
	this.type = TYPE_ROAD;
}

Road.prototype = new Square(TYPE_ROAD);

Road.prototype.clone = function() {
	var ret = new Road(this.image);
	ret.id = this.id;
	if(this.overpass) {
		ret.overpass = this.overpass;
	}
	return ret;
};

Road.prototype.draw = function(el) {
	Square.prototype.draw.call(this, el);
	var colors = [
		"red",
		"green",
		"blue",
		"yellow",
		"orange",
		"gray",
		"purple",
		"cyan",
		"maroon"
	];
	if(this.id) {
		el.style.background = colors[this.id % colors.length];
	}
	el.style.background = "url(" + this.image + ")";
	//el.appendChild(this.img);
};

Road.prototype.rotate = function() {
	this.image = ROTATED_IMAGE[this.image];
	this.img = el("img");
	this.img.src = this.image;
	return this;
};

function V() {
	return new Road(ROAD_IMAGE.NS);
}

function H() {
	return new Road(ROAD_IMAGE.EW);
}

function T() {
	return new Road(ROAD_IMAGE.ESW);
}

function NSW() {
	return new Road(ROAD_IMAGE.NSW);
}

function X() {
	return new Road(ROAD_IMAGE.ENSW);
}

function NE() {
	return new Road(ROAD_IMAGE.NE);
}

function SE() {
	return new Road(ROAD_IMAGE.SE);
}

function NW() {
	return new Road(ROAD_IMAGE.NW);
}

function SW() {
	return new Road(ROAD_IMAGE.SW);
}
function Overpass() {
	var ret = new Road(ROAD_IMAGE.NS);
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

HouseSquare.prototype.draw = function(el) {
	console.error("HOUSEDRAW");
	Square.prototype.draw.call(this, el);
	el.innerHTML = "(" + this.id + ": " + this.square + ")";
}

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
	[NSW(), House(13, 2), House(13, 3), _(), _()],
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
			var _cell = el("td");
			var cell = el("div");
			cell.className = "mapCell";
			cell.id = "cell" + i + "_" + j;
			var square = map[i][j];
			square.draw(cell);
			_cell.appendChild(cell);
			row.appendChild(_cell);
		}
		tbl.appendChild(row);
	}
	return tbl;
}


function getBigMapTable(map, X, Y) {
	var tbl = el("table");
	el.className = "map";
	for (var I = 0; I < X; I++) {
		var i = I % map.length;
		var row = el("tr");
		row.className = "mapRow";
		row.id = "row" + i;
		for(var J = 0; J < Y; J++) {
			var j = J % map[i].length;
			var _cell = el("td");
			var cell = el("div");
			cell.className = "mapCell";
			cell.id = "cell" + i + "_" + j;
			var square = map[i][j];
			square.draw(cell);
			_cell.appendChild(cell);
			row.appendChild(_cell);
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

function rotateTile(tile) {
	var ret = [];
	for(var i = 0; i < tile.length; i++) {
		for(var j = 0; j < tile[i].length; j++) {
			ret[j] = (ret[j] || []);
			var clone = tile[i][j].clone();
			if (clone.rotate) clone.rotate();
			ret[j][tile.length - i - 1] = clone;
		}
	}
	return ret;
}

var tiles = [ tile00, tile01, tile02, tile10, tile11, tile12, tile20, tile21, tile22];

function rand(n) {
	return Math.floor(Math.random() * n);
}

var tmap = [];
for(var i = 0; i < 3; i++) {
	var row = [];
	tmap[i] = row;
	for (var j = 0; j < 3; j++) {
		var n = rand(tiles.length);
		var t = tiles.splice(n, 1)[0];
			var rotate = rand(4);
		while(rotate-- > 0) t = rotateTile(t);
		row[j] = t;
	}
}

var map = makeMap(tmap);

function $(id) { return document.getElementById(id); }

function drawMap(map) {
	$("map").appendChild(getMapTable(map));
}

function go() {
	tagRoads(map);
	tagBlocks(map);
	drawMap(map);
}
